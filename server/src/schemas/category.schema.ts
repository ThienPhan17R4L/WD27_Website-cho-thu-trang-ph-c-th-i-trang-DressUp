import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createCategorySchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(), // nếu không gửi -> slugify(name)
  description: z.string().optional(),
  parentId: objectId.nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    parentId: objectId.nullable().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .strict();

export const categoryIdParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const categorySlugParamSchema = z.object({
  params: z.object({ slug: z.string().trim().min(1) }),
});

export const listCategoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    q: z.string().trim().optional(),
    parentId: objectId.optional().or(z.literal("null")).optional(),
    isActive: z.coerce.boolean().optional(),
    sort: z.string().trim().optional(), // "sortOrder", "-createdAt"
  }),
});
