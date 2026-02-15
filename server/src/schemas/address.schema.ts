import { z } from "zod/v4";

export const createAddressSchema = z.object({
  label: z.string().max(50).optional().default("Home"),
  receiverName: z.string().min(1).max(100),
  receiverPhone: z.string().regex(/^\d{10,11}$/),
  line1: z.string().min(1).max(200),
  ward: z.string().min(1).max(100),
  district: z.string().min(1).max(100),
  province: z.string().min(1).max(100),
  country: z.string().max(10).optional().default("VN"),
  postalCode: z.string().max(20).optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
