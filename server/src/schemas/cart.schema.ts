import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const addToCartSchema = z.object({
  productId: objectId,
  rentalStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  rentalEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  variant: z
    .object({
      size: z.string(),
      color: z.string().optional(),
    })
    .optional(),
  quantity: z.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  itemId: objectId,
  quantity: z.number().int().min(1).optional(),
  rentalStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  rentalEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  variant: z
    .object({
      size: z.string(),
      color: z.string().optional(),
    })
    .optional(),
});

export const removeCartItemSchema = z.object({
  itemId: objectId,
});
