import { z } from "zod";

export const calculateShippingSchema = z.object({
  to: z.object({
    postal_code: z.string().min(8),
    address: z.string().min(1),
    number: z.string().min(1),
    city: z.string().min(1),
    state_abbr: z.string().min(2).max(2),
  }),
});

export type CalculateShippingSchema = z.infer<typeof calculateShippingSchema>;

export type ShippingOption = {
  id: string;
  name: string;
  price: number;
  delivery_time: number | null;
};
