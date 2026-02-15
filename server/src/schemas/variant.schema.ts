import { z } from "zod/v4";

export const createVariantSchema = z.object({
  sku: z.string().min(1).max(50),
  size: z.string().min(1).max(20),
  color: z.string().max(50).optional(),
  condition: z.enum(["new", "like-new", "good"]).optional().default("new"),
  rentalPricePerDay: z.number().min(0).optional(),
  depositOverride: z.number().min(0).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateVariantSchema = createVariantSchema.partial();

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
