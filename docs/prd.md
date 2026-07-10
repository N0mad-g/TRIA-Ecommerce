# TRIA Product Requirements Document (PRD)

## 1. Goals and Background Context

### 1.1 Goals

- Lançar e-commerce funcional para validar demanda via tráfego orgânico do sócio-fundador visagista (~5k seguidores), com meta de **≥ 50 checkouts iniciados (avulso + assinatura) nas primeiras 4 semanas pós-lançamento** _(placeholder — número não veio do brief, ajustar com dado real do fundador antes de travar)_.
- Entregar as 5 telas do MVP (Home, About, Conta, Produtos, Assinatura) responsivas mobile-first.
- Habilitar checkout Stripe hospedado suportando assinatura recorrente e compra avulsa no mesmo fluxo.
- Consolidar terminologia "Protocolo" (nunca "Kit") e posicionamento dark luxury científico em toda a interface.
- Oferecer toggle Anual/Mensal na página de Assinatura para maximizar LTV via desconto de recorrência.
- Construir base pronta para escalar com tráfego pago após validação orgânica.

### 1.2 Background Context

TRIA é uma marca de hair care masculino premium (acrônimo: Tricologia, Reconstrução, Identidade, Autoestima), posicionada como ciência aplicada à autoestima e autoridade pessoal — não como "vaidade". Atende três personas com dores distintas (pós-implante capilar, homem de autoridade/negócios, cuidados diários contra queda/alopecia), cada uma com gatilho de conversão próprio, unificadas sob a promessa "Sua aparência fala antes de você."

O modelo de receita combina assinatura mensal (maior LTV, desconto sobre avulso) com compra avulsa (menor barreira de entrada), ambos coexistindo em cada protocolo/produto. O objetivo imediato é validar demanda com tráfego orgânico já disponível antes de investir em mídia paga, mantendo a arquitetura pronta para esse próximo estágio.

### 1.3 Change Log

| Date       | Version | Description                                                  | Author       |
| :--------- | :------ | :------------------------------------------------------------ | :----------- |
| 2026-07-07 | 0.1     | PRD recriado do zero via agentes AIOX, a partir do Project Brief (reset de projeto) | Morgan (PM)  |

## 2. Requirements

### 2.1 Functional

1. FR1: Home (`/`) deve exibir hero carrossel de 3 slides (boas-vindas, CTA assinatura, captura de lead) com autoplay + navegação manual + dots.
2. FR2: Home deve exibir seção "Por que TRIA", 3 pilares de benefício, vitrine de Protocolos (3 cards, "Ritual de Autoridade" com badge "Mais Popular"), vitrine de produtos avulsos e depoimentos.
3. FR3: About (`/about`) deve exibir conteúdo institucional: marca, empresas parceiras, profissionais parceiros.
4. FR4: Área do Cliente (`/conta`) deve ter sidebar (User, Pedidos, Assinatura, Config) + conteúdo mostrando assinatura ativa (protocolo, preço, próxima cobrança) e último pedido (status de entrega).
5. FR5: Product Page (`/produtos`) deve navegar entre produtos via setas (não fotos do mesmo produto), exibindo nome, imagem, descrição, ativos, preço avulso, link cruzado para protocolo equivalente, CTA de compra, bloco de métricas fixo.
6. FR6: Assinatura Page (`/assinatura`) deve exibir os 3 protocolos lado a lado com toggle Anual/Mensal alterando o preço exibido.
7. FR7: Checkout deve redirecionar para Stripe Checkout hospedado, suportando modo assinatura (recorrente) e avulso (único), retornando para página de confirmação.
8. FR8: Compra avulsa não exige login; gerenciar assinatura exige login.
9. FR9: Toda página de produto/protocolo deve exibir bloco de prova social fixo: "4,8★★★★★ · 5k+ clientes · X% notam resultado em 30 dias".
10. FR10: Catálogo deve filtrar por categoria: Todos, Cabelo, Barba (Pomada Fix entra em Cabelo, sem categoria "Styling").
11. FR11: Nenhum texto de interface pode usar a palavra "Kit" — sempre "Protocolo".
12. FR12: Sistema deve exibir os 3 protocolos e 5 produtos avulsos com preços/composições do catálogo do brief.

### 2.2 Non Functional

1. NFR1: Interface mobile-first, com adaptação responsiva completa para desktop.
2. NFR2: Alternância de fundo escuro/claro entre seções deve seguir ritmo intencional (impacto/decisão vs. alívio/prova/ciência).
3. NFR3: Fotografia tratada em preto e branco de alto contraste (tom científico/sério).
4. NFR4: Stack: Next.js 16+ (App Router), Tailwind CSS, Framer Motion, lucide-react, Stripe (Checkout + Subscriptions), deploy Vercel.
5. NFR5: Sem páginas próprias de pagamento/endereço — 100% delegado ao Stripe Checkout hospedado.
6. NFR6: Rotas em tela única por área (sem listagem+detalhe separados), conforme wireframe de 5 telas.
7. NFR7: Sistema deve operar dentro dos SLAs padrão das plataformas gerenciadas (Vercel, Supabase, Stripe) — sem infraestrutura de monitoramento/observabilidade customizada. Mantém o escopo enxuto de "lançar e validar" do projeto.

### 2.3 Out of Scope

_(Trazido diretamente da seção 13 do Project Brief — "Restrições e Não-Escopo", não é decisão nova)_

- Não implementar checkout customizado — usar Stripe Checkout hospedado.
- Não usar a palavra "Kit" em nenhum texto de interface — sempre "Protocolo".
- Não criar categoria de produto "Styling" — Pomada Fix entra em "Cabelo".
- Não exigir login para compra avulsa.

### 2.4 User Responsibilities

_(Tarefas humanas que precisam existir antes das stories que dependem delas — nenhum agente pode executá-las)_

- **Conta Stripe:** criar conta, configurar modo live/test, e fornecer API keys (publishable + secret + webhook signing secret) antes da Story 2.1.
- **Conta Supabase:** criar projeto e fornecer URL + chaves (anon/service role) antes da Story 1.2.
- **Fotos dos 5 produtos:** já existem — serão fornecidas via pasta `assets/produtos/` antes da Story 1.2.

## 3. User Interface Design Goals

### 3.1 Overall UX Vision

Dark luxury científico — o site comunica autoridade antes de vender produto. Alternância proposital de fundo escuro (impacto/decisão) e claro (alívio/prova/ciência) entre seções dá ritmo à leitura e evita fadiga visual. Fotografia em preto e branco de alto contraste reforça o tom científico/sério. Muito espaço em branco, tipografia grande e confiante.

### 3.2 Key Interaction Paradigms

- Hero: carrossel autoplay + navegação manual (3 slides, indicadores/dots).
- Product Page: navegação por setas troca de **produto** (não de foto do mesmo produto) — browse e detalhe unificados numa única tela.
- Assinatura Page: toggle binário Anual/Mensal recalcula preço ao vivo nos 3 cards de protocolo.
- Checkout: redirect externo para Stripe Checkout hospedado — sem etapas internas de pagamento/endereço.

### 3.3 Core Screens and Views

- Home (`/`)
- About (`/about`)
- Área do Cliente (`/conta`)
- Product Page (`/produtos`) — browse + detalhe unificados
- Assinatura Page (`/assinatura`) — estilo pricing SaaS

### 3.4 Accessibility: WCAG AA

Aprovado como padrão de acessibilidade do projeto.

### 3.5 Branding

Dark luxury, científico, fotografia preto e branco de alto contraste, tipografia grande, hero com animação abstrata 3D.

### 3.6 Target Device and Platforms: Web Responsive

Mobile-first com adaptação responsiva completa para desktop. Sem apps nativos no escopo.

## 4. Technical Assumptions

### 4.1 Repository Structure: Monorepo

Aplicação única Next.js — sem necessidade de múltiplos repositórios/pacotes para o escopo MVP.

### 4.2 Service Architecture

Monolito serverless: Next.js App Router com Route Handlers/Server Actions rodando na Vercel. Webhook do Stripe tratado por route handler dedicado. Sem microsserviços — escopo de 5 telas + checkout hospedado não justifica a complexidade.

### 4.3 Testing Requirements

Unit + Integration: Jest + React Testing Library para componentes e lógica de preço/toggle; testes de integração cobrindo o fluxo de checkout (mock de webhook Stripe) e sincronização de estado de assinatura. E2E fora do escopo do MVP inicial.

### 4.4 Additional Technical Assumptions and Requests

- **Banco de dados:** Postgres via Supabase _(assumido — brief não especifica persistência; mantém consistência com setup anterior do projeto)_. Armazena catálogo (protocolos/produtos), pedidos e estado de assinatura espelhado via webhook Stripe.
- **Migrations:** via Supabase CLI, aplicadas incrementalmente por story (cada story que altera schema inclui seu próprio arquivo de migration) — sem tooling adicional de migration.
- **Framework version:** Next.js 16+ (App Router), conforme preset ativo do AIOX (`nextjs-react`) — atualizado em relação ao Next.js 14 sugerido no brief original.
- Styling: Tailwind CSS.
- Animação: Framer Motion.
- Ícones: lucide-react.
- State management: Zustand (estado leve — toggle Anual/Mensal, UI state).
- Pagamento: Stripe (Checkout hospedado + Subscriptions API).
- Deploy: Vercel.

## 5. Epic List

- **Epic 1: Foundation & Core Storefront** — Estabelecer infraestrutura do projeto (Next.js, Supabase, deploy Vercel) e entregar Home, About, Product Page e Assinatura Page (vitrine com toggle Anual/Mensal, sem ação de compra) navegáveis com dados reais de catálogo.
- **Epic 2: Purchase Flow** — Habilitar compra avulsa e assinatura via Stripe Checkout hospedado a partir das vitrines já existentes, incluindo confirmação de pedido e persistência via webhook.
- **Epic 3: Customer Area** — Entregar a Área do Cliente (login, gerenciar assinatura, histórico de pedidos).

## 6. Epic 1 Foundation & Core Storefront

Estabelece a base técnica do projeto (Next.js, Supabase, Vercel) e entrega as 4 telas navegáveis (Home, About, Produtos, Assinatura) com dados reais de catálogo, sem qualquer fluxo de compra funcional. Ao final deste épico, o site é publicamente navegável e mostra fielmente marca, produtos, protocolos e preços — pronto para receber o fluxo de compra do Epic 2.

### Story 1.1 Project Setup & Deploy Pipeline

Como dev, quero o projeto Next.js 16 (App Router) inicializado com Tailwind, Framer Motion, lucide-react e deploy automático na Vercel, para que as próximas stories tenham uma base funcional.

#### Acceptance Criteria

1: Projeto Next.js 16 App Router roda localmente (`npm run dev`) sem erros.
2: Tailwind CSS, Framer Motion e lucide-react instalados e configurados.
3: Deploy automático na Vercel a partir do branch main funcional (preview URL acessível).
4: Página inicial temporária ("health check") renderiza sem erro em produção.
5: Jest + React Testing Library instalados e configurados, com um teste de exemplo passando (`npm test`).

### Story 1.2 Database Schema & Catalog Seed

Como dev, quero o schema Supabase para protocolos e produtos (preços, ativos, imagens, métricas de prova social) criado e populado com os dados reais do brief, para que as páginas renderizem dados reais em vez de mocks.

#### Acceptance Criteria

1: Tabelas `products` e `protocols` criadas no Supabase com campos para nome, preço avulso, preço assinatura, categoria, ativos, imagem, métricas de prova social.
2: Seed contém os 3 protocolos e 5 produtos avulsos do brief com valores corretos.
3: Camada de dados (Supabase client) lê e retorna os dados seedados corretamente.
4: Nenhuma referência à palavra "Kit" nos dados seedados.

### Story 1.3 Home Page

Como visitante, quero ver a Home com hero carrossel, seção de marca, benefícios, vitrines de protocolo/produto e depoimentos, para entender a marca e navegar até Assinatura ou Produtos.

#### Acceptance Criteria

1: Hero renderiza 3 slides com autoplay, navegação manual e dots.
2: Seção "Por que TRIA", 3 pilares de benefício e depoimentos renderizam com conteúdo do brief.
3: Vitrine de Protocolos exibe os 3 protocolos com "Ritual de Autoridade" destacado, linkando para `/assinatura`.
4: Vitrine de Produtos avulsos exibe amostra linkando para `/produtos`.
5: Layout responsivo mobile-first, validado em viewport mobile e desktop.

### Story 1.4 About Page

Como visitante, quero uma página About mostrando a história da marca, empresas parceiras e profissionais parceiros, para confiar na credibilidade da marca.

#### Acceptance Criteria

1: `/about` renderiza conteúdo institucional (marca, empresas parceiras, profissionais parceiros).
2: Layout segue diretrizes de UX/UI (alternância fundo escuro/claro, tipografia grande).
3: Responsivo mobile-first.

### Story 1.5 Product Page (Browse + Detail)

Como visitante, quero navegar pelos produtos numa tela única, trocando de produto via setas, para ver detalhes e prova social sem uma página de grid separada.

#### Acceptance Criteria

1: `/produtos` exibe o produto atual com nome, imagem, descrição, ativos, preço avulso.
2: Setas laterais navegam para o produto anterior/próximo do catálogo (não trocam foto do mesmo produto).
3: Bloco de métricas fixo (nota + clientes + % resultado) exibido no formato do brief.
4: Link cruzado "ou assine o Protocolo X e pague R$Y/mês" direciona para `/assinatura`.
5: Filtro de categoria (Todos, Cabelo, Barba) funcional.
6: Nenhum CTA de compra funcional ainda (ação fica para o Epic 2) — botão visível porém desabilitado/placeholder.

### Story 1.6 Assinatura Page (Showcase)

Como visitante, quero ver os 3 planos de protocolo lado a lado com toggle Anual/Mensal, para comparar preços antes de assinar.

#### Acceptance Criteria

1: `/assinatura` exibe os 3 protocolos lado a lado com itens inclusos (checkmarks).
2: Toggle Anual/Mensal recalcula e exibe o preço correto em cada card ao vivo.
3: "Ritual de Autoridade" tem destaque visual (borda + badge "Mais Popular").
4: Nenhuma ação de assinatura funcional ainda (ação fica para o Epic 2) — botão visível porém desabilitado/placeholder.
5: Responsivo mobile-first.

## 7. Epic 2 Purchase Flow

Habilita compra avulsa e assinatura via Stripe Checkout hospedado a partir das vitrines já existentes (Epic 1), incluindo confirmação de pedido e persistência via webhook. Ao final, os CTAs "placeholder" do Epic 1 tornam-se funcionais de ponta a ponta.

### Story 2.1 Stripe Product/Price Setup & SDK Config

Como dev, quero os Products/Prices do Stripe configurados (avulso one-time + protocolos recorrentes mensal/anual) e o SDK do Stripe integrado ao projeto, para que sessões de checkout possam ser criadas corretamente.

#### Acceptance Criteria

1: Products/Prices criados no Stripe para cada produto avulso e cada protocolo (mensal + anual).
2: IDs de price mapeados no catálogo (Supabase) para cada produto/protocolo.
3: Stripe SDK configurado no projeto (chaves em env vars, client server-side).
4: Rota de teste cria Checkout Session válida (retorna URL Stripe) para um price ID de exemplo.

### Story 2.2 Webhook Handler & Order/Subscription Persistence

Como dev, quero uma rota de webhook do Stripe tratando os eventos de checkout e assinatura, persistindo pedidos e estado de assinatura no Supabase, para que confirmação e área de conta tenham dados precisos assim que o checkout entrar em produção.

#### Acceptance Criteria

1: Rota de webhook valida a assinatura do Stripe (signing secret).
2: Evento `checkout.session.completed` cria registro de pedido (avulso) ou assinatura (recorrente) no banco.
3: Eventos `customer.subscription.updated`, `customer.subscription.deleted` e `invoice.paid` atualizam status/próxima cobrança no banco.
4: Falhas de processamento são logadas sem quebrar o endpoint; eventos repetidos são idempotentes (retorna 200).
5: Testado via Stripe CLI (`stripe trigger`) com eventos simulados, sem depender de checkout real ainda.

### Story 2.3 Compra Avulsa Checkout

Como visitante, quero clicar no CTA de compra da Product Page e ser redirecionado ao Stripe Checkout hospedado em modo pagamento único, para comprar sem precisar de login.

#### Acceptance Criteria

1: CTA de compra da Product Page (Story 1.5) cria Checkout Session modo `payment` com o price correto do produto.
2: Redirecionamento ao Stripe Checkout hospedado funciona sem exigir login.
3: Ao completar o pagamento, usuário retorna à página de confirmação exibindo o resumo do pedido.
4: Pedido aparece registrado no banco com status pago (via webhook da Story 2.2).

### Story 2.4 Assinatura Checkout (Mensal/Anual)

Como visitante, quero clicar em "Assinar" na Assinatura Page respeitando o toggle Anual/Mensal, e ser redirecionado ao Stripe Checkout em modo assinatura, para assinar o protocolo escolhido.

#### Acceptance Criteria

1: CTA de assinatura da Assinatura Page (Story 1.6) cria Checkout Session modo `subscription` com o price correto (mensal ou anual conforme toggle) do protocolo selecionado.
2: Redirecionamento ao Stripe Checkout hospedado funciona.
3: Ao completar o pagamento, usuário retorna à página de confirmação exibindo o protocolo assinado e a próxima cobrança.
4: Assinatura aparece registrada no banco vinculada a um usuário/e-mail (via webhook da Story 2.2).

### Story 2.5 Confirmation Page

Como visitante, quero uma página de confirmação após o checkout mostrando o resumo do pedido/assinatura, para ter certeza de que a compra foi concluída.

#### Acceptance Criteria

1: Página de confirmação é única e compartilhada — mesma rota atende ao retorno tanto da Compra Avulsa (Story 2.3) quanto da Assinatura (Story 2.4), não duas páginas separadas.
2: Conteúdo exibido se adapta ao tipo de compra: resumo de pedido (produto, valor) para avulso; resumo de assinatura (protocolo, valor, próxima cobrança) para recorrente.
3: Estados de erro (pagamento não completado/cancelado) exibem mensagem apropriada com opção de tentar novamente.
4: Responsivo mobile-first.

## 8. Epic 3 Customer Area

Entrega a Área do Cliente completa: autenticação, sidebar de navegação, resumo de conta/pedidos e gerenciamento de assinatura. Depende dos dados de pedidos/assinaturas já persistidos no Epic 2.

### Story 3.1 Auth (Login/Signup)

Como cliente, quero criar conta e fazer login (Supabase Auth), para acessar minha área de cliente.

#### Acceptance Criteria

1: Usuário pode criar conta e fazer login via Supabase Auth (e-mail/senha ou magic link).
2: Rotas de `/conta` são protegidas — redirecionam para login se não autenticado.
3: Sessão persiste entre reloads (cookie/JWT via Supabase).
4: Logout funcional.

### Story 3.2 Account Area Shell & Sidebar

Como cliente logado, quero uma sidebar de navegação (User, Pedidos, Assinatura, Config) em `/conta`, para navegar entre as seções da minha conta.

#### Acceptance Criteria

1: `/conta` renderiza sidebar fixa com logo no topo e itens, nesta ordem: User, Pedidos, Assinatura, Config.
2: Navegação entre seções via sidebar sem reload completo de página.
3: Responsivo mobile-first (sidebar se adapta em mobile conforme wireframe).

### Story 3.3 User & Orders Summary

Como cliente logado, quero ver o resumo da minha conta (assinatura ativa + último pedido) na área padrão de `/conta`, e o histórico completo em "Pedidos", para saber o status das minhas compras.

#### Acceptance Criteria

1: Conteúdo padrão de `/conta` mostra card de assinatura ativa (protocolo, preço, próxima cobrança) e card do último pedido (status de entrega).
2: Seção "Pedidos" lista o histórico completo de pedidos avulsos vinculados ao usuário logado.
3: Dados exibidos vêm do banco (Stories 2.2-2.4), refletindo pedidos/assinaturas reais — nenhum dado mockado.

### Story 3.4 Subscription Management

Como cliente logado, quero pausar, trocar ou cancelar meu protocolo assinado na seção "Assinatura", para controlar meu plano recorrente sem contatar suporte.

#### Acceptance Criteria

1: Seção "Assinatura" exibe o protocolo assinado atual com opções: pausar, trocar de protocolo, cancelar.
2: **Troca de protocolo usa proration nativo do Stripe** (`subscription.update` trocando o price/item, com `proration_behavior: create_prorations`) — não cancela e recria a assinatura. Mantém histórico de cobrança único e evita gap de acesso.
3: Ações chamam a API do Stripe (subscription update/cancel) e refletem o novo estado após confirmação.
4: Mudanças de estado são persistidas via webhook (Story 2.2) e refletidas em `/conta` automaticamente.
5: Confirmação visual (toast/modal) exibida após cada ação.

## 9. Checklist Results Report

### Executive Summary

- **Completude geral do PRD:** ~85%
- **Adequação do escopo MVP:** Just Right — 3 épicos, 15 stories, sem feature supérflua identificada
- **Prontidão para fase de arquitetura:** Ready
- **Gaps remanescentes:** menores (análise competitiva formal, diagramas de fluxo) — nenhum bloqueia o Architect

### Category Statuses

| Category                         | Status  | Critical Issues |
| --------------------------------- | ------- | --------------- |
| 1. Problem Definition & Context   | PARTIAL | Sem quantificação de impacto do problema nem análise competitiva formal |
| 2. MVP Scope Definition            | PASS    | Out of Scope adicionado (seção 2.3); meta mensurável adicionada ao Goal 1 |
| 3. User Experience Requirements    | PARTIAL | Fluxos de erro cobertos só no checkout; sem budget de performance percebida |
| 4. Functional Requirements         | PASS    | — |
| 5. Non-Functional Requirements     | PASS    | Resolvido via NFR7 (SLA de plataformas gerenciadas) — escolha deliberada e enxuta, não lacuna |
| 6. Epic & Story Structure          | PASS    | — |
| 7. Technical Guidance              | PARTIAL | Riscos técnicos não flagados explicitamente para o Architect além dos já discutidos (proration) |
| 8. Cross-Functional Requirements   | PARTIAL | Retenção de dados e frequência de deploy não endereçadas |
| 9. Clarity & Communication         | PASS    | Sem diagramas/visuais, mas aceitável dado contexto de stakeholder único com aprovação seção a seção |

### Critical Deficiencies

- Nenhum **BLOCKER** identificado.
- ~~HIGH: NFR de performance/disponibilidade~~ — **Resolvido:** NFR7 define aderência a SLA gerenciado (Vercel/Supabase/Stripe), consistente com o princípio enxuto do projeto.
- ~~HIGH: Seção "Fora de Escopo"~~ — **Resolvido:** seção 2.3, trazida da seção 13 do brief.
- ~~MEDIUM: Critério mensurável de validação~~ — **Resolvido:** meta de checkouts iniciados adicionada ao Goal 1 (placeholder numérico, sinalizado para ajuste com dado real do fundador).
- **LOW:** Sem análise competitiva formal nem diagramas de fluxo de usuário — aceitável para o tamanho do projeto, não bloqueia arquitetura.

### Recommendations

1. Antes do lançamento, substituir o placeholder de "≥ 50 checkouts em 4 semanas" por um número acordado com o fundador.
2. Architect pode, a seu critério, propor budgets de performance mais específicos durante o desenho técnico — não é pré-requisito deste PRD dado NFR7.

### Final Decision

**READY FOR ARCHITECT** — todos os itens HIGH/MEDIUM anteriores foram resolvidos nesta rodada. Gaps remanescentes são LOW e não bloqueiam o início da arquitetura.

## 10. Next Steps

### 10.1 UX Expert Prompt

Use este PRD (`docs/prd.md`) como entrada para o modo de criação de arquitetura de front-end/UX. Foco: traduzir a Seção 3 (User Interface Design Goals) e os wireframes de referência (`tria-wireframe-detalhado.pdf`) em especificação de componentes e design system para as 5 telas do MVP (Home, About, Conta, Produtos, Assinatura), respeitando dark luxury científico, alternância de fundo escuro/claro, e WCAG AA.

### 10.2 Architect Prompt

Use este PRD (`docs/prd.md`) como entrada para o modo de criação de arquitetura. Escopo: monolito serverless Next.js 16 + Supabase (Postgres/Auth) + Stripe (Checkout hospedado + Subscriptions), deploy Vercel, 3 épicos / 15 stories sequenciais já definidos (Seções 6-8). Pontos que precisam de decisão arquitetural explícita: schema de dados (produtos/protocolos/pedidos/assinaturas), estratégia de webhook idempotente, e mapeamento de price IDs do Stripe por protocolo/produto.
