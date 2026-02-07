import { z } from "zod";

export const decreaseCartProductQuantitySchema = z.object({
  cartItemId: z.uuid(),
});

export type decreaseCartProductQuantitySchemaType = z.infer<
  typeof decreaseCartProductQuantitySchema
>;
