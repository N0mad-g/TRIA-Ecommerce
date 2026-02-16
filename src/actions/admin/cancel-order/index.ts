"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { z } from "zod";

const CancelOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const cancelOrder = async (data: z.infer<typeof CancelOrderSchema>) => {
  CancelOrderSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  const [order] = await db
    .update(orderTable)
    .set({ status: "canceled" })
    .where(eq(orderTable.id, data.orderId))
    .returning();

  if (!order) throw new Error("Order not found");

  return { ok: true, order };
};
