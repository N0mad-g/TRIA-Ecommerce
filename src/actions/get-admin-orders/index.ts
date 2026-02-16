"use server";

import { desc } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getAdminOrders = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const orders = await db.query.orderTable.findMany({
    orderBy: desc(orderTable.createdAt),
  });

  return orders;
};
