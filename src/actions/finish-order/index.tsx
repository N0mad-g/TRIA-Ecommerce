"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { sendOrderEmail } from "@/actions/send-order-email";
import { db } from "@/db";
import {
  cartItemTable,
  cartTable,
  orderItemTable,
  orderTable,
  shippingAddressTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

const SHORT_ID_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SHORT_ID_LENGTH = 4;
const MAX_SHORT_ID_LOOKUP_ATTEMPTS = 20;
const MAX_ORDER_CREATION_ATTEMPTS = 5;

const generateShortId = (): string => {
  return Array.from(
    { length: SHORT_ID_LENGTH },
    () =>
      SHORT_ID_CHARACTERS[
        Math.floor(Math.random() * SHORT_ID_CHARACTERS.length)
      ],
  ).join("");
};

const isShortIdUniqueViolation = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const dbError = error as {
    code?: string;
    constraint?: string;
    detail?: string;
    message?: string;
  };

  if (dbError.code !== "23505") {
    return false;
  }

  const collisionText = `${dbError.constraint ?? ""} ${dbError.detail ?? ""} ${dbError.message ?? ""}`;
  return collisionText.includes("short_id");
};

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
  for (
    let creationAttempt = 0;
    creationAttempt < MAX_ORDER_CREATION_ATTEMPTS;
    creationAttempt++
  ) {
    try {
      await db.transaction(async (tx) => {
        let shortId = generateShortId();

        for (
          let shortIdAttempt = 0;
          shortIdAttempt < MAX_SHORT_ID_LOOKUP_ATTEMPTS;
          shortIdAttempt++
        ) {
          const existingOrder = await tx.query.orderTable.findFirst({
            where: eq(orderTable.shortId, shortId),
            columns: { id: true },
          });

          if (!existingOrder) {
            break;
          }

          shortId = generateShortId();

          if (shortIdAttempt === MAX_SHORT_ID_LOOKUP_ATTEMPTS - 1) {
            throw new Error("Failed to generate unique shortId");
          }
        }

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
            shortId,
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

      break;
    } catch (error) {
      const isLastAttempt = creationAttempt === MAX_ORDER_CREATION_ATTEMPTS - 1;
      if (!isShortIdUniqueViolation(error) || isLastAttempt) {
        throw error;
      }
    }
  }

  if (!orderId) {
    throw new Error("Failed to create order");
  }

  try {
    await sendOrderEmail({
      orderId: orderId,
      type: "order-created",
    });
  } catch (error) {
    console.error("Falha ao enviar email de pedido criado:", error);
  }

  return { orderId };
};
