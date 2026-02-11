import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const RentalTierZ = z.object({
  label: z.string().trim().min(1),
  days: z.number().int().min(1),
  price: z.number().min(0),
});

const VariantZ = z.object({
  size: z.string().trim().min(1),
  color: z.string().trim().optional(),
  skuHint: z.string().trim().optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(), // nếu không gửi sẽ tự generate từ name
  categoryId: objectId.optional(),
  brand: z.string().trim().optional(),
  material: z.string().trim().optional(),
  colorFamily: z.string().trim().optional(),
  description: z.string().optional(),
  images: z.array(z.string().trim()).default([]),
  rentalTiers: z.array(RentalTierZ).default([]),
  depositDefault: z.number().min(0).default(0),
  variants: z.array(VariantZ).default([]),
  tags: z.array(z.string().trim()).default([]),
  care: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "archived"]).default("active"),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    categoryId: objectId.optional(),
    brand: z.string().trim().optional(),
    material: z.string().trim().optional(),
    colorFamily: z.string().trim().optional(),
    description: z.string().optional(),
    images: z.array(z.string().trim()).optional(),
    rentalTiers: z.array(RentalTierZ).optional(),
    depositDefault: z.number().min(0).optional(),
    variants: z.array(VariantZ).optional(),
    tags: z.array(z.string().trim()).optional(),
    care: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["active", "archived"]).optional(),
  })
  .strict();

export const productIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const productSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().trim().optional(), // e.g. "-createdAt", "name"
    q: z.string().trim().optional(), // text search
    categoryId: objectId.optional(),
    status: z.enum(["active", "archived"]).optional(),
    tag: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
  }),
});
