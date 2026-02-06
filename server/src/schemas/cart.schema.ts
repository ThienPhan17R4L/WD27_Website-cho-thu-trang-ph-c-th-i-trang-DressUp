import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const addToCartSchema = z.object({
  body: z.object({
    productId: objectId,

    rental: z.object({
      label: z.string(),
      days: z.number().int().min(1),
      price: z.number().min(0),
    }),

    variant: z
      .object({
        size: z.string(),
        color: z.string().optional(),
      })
      .optional(),

    quantity: z.number().int().min(1).default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    productId: objectId,
    quantity: z.number().int().min(1),
  }),
});

export const removeCartItemSchema = z.object({
  body: z.object({
    productId: objectId,
  }),
});
