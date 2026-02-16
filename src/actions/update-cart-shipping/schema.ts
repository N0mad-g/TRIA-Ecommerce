import { z } from "zod";

export const updateCartShippingSchema = z.object({
  shippingMethod: z.string().min(1),
  shippingInCents: z.number().int().min(0),
  shippingServiceId: z.string().min(1),
});

export type UpdateCartShippingSchema = z.infer<typeof updateCartShippingSchema>;
