"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";

import { db } from "@/db";
import { orderItemTable, orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import {
  CreateCheckoutSessionSchema,
  createCheckoutSessionSchema,
} from "./schema";

const getStripeCompatibleImageUrls = (
  rawImageUrl: string | null | undefined,
  appUrl: string,
) => {
  if (!rawImageUrl) {
    return undefined;
  }

  const normalizedValue = rawImageUrl.trim();
  if (!normalizedValue) {
    return undefined;
  }

  try {
    const url = normalizedValue.startsWith("http")
      ? new URL(normalizedValue)
      : new URL(normalizedValue, appUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      console.warn(
        "[Stripe Checkout] Ignorando imagem com protocolo inválido",
        {
          rawImageUrl,
          protocol: url.protocol,
        },
      );
      return undefined;
    }

    return [url.toString()];
  } catch (error) {
    console.warn("[Stripe Checkout] Ignorando URL de imagem inválida", {
      rawImageUrl,
      error,
    });
    return undefined;
  }
};

export const createCheckoutSession = async (
  data: CreateCheckoutSessionSchema,
) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not set");
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const { orderId } = createCheckoutSessionSchema.parse(data);
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }
  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      product: true,
    },
  });
  if (orderItems.length === 0) {
    throw new Error("Order has no items");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");
  const shortId =
    order.shortId ??
    order.id
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4);

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${appUrl}/checkout/success?shortId=${encodeURIComponent(
      shortId,
    )}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      orderId,
    },
    line_items: [
      ...orderItems.map((orderItem) => {
        const imageUrls = getStripeCompatibleImageUrls(
          orderItem.product.imageUrl,
          appUrl,
        );
        return {
          price_data: {
            currency: "brl",
            product_data: {
              name: orderItem.product.name,
              description: orderItem.product.description,
              images: imageUrls,
            },
            unit_amount: orderItem.priceInCents,
          },
          quantity: orderItem.quantity,
        };
      }),
      ...(order.shippingInCents && order.shippingInCents > 0
        ? [
            {
              price_data: {
                currency: "brl",
                product_data: {
                  name: `Frete - ${order.shippingMethod ?? "Entrega"}`,
                },
                unit_amount: order.shippingInCents,
              },
              quantity: 1,
            },
          ]
        : []),
    ],
  });
  return checkoutSession;
};
