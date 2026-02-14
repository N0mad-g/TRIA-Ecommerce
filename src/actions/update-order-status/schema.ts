import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(["processing", "shipped", "delivered"]),
});

export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
