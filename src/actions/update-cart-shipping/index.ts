"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { UpdateCartShippingSchema, updateCartShippingSchema } from "./schema";

export const updateCartShipping = async (data: UpdateCartShippingSchema) => {
  const parsedData = updateCartShippingSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  await db
    .update(cartTable)
    .set({
      shippingMethod: parsedData.shippingMethod,
      shippingInCents: parsedData.shippingInCents,
      shippingServiceId: parsedData.shippingServiceId,
    })
    .where(eq(cartTable.id, cart.id));

  console.log(
    "[Update Cart Shipping] Frete atualizado no carrinho",
    parsedData,
  );

  return { success: true };
};
