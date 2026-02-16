import { z } from "zod";

export const createMelhorEnvioShipmentSchema = z.object({
  orderId: z.uuid("Order ID must be a valid UUID"),
});

export type CreateMelhorEnvioShipmentSchema = z.infer<
  typeof createMelhorEnvioShipmentSchema
>;

export type CreateMelhorEnvioShipmentResponse = {
  ok: boolean;
  data?: {
    melhorEnvioOrderId: string;
    trackingCode: string;
    shippingLabelUrl: string;
  };
  error?: string;
};
