import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  kind: z.enum(["protocolo", "produto"]),
  slug: z.string().min(1),
  mode: z.enum(["assinatura", "avulso"]),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;
