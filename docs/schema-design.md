# TRIA Database Schema Design

## 1. Schema Overview

**Propósito e escopo:** schema Postgres/Supabase para o e-commerce TRIA — catálogo (produtos/protocolos), pedidos avulsos, assinaturas, e captura de leads. Baseado no modelo conceitual entregue pela Architecture (docs/architecture.md, Seções 4 e 7).

**Sistema alvo:** Supabase (Postgres 15+, gerenciado).

**Entidades principais:** `products`, `protocols`, `protocol_products` (junção única, corrigida nesta sessão — Seção 7.1 da Architecture), `orders`, `subscriptions`, `leads`, mais `auth.users` nativo do Supabase Auth.

**Escala esperada:** projeto em estágio de validação de demanda (PRD Goal 1: ≥50 checkouts em 4 semanas via tráfego orgânico de ~5k seguidores). Catálogo é praticamente estático (5 produtos, 3 protocolos, sem admin panel — PRD 2.4). `orders`/`subscriptions`/`leads` crescem devagar nesse estágio — nenhuma decisão de sharding/particionamento se justifica.

**Requisitos de performance:** sem budget formal (PRD NFR7) — meta informal de resposta de checkout <2s vem majoritariamente da latência do Stripe, não do banco (Architecture Seção 13.2). Catálogo pequeno o suficiente para nunca ser gargalo.

**Segurança e compliance:** RLS obrigatório em `orders`/`subscriptions` por `user_id` (Architecture 7.2); catálogo público sem RLS restritivo (decisão intencional, Architecture 7.3). LGPD: retenção de 12 meses + purga automática em `leads`, retenção de 5 anos fiscal em `orders`/`subscriptions`, anonimização (não DELETE) sob solicitação (PRD Seção 2.5, Architecture 13.1).

## 2. Domain Model

### Core Entities

**Product** — produto avulso do catálogo. Atributos e regra de negócio já definidos (Architecture 4.1). Sem ciclo de vida/transição de estado — é dado de referência seedado uma vez (Story 1.2), sem admin panel para edição.

**Protocol** — protocolo de assinatura, composto por múltiplos produtos (Architecture 4.2). Mesma natureza estática do Product — seedado, sem transição de estado.

**Order** — pedido avulso concluído (Architecture 4.3). Criado **exclusivamente** pelo webhook (nunca por escrita direta do client) — invariante de integridade, não só convenção. Única transição de estado prevista: `paid → refunded` (reembolso manual via Stripe, refletido por evento de webhook futuro — não coberto nas stories atuais, mas o campo `status` já comporta).

**Subscription** — estado da assinatura, também espelhado via webhook. **Única entidade com máquina de estado real:** `pending → active → past_due → canceled`, nunca otimista (Architecture 6.2/4.4) — a regra mais crítica de todo o domínio, já travada por teste (Architecture 14.3).

**Lead** — captura de contato do hero (Architecture 4.5). Sem transição de estado — existe do `createdAt` até a purga automática aos 12 meses (Story 1.7); não é atualizado, só criado e eventualmente apagado.

### Relationships

- `Protocol` ↔ `Product`: N:N via `protocol_products` (junção única, corrigida na Seção 7.1 da Architecture — consultada nas duas direções).
- `Order` → `Product`: N:1, obrigatório.
- `Subscription` → `Protocol`: N:1, obrigatório.
- `Order`/`Subscription` → `auth.users`: N:1. **Opcional** em `Order` (compra avulsa não exige login, FR8); **obrigatório na criação** em `Subscription` (gerenciar assinatura exige login, FR8) — mas nullable no schema físico após a criação, para permitir anonimização LGPD sem apagar o registro fiscal (constraint de coluna vs. regra de negócio detalhada na Seção 7).
- `Lead`: sem relacionamento com nenhuma outra entidade (Architecture 4.5 — confirmado, não é omissão).

### Bounded Contexts (informal — sem DDD formal, mas relevante para padrão de acesso)

Três agrupamentos com padrões de escrita muito diferentes, o que importa para RLS/índices na próxima seção:

1. **Catálogo** (`products`, `protocols`, `protocol_products`) — leitura pública massiva, escrita rara (só seed/migration, service role).
2. **Comércio** (`orders`, `subscriptions`) — escrita exclusiva via webhook (service role), leitura restrita por `user_id` (RLS).
3. **Crescimento** (`leads`) — escrita pública (qualquer visitante, sem auth), leitura restrita (nenhum usuário deveria conseguir ler a lista de leads de outra pessoa — ver achado de RLS na próxima seção).

> **📌 Item rastreado (confirmado com @po antes da seção de RLS):** `orders` com `user_id IS NULL` (compra avulsa sem login) nunca são expostas via client (`anon`/`authenticated`) — nenhuma policy de leitura cobre esse caso, de propósito. Os únicos leitores são: webhook (service role, escreve), Confirmation Page (lê direto do Stripe, Architecture 5.1 — nunca bate no Supabase pra esse dado), e DPO/suporte (service role, anonimização manual). A policy `USING (auth.uid() = user_id)` já bloqueia essas linhas pela semântica de `NULL = qualquer coisa`, mas será documentada como decisão explícita (`COMMENT ON POLICY`), não efeito colateral de comparação NULL — resolvido na Seção de Security Architecture.

## 3. Access Patterns & Query Requirements

### Primary Access Patterns

1. **Render de página de catálogo** (Home/About/Produtos/Assinatura, ISR `revalidate: 3600`) — `SELECT * FROM products/protocols` + join em `protocol_products`. Frequência efetiva baixa (cache de 1h absorve tráfego real); latência não-crítica graças ao ISR.
2. **Deep-link por slug** (`?item=`, Architecture 8.3) — busca a lista completa e resolve índice no Server Component (catálogo de 5-8 linhas, não justifica índice dedicado por slug ainda; `UNIQUE` em `slug` é suficiente para o momento).
3. **Criação de Checkout Session** (Story 2.3/2.4) — `SELECT` de 1 produto/protocolo por `id` para pegar `stripe_price_id`. Baixo volume (meta: ≥50/4 semanas), latência importa (<2s, Architecture 13.2) — indexado por PK, trivial.
4. **Processamento de webhook** (Story 2.2) — `INSERT` em `orders`/`subscriptions`; idempotência resolvida por `UNIQUE constraint` (não por `SELECT` prévio — evita race condition entre check-then-insert).
5. **Resumo de conta** (Story 3.3) — `SELECT` assinatura ativa + último pedido `WHERE user_id = auth.uid()`. Toda visita a `/conta` — precisa de índice em `user_id` nas duas tabelas.
6. **Histórico de pedidos** (Story 3.3) — `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC` — mesmo índice de `user_id`, mais ordenação por `created_at`.
7. **Troca/pausa/cancelamento de assinatura** (Story 3.4) — `SELECT` por `id` (snapshot pra rollback, Architecture 6.2) + `UPDATE status`. PK, trivial.
8. **Link cruzado FR5** (Product Page) — `SELECT protocols` via `protocol_products WHERE product_id = ?`, ordenado por `monthly_price_cents DESC LIMIT 1` (regra determinística já definida, Architecture 4.1).
9. **Purga automática de leads** (Story 1.7, LGPD) — `DELETE FROM leads WHERE created_at < now() - interval '12 months'`. Frequência: mensal (Cron), batch, sem usuário esperando resposta — latência não é crítica, mas o volume do `WHERE` pode crescer com o tempo (todo lead inativo acumulado desde o lançamento), por isso o índice em `leads.created_at` (já definido na Seção 7.2 da Architecture) existe especificamente para esta query — sem ele, seria table scan completo todo mês.

### Secondary Access Patterns

- **Captura de lead** (Story 1.3) — `INSERT` público em `leads`. Sem `SELECT` de volta ao client (não há confirmação que precise reler o registro).

### Write Patterns

- **Catálogo:** escrita única (seed, Story 1.2), updates manuais raros via migration — não é um padrão de escrita recorrente da aplicação.
- **Orders/Subscriptions:** exclusivamente via webhook (INSERT majoritário, UPDATE só em mudança de status de assinatura) — baixíssimo volume nesta fase.
- **Leads:** maior frequência de escrita relativa do sistema (topo de funil, sem fricção) — mitigado por rate limit no Vercel Firewall (Architecture 13.1), não no banco. DELETE em batch mensal já detalhado como padrão #9 acima.

### Reporting & Analytics

Nenhuma — decisão consciente (NFR7). Métricas de negócio (checkouts, conversão) são lidas do Stripe Dashboard nativamente (Architecture 17.2), não do banco. Sem queries de agregação a otimizar nesta fase.

## 4. Physical Schema Design

### `products`

**Purpose:** Catálogo de produtos avulsos (Architecture 4.1).

**Columns:**

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| slug | text | NOT NULL, UNIQUE | Navegação por setas / deep-link (Architecture 8.3) |
| name | text | NOT NULL | Nome exibido |
| category | text | NOT NULL, CHECK (category IN ('cabelo', 'barba')) | Filtro FR10 |
| volume | text | NOT NULL | Ex: "140ml" |
| price_cents | integer | NOT NULL, CHECK (price_cents > 0) | Preço avulso em centavos |
| active_ingredients | text[] | NOT NULL, DEFAULT '{}' | Lista de ativos |
| stripe_price_id | text | NOT NULL, UNIQUE | Price ID Stripe (Story 2.1) |
| image_url | text | NOT NULL | Caminho em `public/` |
| social_proof_rating | numeric(2,1) | NOT NULL, CHECK (social_proof_rating BETWEEN 0 AND 5) | Ex: 4.8 |
| social_proof_customer_count | text | NOT NULL | Ex: "5k+" |
| social_proof_result_percentage | integer | NOT NULL, CHECK (social_proof_result_percentage BETWEEN 0 AND 100) | Ex: 75 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | — |

**Indexes:** `idx_products_slug` (slug) — UNIQUE já cria índice; `idx_products_category` (category) — filtro FR10.

**Notes:** `SocialProof` (Architecture 4.1) achatado em 3 colunas prefixadas em vez de JSONB — são sempre 3 valores fixos por produto, tipar em colunas dá CHECK constraints que um JSONB não daria de graça.

### `protocols`

**Purpose:** Catálogo de protocolos de assinatura (Architecture 4.2).

**Columns:**

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| slug | text | NOT NULL, UNIQUE | Deep-link (Architecture 8.3) |
| name | text | NOT NULL | Nome exibido |
| monthly_price_cents | integer | NOT NULL, CHECK (monthly_price_cents > 0) | Preço mensal |
| annual_price_cents | integer | NOT NULL, CHECK (annual_price_cents > 0) | Preço anual (FR6) |
| one_time_equivalent_price_cents | integer | NOT NULL, CHECK (one_time_equivalent_price_cents > 0) | Preço avulso equivalente |
| is_featured | boolean | NOT NULL, DEFAULT false | "Mais Popular" |
| stripe_price_id_monthly | text | NOT NULL, UNIQUE | Price ID Stripe mensal |
| stripe_price_id_annual | text | NOT NULL, UNIQUE | Price ID Stripe anual |
| created_at | timestamptz | NOT NULL, DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | — |

**Indexes:** `idx_protocols_slug` (slug) — via UNIQUE; `idx_protocols_monthly_price` (monthly_price_cents DESC) — serve a regra de desempate FR5 (Architecture 4.1) diretamente ordenada.

### `protocol_products`

**Purpose:** Junção N:N única entre `protocols` e `products` — resolve `Protocol.productIds` **e** `Product.relatedProtocolIds` nas duas direções (correção da Seção 7.1 da Architecture, fechada nesta sessão).

**Columns:**

| Column | Type | Constraints | Description |
|---|---|---|---|
| protocol_id | uuid | NOT NULL, REFERENCES protocols(id) ON DELETE CASCADE | — |
| product_id | uuid | NOT NULL, REFERENCES products(id) ON DELETE CASCADE | — |

**Constraints:** `PRIMARY KEY (protocol_id, product_id)` — chave composta, impede duplicata do mesmo par.

**Indexes:** `idx_protocol_products_product` (product_id) — serve a query inversa (`WHERE product_id = ?`, padrão #8 da Seção 3); a PK composta já serve `WHERE protocol_id = ?` porque `protocol_id` é a primeira coluna.

**Notes:** `ON DELETE CASCADE` é seguro aqui — catálogo não tem edição via admin no MVP (só migration/seed), então nunca vai acontecer um DELETE acidental de produto/protocolo em produção fora de um deploy controlado.

### `orders`

**Purpose:** Pedido avulso concluído (Architecture 4.3).

**Columns:**

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| user_id | uuid | NULL, REFERENCES auth.users(id) ON DELETE SET NULL | Nulo se compra sem login (FR8); SET NULL preserva registro fiscal (Architecture 7.2) |
| customer_email | text | NOT NULL | Sempre presente (vem do Stripe Checkout) |
| product_id | uuid | NOT NULL, REFERENCES products(id) | — |
| amount_cents | integer | NOT NULL, CHECK (amount_cents > 0) | — |
| status | text | NOT NULL, DEFAULT 'paid', CHECK (status IN ('paid', 'refunded')) | — |
| stripe_checkout_session_id | text | NOT NULL, UNIQUE | Idempotência do webhook (Story 2.2 AC4) |
| created_at | timestamptz | NOT NULL, DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | — |

**Indexes:** `idx_orders_user_id` (user_id) — serve padrão #5/#6 da Seção 3 (resumo de conta, histórico); `idx_orders_stripe_session` (stripe_checkout_session_id) — via UNIQUE, serve a checagem de idempotência do INSERT.

**Notes:** Sem FK `NOT NULL` em `product_id` para `ON DELETE` — produto nunca é deletado em produção (Notes de `protocol_products` acima), então não precisa de política de cascade aqui; se precisar no futuro, é `RESTRICT` (não se apaga produto com pedido histórico).

### `subscriptions`

**Purpose:** Estado da assinatura, máquina de estado real do domínio (Architecture 4.4/6.2).

**Columns:**

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| user_id | uuid | NULL, REFERENCES auth.users(id) ON DELETE SET NULL | Nullable — ver Notes: tensão com FR8 resolvida na Seção 7 |
| protocol_id | uuid | NOT NULL, REFERENCES protocols(id) | — |
| billing_interval | text | NOT NULL, CHECK (billing_interval IN ('monthly', 'annual')) | — |
| status | text | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'active', 'past_due', 'canceled')) | Nunca otimista (Architecture 6.2) |
| stripe_subscription_id | text | NOT NULL, UNIQUE | — |
| stripe_customer_id | text | NOT NULL | — |
| current_period_end | timestamptz | NOT NULL | "Próxima cobrança" |
| created_at | timestamptz | NOT NULL, DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | — |

**Indexes:** `idx_subscriptions_user_id` (user_id) — padrão #5 da Seção 3; `idx_subscriptions_stripe_id` (stripe_subscription_id) — via UNIQUE, usado pelo webhook para localizar a linha a atualizar em `customer.subscription.updated`.

**Notes:** ~~`user_id NOT NULL` aqui é uma diferença deliberada de `orders.user_id`~~ — **corrigido na Seção 7**: `user_id` precisa ser **nullable**, não `NOT NULL`, porque `ON DELETE SET NULL` (LGPD, Architecture 7.2) é um caso legítimo de assinatura existente ficando sem usuário *depois* da criação. `NOT NULL` na coluna bloquearia fisicamente o próprio comportamento de anonimização que a mesma linha desta tabela pede. FR8 ("assinatura exige login") continua garantido — mas no momento do `INSERT`, via validação de aplicação, não via constraint de coluna, porque a constraint de coluna não pode diferenciar "nunca teve usuário" de "tinha usuário e foi anonimizado".

### `leads`

**Purpose:** Captura de contato do hero (Architecture 4.5), isolada, sem relacionamento.

**Columns:**

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| contact | text | NOT NULL | E-mail ou WhatsApp |
| contact_type | text | NOT NULL, CHECK (contact_type IN ('email', 'whatsapp')) | — |
| utm_source | text | NULL | — |
| utm_campaign | text | NULL | — |
| consent_given | boolean | NOT NULL, CHECK (consent_given = true) | LGPD — nunca `false` persistido (PRD 2.5); ver nota |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Base da purga de 12 meses (Story 1.7) |

**Indexes:** `idx_leads_created_at` (created_at) — serve exclusivamente o padrão #9 (purga mensal), justificado na Seção 3.

**Notes:** `CHECK (consent_given = true)` é redundante com a validação de aplicação (Route Handler já rejeita submit sem checkbox marcado, PRD Story 1.3 AC7) — mantido como defesa em profundidade: se um bug de aplicação algum dia tentar inserir sem consentimento, o banco recusa, não só o código.

## 5. Normalization Strategy

**Nível alvo:** 3NF para as tabelas transacionais (`orders`, `subscriptions`, `leads`) — sem grupos repetitivos, sem dependência transitiva. `protocol_products` é a forma canônica de resolver a N:N sem duplicar dado (Seção 4, correção da Architecture 7.1).

**Denormalização intencional:**
- `SocialProof` achatado em `products` (3 colunas) em vez de tabela própria — é 1:1 com o produto, sempre lido junto, nunca consultado independentemente; separar em tabela seria join desnecessário sem benefício algum.
- `protocols.one_time_equivalent_price_cents` é, estritamente, um dado derivável (soma dos `price_cents` dos produtos do protocolo via `protocol_products`) — mas é armazenado diretamente, não calculado em query. Trade-off aceito: o "preço avulso equivalente" exibido na UI é um valor de referência/marketing definido pelo negócio (Seção 5 do brief original), não necessariamente igual à soma exata dos componentes — calcular dinamicamente assumiria que sempre são iguais, o que não é garantido pelo domínio.

**Redundância de dado:** nenhuma tabela armazena o mesmo fato em dois lugares — o problema que existia (`protocol_products` + `product_related_protocols` duplicando a mesma relação) foi eliminado nesta sessão antes do DDL ser escrito. Sem cache/agregação calculada precisando de mecanismo de sincronização.

> **📌 Item rastreado (para Seção 8 — Security Architecture, não Seção 6):** `products` mistura colunas de catálogo com colunas de marketing (`social_proof_*`) na mesma tabela pública sem RLS restritivo. Confirmar lá que leitura pública dessas colunas é decisão consciente — mesmo padrão que a Architecture já documentou para o catálogo em geral (7.3: "mesmo dado já renderizado em HTML público via ISR, RLS não protegeria nada"), não uma omissão por não terem sido separadas em tabela própria.

## 6. Indexing Strategy

### Primary Indexes

PKs de todas as 6 tabelas (auto-indexados): `products.id`, `protocols.id`, `protocol_products(protocol_id, product_id)` composta, `orders.id`, `subscriptions.id`, `leads.id`.

### Foreign Key Indexes

- `protocol_products.product_id` — necessário explicitamente: a PK composta `(protocol_id, product_id)` só serve buscas `WHERE protocol_id = ?` de graça (protocol_id é a primeira coluna); a direção inversa (`WHERE product_id = ?`, padrão #8) precisa de índice próprio.
- `orders.user_id`, `subscriptions.user_id` — ver "Query-Driven Indexes" abaixo, já contam como FK index e query-driven ao mesmo tempo.
- `orders.product_id`, `subscriptions.protocol_id` — **não indexados** de propósito. Nenhum dos 9 padrões de acesso da Seção 3 faz `WHERE product_id = ?` em `orders` nem `WHERE protocol_id = ?` em `subscriptions` (isso seria reporting/analytics, fora de escopo — Seção 3). Adicionar agora seria índice especulativo sem query real para justificar.

### Query-Driven Indexes

| Index | Tabela | Colunas | Padrão servido (Seção 3) |
|---|---|---|---|
| `idx_products_slug` | products | slug (via UNIQUE) | #2 deep-link |
| `idx_products_category` | products | category | FR10 filtro |
| `idx_protocols_slug` | protocols | slug (via UNIQUE) | #2 deep-link |
| `idx_protocols_monthly_price` | protocols | monthly_price_cents DESC | #8 tiebreaker FR5 |
| `idx_protocol_products_product` | protocol_products | product_id | #8 link cruzado |
| `idx_orders_user_created` | orders | **(user_id, created_at DESC)** — composto, refina o índice simples da Seção 4 | #5/#6 resumo + histórico, já na ordem exigida pela query |
| `idx_orders_stripe_session` | orders | stripe_checkout_session_id (via UNIQUE) | idempotência webhook |
| `idx_subscriptions_user_id` | subscriptions | user_id | #5 resumo de conta |
| `idx_subscriptions_stripe_id` | subscriptions | stripe_subscription_id (via UNIQUE) | webhook localiza linha em `customer.subscription.updated` |
| `idx_leads_created_at` | leads | created_at | #9 purga mensal |

### Composite Indexes

`idx_orders_user_created (user_id, created_at DESC)` é o único composto — refinamento do índice simples de `user_id` definido na Seção 4, porque o padrão #6 (histórico de pedidos) sempre filtra por `user_id` **e** ordena por `created_at DESC` junto; o índice composto evita um passo de sort separado que um índice simples de `user_id` sozinho exigiria.

### Partial Indexes

Nenhum. Um índice parcial em `subscriptions WHERE status = 'active'` faria sentido para uma query tipo "listar todas as assinaturas ativas" — mas nenhum dos 9 padrões de acesso faz essa query (seria reporting, coberto pelo Stripe Dashboard, Seção 3). Especulativo, não adicionado.

### Full-Text Search Indexes

N/A — catálogo de 5 produtos/3 protocolos não tem funcionalidade de busca textual no MVP.

### Index Maintenance

Monitoramento via `pg_stat_user_indexes` nativo do Postgres/Supabase — sem ferramenta de observabilidade customizada (NFR7, Architecture 17). Sem agenda de reindex (volume baixo demais para justificar). Revisão de índices não utilizados recomendada ~1 mês após o lançamento, quando houver tráfego real para avaliar (todo índice acima é hipótese pré-lançamento, não medição).

## 7. Constraints & Data Integrity

### Primary Keys

`uuid` com `DEFAULT gen_random_uuid()` em todas as tabelas (exceto `protocol_products`, PK composta) — não sequencial. Rationale: IDs não previsíveis/enumeráveis (um `orders.id` sequencial permitiria adivinhar quantos pedidos existem ou tentar IDs vizinhos), e não há necessidade de ordenação por ID (todas as queries que precisam de ordem cronológica usam `created_at`, não o ID).

### Foreign Keys

| FK | Cascade | Rationale |
|---|---|---|
| `protocol_products.protocol_id/product_id → protocols/products` | `ON DELETE CASCADE` | Seguro — catálogo nunca é editado em produção (Seção 4, Notes) |
| `orders.user_id → auth.users` | `ON DELETE SET NULL` | LGPD — anonimização preserva o pedido por obrigação fiscal de 5 anos (Architecture 7.2/13.1) |
| `subscriptions.user_id → auth.users` | `ON DELETE SET NULL` | Mesma razão — mas nota: `user_id NOT NULL` na definição da coluna (Seção 4) entra em tensão direta com `SET NULL` no DELETE. Resolvido abaixo. |
| `orders.product_id → products` | Sem cascade explícito (implícito `RESTRICT`, padrão Postgres) | Produto nunca é deletado em produção — se algum dia for, `RESTRICT` impede apagar produto com pedido histórico, forçando decisão manual |
| `subscriptions.protocol_id → protocols` | Sem cascade explícito (`RESTRICT` implícito) | Mesma razão |

**Resolução da tensão `subscriptions.user_id NOT NULL` vs `ON DELETE SET NULL`:** Postgres permite os dois coexistirem porque são momentos diferentes — `NOT NULL` valida no `INSERT`/`UPDATE` (nunca se cria uma assinatura sem usuário, FR8), `ON DELETE SET NULL` só age no momento em que o `auth.users` referenciado é apagado, que é depois do fato consumado. Na prática, isso significa: **`subscriptions.user_id NOT NULL` precisa ser relaxado para nullable** no DDL final, porque o cenário de anonimização (LGPD) *é* um caso legítimo de assinatura com `user_id = NULL` acontecendo depois da criação — a constraint como escrita na Seção 4 impediria fisicamente o próprio comportamento que a Seção 4 mesma descreveu para `ON DELETE SET NULL`. Corrigido: `subscriptions.user_id` passa a ser **nullable**, com a garantia de "nunca criado sem usuário" reforçada por um `CHECK` ou pela lógica de aplicação no momento do `INSERT` (não pela constraint de coluna, que precisa permanecer neutra ao caso de anonimização futura).

### Unique Constraints

- `products.slug`, `products.stripe_price_id`
- `protocols.slug`, `protocols.stripe_price_id_monthly`, `protocols.stripe_price_id_annual`
- `orders.stripe_checkout_session_id` — idempotência (Story 2.2 AC4)
- `subscriptions.stripe_subscription_id`
- `protocol_products (protocol_id, product_id)` — via PK composta, impede par duplicado

### Check Constraints

Já detalhados por tabela na Seção 4 (`category`, `contact_type`, `status` em orders/subscriptions, ranges de preço/rating/percentual, `consent_given = true`). Todos implementam enums/regras de negócio que já existiam como `union type` no TypeScript da Architecture (Seção 4) — nenhum é invenção nova, é a tradução física de constraint que já existia no nível conceitual.

### Not Null Constraints

Campos obrigatórios seguem 1:1 os tipos não-opcionais das interfaces TypeScript da Architecture (campos sem `| null` no modelo conceitual viram `NOT NULL` no DDL) — com a única exceção corrigida acima (`subscriptions.user_id`, que precisa virar nullable por causa do ciclo de vida de anonimização, mesmo a Architecture tendo modelado como `string` não-opcional no nível conceitual/aplicação).

### Default Values

`DEFAULT now()` em todo `created_at`/`updated_at`; `DEFAULT gen_random_uuid()` em toda PK; `DEFAULT false` em `protocols.is_featured`; `DEFAULT 'paid'`/`DEFAULT 'pending'` nos status iniciais de `orders`/`subscriptions` (estado inicial correto no momento da criação pelo webhook).

## 8. Security Architecture

### Authentication

Supabase Auth (Architecture 9.3) — não reimplementado aqui; este documento só cobre o que acontece **depois** que `auth.uid()` existe.

### Authorization Model — RLS por Tabela

| Tabela | RLS | Policy |
|---|---|---|
| `products`, `protocols`, `protocol_products` | Habilitado | `SELECT` público: `USING (true)` — sem policy de INSERT/UPDATE/DELETE para `anon`/`authenticated` (escrita só via service role, seed/migration). Deny-by-default do Postgres RLS cobre a ausência de policy de escrita. |
| `orders` | Habilitado | `SELECT`: `USING (auth.uid() = user_id)`. Sem policy de INSERT/UPDATE/DELETE para client — só webhook (service role, Architecture 9.2). |
| `subscriptions` | Habilitado | `SELECT`: `USING (auth.uid() = user_id)`. Mesma ausência de policy de escrita para client. |
| `leads` | Habilitado | `INSERT`: `WITH CHECK (true)` — endpoint público por design (FR1, sem auth). **Sem policy de `SELECT`** para `anon`/`authenticated` — deny-by-default, ninguém lê a lista de leads pelo client, nem o próprio autor do lead. |

**Confirmação explícita pedida (não silêncio):**
- `orders.user_id IS NULL` (compra avulsa) e `subscriptions.user_id IS NULL` (pós-anonimização, Seção 7) **nunca** satisfazem `auth.uid() = user_id` — `NULL = qualquer coisa` nunca é `TRUE` em SQL, então a mesma policy cobre as duas tabelas sem exceção. Documentado via `COMMENT ON POLICY`:
  ```sql
  COMMENT ON POLICY orders_select_own ON orders IS
    'Linhas com user_id NULL (compra avulsa sem login, ou assinatura anonimizada) nunca são
     visíveis via client por design — NULL nunca satisfaz auth.uid() = user_id. Confirmado
     explicitamente, não efeito colateral. Único acesso é via service role (webhook, DPO).';
  ```
- `leads` sem `SELECT` policy é decisão consciente, mesmo padrão do `COMMENT ON POLICY` acima — nenhum usuário, nem mesmo autenticado, lê a própria submissão de volta (o formulário não precisa reler, só confirma sucesso via resposta HTTP do POST).
- Colunas de marketing em `products` (`social_proof_*`) são públicas pelo mesmo motivo do catálogo geral (Architecture 7.3): já renderizadas em HTML público via ISR, RLS não protegeria nada ali.

### Sensitive Data

**PII identificado:** `orders.customer_email`, `leads.contact` (e-mail/WhatsApp), e indiretamente `auth.users` (nome/e-mail, gerenciado pelo Supabase Auth, fora do escopo deste schema). Nenhuma outra tabela guarda PII direto.

**Encryption:** at-rest/in-transit nativos do Supabase/Vercel — já declarado (Architecture 13.1), não repetido aqui.

**Hashing:** senhas são 100% gerenciadas pelo Supabase Auth internamente — nenhuma coluna de senha existe nas 6 tabelas deste schema.

**Masking para não-produção:** **não resolvido — acaba de virar um achado real, não uma formalidade do template.**

> ⚠️ **Achado resolvido por decisão de negócio (não pela Dara sozinha):** Architecture 12.4 decidiu compartilhar o **mesmo projeto Supabase** entre Preview e Production — qualquer PR aberto (URL pública) lê/escreve dado real de cliente no mesmo banco. Hoje (pré-lançamento) o risco é zero; vira real no primeiro cliente pós-go-live.
>
> **Decisão confirmada:** **Supabase Preview Branches** (branching nativo de banco por PR) — nativo da plataforma, zero infraestrutura extra, alinhado ao NFR7, resolve o isolamento de PII sem manter um segundo projeto Supabase.
>
> **Status:** registrado como item **obrigatório antes do primeiro cliente real** (não bloqueia o trabalho de schema/dev agora, pré-lançamento sem PII real). Requer revisão da Architecture 12.4 pelo `@architect` (Aria) — atualizar a decisão de "projeto único compartilhado" para "Preview Branches" antes do dev kickoff do fluxo de pagamento em produção real.

### Audit Logging

Nenhum audit log customizado (NFR7) — `updated_at` em cada tabela serve como sinal mínimo de "algo mudou, quando". Ações sensíveis (anonimização LGPD) são manuais via DPO (PRD 2.5) e ficam registradas no e-mail de solicitação, não em log de banco — aceitável no volume do MVP, revisitar se o processo de anonimização escalar.

### Compliance (LGPD)

Já formalizado em PRD 2.5 e Architecture 13.1 — este schema implementa fisicamente: retenção via `leads.created_at` + índice dedicado (purga automática), retenção fiscal via `ON DELETE SET NULL` em `orders`/`subscriptions.user_id` (preserva o registro, remove o vínculo pessoal), consentimento via `leads.consent_given CHECK (= true)`.

## 9. Supabase-Specific Configuration

### RLS Policies

Detalhadas por tabela na Seção 8 — não repetido aqui.

### Realtime Configuration

**Não habilitado** em nenhuma tabela no MVP. Candidato natural seria `subscriptions` (UI de `/conta` poderia refletir `pending → active` ao vivo, sem esperar `router.refresh()`) — mas a Architecture já resolveu esse fluxo via revalidação pós-ação (8.2), sem depender de subscription client-side. Habilitar Realtime agora seria complexidade adicional sem necessidade comprovada — candidato a melhoria pós-MVP, não requisito atual.

### Edge Functions

Nenhuma. Toda lógica de negócio passa por Route Handlers do Next.js (padrão BFF, Architecture 2.5) — Supabase é usado como banco + Auth, não como camada de compute. Sem triggers de banco chamando Edge Functions.

### Storage Integration

N/A — decisão já tomada na Architecture (Seção 3, Tech Stack): fotos de produto ficam em `public/` estático do Next.js, não em Supabase Storage, porque o catálogo é fixo/seedado, não upload dinâmico de usuário. Nenhum bucket a configurar.

### Auth Integration

`auth.users` é referenciado por FK em `orders`/`subscriptions` (Seção 4/7), nunca duplicado. Nenhum campo de perfil customizado identificado no PRD/Architecture além do que o Supabase Auth já guarda nativamente (e-mail) — a "Área do Cliente" (Story 3.3) exibe dado de `orders`/`subscriptions`, não um perfil estendido. Sem `user_metadata` customizado necessário no MVP. Multi-tenancy: N/A, aplicação single-tenant.

## 10. Migration & Evolution Strategy

### Initial Migration

Organização em arquivos incrementais por story (decisão já tomada, Architecture 12.4/4.4): cada migration que altera schema vive no mesmo commit/PR do código que depende dela. Para o schema deste documento, a migration inicial (Story 1.2) cria as 6 tabelas na ordem de dependência: `products`, `protocols` → `protocol_products` (depende das duas) → `orders`, `subscriptions` (dependem de `products`/`protocols` e `auth.users`, que já existe nativamente) → `leads` (independente, pode vir em qualquer ordem). Seed data (5 produtos, 3 protocolos) na mesma migration ou script separado imediatamente após — nunca dados de catálogo hardcoded na aplicação.

### Change Management

**Convenção de nome:** `supabase migrations new <descricao_snake_case>` gera timestamp automático — sem convenção adicional necessária, o CLI já ordena por timestamp.
**Up/Down:** Supabase CLI gera migrations "up" apenas por padrão; script de rollback (down) é responsabilidade de quem escreve a migration quando a mudança não é trivialmente reversível (ex: um `DROP COLUMN` precisa de rollback que recria a coluna, mesmo que vazia).
**Teste:** toda migration passa por `supabase db diff`/dry-run local antes de commitar (comando `*dry-run` desta agente) — nunca aplicada direto em produção sem ter rodado local primeiro.

### Versioning

Schema versionado implicitamente pelo histórico de migrations do Supabase CLI (`supabase/migrations/*.sql`, timestamp no nome) — mesma fonte de verdade que o Git, sem ferramenta de versionamento de schema separada (Flyway/Liquibase seriam redundantes aqui).

### Backward Compatibility

Não aplicável em sentido estrito — MVP pré-lançamento, sem consumidores externos da API pública versionada a preservar (a "API" é interna, Architecture Seção 5). Regra prática: nenhuma migration remove uma coluna que uma story de Epic anterior já depende, sem primeiro confirmar que nenhum código em produção ainda a lê.

### Rollback Strategy

**Quando é seguro:** migrations aditivas (nova tabela, nova coluna nullable, novo índice) — sempre seguras de reverter via `DROP`, sem perda de dado além do que a própria migration criou.
**Quando não é seguro:** qualquer migration que já rodou em produção com dados reais gravados na nova estrutura (ex: `subscriptions.status` já populado) — reverter exigiria decidir o que fazer com esse dado, não é automático. Ligado à ressalva já registrada na Architecture (12.1): rollback de **código** via Vercel é instantâneo, mas não desfaz uma migration de banco já aplicada — por isso a regra "migration no mesmo commit do código" existe, para minimizar a janela onde os dois podem divergir.

## 11. Performance Optimization

### Query Optimization

Nenhuma query cara identificada — catálogo de 5 produtos/3 protocolos e volume transacional baixo (Seção 1) tornam qualquer query dos 9 padrões (Seção 3) trivial para o Postgres, todas via PK ou índice dedicado (Seção 6). Padrão repository-lite (Architecture 2.5) faz uma query explícita por necessidade — sem risco de N+1, porque não há ORM gerando queries implícitas em loop.

### Connection Pooling

**N/A no nível da aplicação — corrigindo um conselho que escrevi errado antes de apresentar.** Pooler (porta 6543, pgbouncer) importa para quem abre conexão Postgres direta (driver `pg`, Prisma com `DATABASE_URL`). Esta arquitetura usa `supabase-js` exclusivamente em todo Route Handler (`createServerSupabaseClient()`/`createServiceRoleSupabaseClient()`, Architecture 9.1/9.2) — que fala HTTP com a camada PostgREST do Supabase, não abre conexão Postgres crua. O pooling entre PostgREST e o Postgres é responsabilidade interna do Supabase, transparente, sem decisão de porta/connection-string da nossa parte. Única conexão direta ao Postgres no projeto é a do próprio Supabase CLI durante `supabase db push` (migrations) — gerenciada pela ferramenta, não configurada manualmente por nós.

### Caching Strategy

Nenhuma camada de cache no nível do banco (Redis, etc.) — decisão já tomada (Architecture Seção 3, Cache: Nenhum) e coberta pelo ISR/fetch cache do Next.js na camada de aplicação. Adicionar cache no banco seria uma segunda camada de cache para o mesmo dado, sem necessidade demonstrada na escala atual.

### Partitioning

N/A — nenhuma tabela se aproxima de volume que justifique particionamento (nem `leads`, a de maior crescimento relativo, dado o expurgo automático de 12 meses limitando o tamanho máximo).

### Read Replicas

N/A — volume de leitura não justifica, e a maioria das leituras de catálogo nem chega ao banco (ISR, Architecture 2.5) na maior parte do tempo.

### Monitoring

`pg_stat_statements` (extensão nativa do Postgres, habilitável no Supabase) para identificar queries lentas se/quando o volume crescer — não configurado proativamente agora (NFR7), fica como primeiro passo de investigação se performance virar problema real, não como monitoramento contínuo custom.
