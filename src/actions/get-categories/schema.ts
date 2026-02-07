import { z } from "zod";

export const getCategoriesSchema = z.object({});

export type GetCategoriesSchema = z.infer<typeof getCategoriesSchema>;
