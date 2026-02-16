"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { z } from "zod";

const DeleteOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const deleteOrder = async (data: z.infer<typeof DeleteOrderSchema>) => {
  DeleteOrderSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  // WARNING: This performs a hard delete. Consider using soft-delete in production.
  const deleteResult = await db
    .delete(orderTable)
    .where(eq(orderTable.id, data.orderId));

  return { ok: true, deleted: deleteResult.rowCount === 1 };
};
