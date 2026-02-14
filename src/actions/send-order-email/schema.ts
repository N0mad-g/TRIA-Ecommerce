import { z } from "zod";

export const sendOrderEmailSchema = z.object({
  orderId: z.uuid(),
  type: z.enum([
    "order-created",
    "payment-pending",
    "payment-approved",
    "order-processing",
    "order-shipped",
    "order-delivered",
  ]),
});

export type SendOrderEmailSchema = z.infer<typeof sendOrderEmailSchema>;
