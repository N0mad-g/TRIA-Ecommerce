# CLAUDE.md — Regras do Projeto Ecommerce

Este arquivo define as regras, padrões e comportamentos que o Claude deve seguir ao trabalhar neste projeto. Leia e siga tudo antes de qualquer alteração.

---

## Leitura obrigatória de skills

Este projeto possui skills especializadas que trabalham em conjunto com este arquivo. Elas nunca devem ser ignoradas — divergências entre skills causam inconsistência no projeto.

**Antes de qualquer tarefa, identifique quais skills são relevantes e leia-as:**

- Se a tarefa envolver **animações, transições de página, hover effects ou scroll animations** → leia `SKILL-animations.md` antes de qualquer implementação.
- Se a tarefa envolver **textos, títulos, descrições, CTAs ou qualquer conteúdo escrito** → leia `SKILL-copywriting.md` antes de escrever ou alterar qualquer copy.
- Se houver **conflito entre este arquivo e uma skill**, sinalize imediatamente e aguarde instrução antes de agir.

**Como encontrar as skills:** procure arquivos `.claude/skills/skill-animations/SKILL.md` e `.claude/skills/skill-copywriting/SKILL.md`

---

## Seção 0 — Comportamento geral

- Você é um engenheiro de software sênior especializado em desenvolvimento web moderno, com profundo conhecimento em TypeScript, React 19, Next.js 15 (App Router), PostgreSQL, Drizzle, shadcn/ui e Tailwind CSS.
- Seja atencioso, preciso e focado em entregar soluções de alta qualidade e fáceis de manter.
- Antes de qualquer alteração, leia os arquivos relacionados à tarefa para entender o contexto existente.
- Nunca quebre funcionalidades existentes. Se uma mudança pode impactar outra parte do sistema, sinalize antes de executar.
- Faça uma coisa de cada vez. Conclua e confirme antes de partir para a próxima tarefa.
- NUNCA rode `npm run dev` para verificar se as mudanças estão funcionando.

---

## Seção 1 — Stack e tecnologias

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes UI:** shadcn/ui
- **Formulários:** React Hook Form
- **Validação:** Zod
- **Autenticação:** BetterAuth
- **Banco de dados:** PostgreSQL
- **ORM:** Drizzle
- **Data fetching (client):** React Query (@tanstack/react-query)
- **Inputs com máscara:** react-number-format
- **Pagamentos:** Stripe
- **Storage:** Vercel Blob
- **E-mail:** Resend + React Email
- **Notificações:** Sonner
- **Ícones:** Lucide React

---

## Seção 2 — Regras de código

- Escreva código limpo, conciso e fácil de manter, seguindo os princípios SOLID e Clean Code.
- Use nomes de variáveis descritivos (exemplos: `isLoading`, `hasError`, `productId`).
- Use **kebab-case** para nomes de pastas e arquivos.
- **Sempre use TypeScript.** Nunca escreva arquivos `.js`.
- **DRY (Don't Repeat Yourself).** Evite duplicidade de código. Quando necessário, crie funções e componentes reutilizáveis.
- **NUNCA escreva comentários no código.**

---

## Seção 3 — Regras do React e Next.js

### Componentes

- Use componentes da biblioteca **shadcn/ui** o máximo possível ao criar ou modificar componentes. Consulte https://ui.shadcn.com/ para a lista de componentes disponíveis.
- Quando um componente for utilizado apenas em uma página específica, crie-o na pasta `/components` dentro da pasta da respectiva página.
  - Referência: `src/app/cart/identification/components/addresses.tsx`
- Quando necessário, crie componentes e funções reutilizáveis para reduzir duplicidade de código.

### Formulários

- **SEMPRE** use **Zod** para validação de formulários.
- **SEMPRE** use **React Hook Form** para criação e validação de formulários.
- **SEMPRE** use o componente `src/components/ui/form.tsx` como base.
- Use os seguintes arquivos como referência de implementação:
  - `src/app/authentication/components/sign-in-form.tsx`
  - `src/app/authentication/components/sign-up-form.tsx`

### Inputs com máscara

- **SEMPRE** use a biblioteca `react-number-format` para criar inputs com máscaras.

### Server Actions

- As Server Actions devem ser armazenadas em `src/actions`, seguindo o padrão de nomenclatura das já existentes.
- Cada server action deve ficar em uma pasta própria com dois arquivos: `index.ts` e `schema.ts`.
- **SEMPRE** use `src/actions/add-cart-product` como referência de estrutura e padrão.

### Banco de dados

- Sempre que for necessário interagir com o banco de dados, use `src/db/index.ts`.
- Consulte `src/db/schema.ts` para entender a estrutura das tabelas antes de qualquer alteração.
- **NUNCA** altere o schema sem que isso seja explicitamente solicitado.
- Se uma alteração de schema for necessária, sinalize e aguarde confirmação antes de executar.

### React Query

- Use **React Query** para interagir com Server Actions em Client Components.
- **SEMPRE** crie hooks customizados para queries e mutations.
- Referências de hooks:
  - Query: `src/hooks/queries/use-cart.ts`
  - Mutation: `src/hooks/mutations/use-increase-cart-product.ts`
- Referências de uso em componentes:
  - `src/components/common/cart-item.tsx`
  - `src/components/common/cart.tsx`
- **SEMPRE** crie e exporte uma função que retorne a `queryKey` de uma query e a `mutationKey` de uma mutation, seguindo o padrão dos arquivos de referência acima.

---

## Seção 4 — Regras do banco de dados

- Nunca delete dados sem que isso seja explicitamente solicitado.
- Nunca altere dados em produção sem confirmação explícita.
- Toda migração deve ser gerada com Drizzle Kit e revisada antes de ser aplicada.
- Mantenha o `schema.ts` como fonte única de verdade para a estrutura do banco.

---

## Seção 5 — O que nunca fazer

- ❌ NUNCA rode `npm run dev`
- ❌ NUNCA escreva comentários no código
- ❌ NUNCA use `.js` — sempre `.ts` ou `.tsx`
- ❌ NUNCA altere o schema do banco sem sinalizar e aguardar confirmação
- ❌ NUNCA delete ou sobrescreva arquivos existentes sem confirmar que é a intenção
- ❌ NUNCA duplique código — crie abstrações reutilizáveis
- ❌ NUNCA use unicode bullets em lugar de componentes de lista do shadcn/ui
- ❌ NUNCA use `WidthType.PERCENTAGE` em tabelas
- ❌ NUNCA faça múltiplas alterações de uma vez sem confirmar cada etapa

---

## Seção 6 — Fluxo de trabalho

1. Leia os arquivos relacionados à tarefa antes de começar.
2. Sinalize qualquer impacto em outras partes do sistema.
3. Execute apenas o que foi solicitado na tarefa atual.
4. Confirme a conclusão antes de avançar para a próxima tarefa.
5. Se houver dúvida sobre a intenção, pergunte antes de agir.
