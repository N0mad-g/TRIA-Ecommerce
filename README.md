# TRIA — Ciência para reconstruir sua identidade

E-commerce da TRIA, marca premium de hair care masculino. Next.js (App Router) +
Tailwind CSS + Framer Motion + Stripe.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion (animações) + Canvas API nativo (`DNACanvas`, `RitualCanvas`)
- Stripe Checkout (pagamento avulso e assinatura de protocolo)

## Estrutura

```
/                     Home
/protocolos           Listagem dos protocolos
/protocolo/[slug]      Detalhe do protocolo (assinatura/avulso)
/produtos             Loja avulsa
/produto/[slug]        Detalhe do produto
/checkout             Redireciona para o Stripe Checkout
/checkout/confirmacao Confirmação pós-pagamento
/conta                Área do assinante
```

Dados de protocolos, produtos e depoimentos em `src/data/`.

## Variáveis de ambiente

```bash
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_URL=https://ecomercesmgrow.vercel.app
```

## Assets pendentes

As imagens dos produtos (`/public/images/products/*.png`) e o vídeo do ritual
(`/public/video/ritual.mp4`) ainda não foram adicionados — ver `src/data/products.ts`
para os caminhos esperados.
