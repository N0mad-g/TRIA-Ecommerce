import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum([
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "canceled",
  ]),
});

export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
