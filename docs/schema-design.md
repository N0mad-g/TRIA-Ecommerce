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
- `Order`/`Subscription` → `auth.users`: N:1. **Opcional** em `Order` (compra avulsa não exige login, FR8); **obrigatório** em `Subscription` (gerenciar assinatura exige login, FR8).
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
