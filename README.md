# TRIA

E-commerce TRIA — protocolos e produtos de hair care masculino premium.

## Pré-requisitos

- Node.js 20+ (LTS mais recente compatível com a versão do Next.js instalada)
- npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli) — para rodar migrations locais
- [Stripe CLI](https://stripe.com/docs/stripe-cli) — para simular webhooks localmente (`stripe listen`, `stripe trigger`)

## Setup inicial

```bash
git clone <repo>
cd tria
npm install
cp .env.example .env.local   # preencher com chaves reais — ver docs/architecture.md Seção 11.2
```

## Comandos de desenvolvimento

```bash
# Servidor de dev (Next.js, Turbopack)
npm run dev

# Testes (Jest + React Testing Library + jest-axe)
npm test
npm run test:watch

# Build de produção
npm run build

# Lint
npm run lint
```

## Documentação do projeto

- [PRD](docs/prd.md)
- [Architecture](docs/architecture.md)
- [Schema Design](docs/schema-design.md)
- [Stories](docs/stories/)

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · lucide-react · Supabase (Postgres + Auth) · Stripe · Vercel

Ver [docs/architecture.md](docs/architecture.md) Seção 3 (Tech Stack) para detalhes e rationale de cada escolha.
