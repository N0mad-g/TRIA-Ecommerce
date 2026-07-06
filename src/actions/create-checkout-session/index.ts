"use server";

import { getProductBySlug } from "@/data/products";
import { getProtocolBySlug } from "@/data/protocols";
import { stripe } from "@/lib/stripe";

import {
  type CreateCheckoutSessionInput,
  createCheckoutSessionSchema,
} from "./schema";

export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  const { kind, slug, mode } = createCheckoutSessionSchema.parse(input);

  const siteUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  let name: string;
  let unitAmount: number;

  if (kind === "protocolo") {
    const protocol = getProtocolBySlug(slug);
    if (!protocol) throw new Error("Protocolo não encontrado");
    name = protocol.name;
    unitAmount = mode === "assinatura" ? protocol.price : protocol.fullPrice;
  } else {
    const product = getProductBySlug(slug);
    if (!product) throw new Error("Produto não encontrado");
    name = product.name;
    unitAmount = product.price;
  }

  const isSubscription = kind === "protocolo" && mode === "assinatura";

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "brl",
          unit_amount: Math.round(unitAmount * 100),
          product_data: { name },
          ...(isSubscription
            ? { recurring: { interval: "month" as const } }
            : {}),
        },
      },
    ],
    success_url: `${siteUrl}/checkout/confirmacao?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/${kind}/${slug}`,
  });

  if (!session.url) {
    throw new Error("Não foi possível iniciar o checkout");
  }

  return { url: session.url };
}
