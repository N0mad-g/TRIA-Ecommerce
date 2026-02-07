"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  cartItemTable,
  cartTable,
  orderItemTable,
  orderTable,
  shippingAddressTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export const finishOrder = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, session.user.id),
    with: {
      shippingAddress: true,
      items: {
        with: {
          product: true,
        },
      },
    },
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  let shippingAddress = cart.shippingAddress;
  if (!shippingAddress) {
    const [latestAddress] = await db
      .select()
      .from(shippingAddressTable)
      .where(eq(shippingAddressTable.userId, session.user.id))
      .orderBy(desc(shippingAddressTable.createdAt))
      .limit(1);

    if (!latestAddress) {
      throw new Error("Shipping address not found");
    }

    await db
      .update(cartTable)
      .set({ shippingAddressId: latestAddress.id })
      .where(eq(cartTable.id, cart.id));

    shippingAddress = latestAddress;
  }

  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }
  const totalPriceInCents = cart.items.reduce(
    (acc, item) => acc + item.product.priceInCents * item.quantity,
    0,
  );
  let orderId: string | undefined;
  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orderTable)
      .values({
        email: shippingAddress.email,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phoneNumber,
        cpfOrCnpj: shippingAddress.cpfOrCnpj,
        city: shippingAddress.city,
        complement: shippingAddress.complement,
        neighborhood: shippingAddress.neighborhood,
        number: shippingAddress.number,
        recipientName: shippingAddress.recipientName,
        state: shippingAddress.state,
        street: shippingAddress.street,
        userId: session.user.id,
        totalPriceInCents,
        shippingAddressId: shippingAddress.id,
      })
      .returning();
    if (!order) {
      throw new Error("Failed to create order");
    }
    orderId = order.id;
    const orderItemsPayload: Array<typeof orderItemTable.$inferInsert> =
      cart.items.map((item) => ({
        orderId: order.id,
        productId: item.product.id,
        quantity: item.quantity,
        priceInCents: item.product.priceInCents,
      }));
    await tx.insert(orderItemTable).values(orderItemsPayload);
    await tx.delete(cartTable).where(eq(cartTable.id, cart.id));
    await tx.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
  });
  if (!orderId) {
    throw new Error("Failed to create order");
  }
  return { orderId };
};
