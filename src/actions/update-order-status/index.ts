"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { sendOrderEmail } from "@/actions/send-order-email";
import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { UpdateOrderStatusSchema, updateOrderStatusSchema } from "./schema";

type EmailTypeByStatus = {
  processing: "order-processing";
  shipped: "order-shipped";
  delivered: "order-delivered";
};

const emailTypeByStatus: EmailTypeByStatus = {
  processing: "order-processing",
  shipped: "order-shipped",
  delivered: "order-delivered",
};

export const updateOrderStatus = async (data: UpdateOrderStatusSchema) => {
  updateOrderStatusSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const [order] = await db
    .update(orderTable)
    .set({
      status: data.status,
    })
    .where(eq(orderTable.id, data.orderId))
    .returning();

  if (!order) {
    throw new Error("Order not found");
  }

  await sendOrderEmail({
    orderId: order.id,
    type: emailTypeByStatus[data.status],
  });

  return order;
};
