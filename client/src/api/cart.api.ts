import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

export type Cart = any;

export type AddToCartPayload = {
  productId: string;
  variantId: string;
  qty: number;
  rentalStart: string; // YYYY-MM-DD
  rentalEnd: string;
};

export type UpdateCartItemPayload = {
  itemId: string;
  qty?: number;
  rentalStart?: string;
  rentalEnd?: string;
};

export type RemoveCartItemPayload = { itemId: string };

export const cartApi = {
  get: () => apiGet<Cart>("/cart"),
  add: (payload: AddToCartPayload) => apiPost<Cart>("/cart", payload),
  update: (payload: UpdateCartItemPayload) => apiPatch<Cart>("/cart", payload),
  remove: (payload: RemoveCartItemPayload) => apiDelete<Cart>("/cart", payload),
  clear: () => apiDelete<Cart>("/cart/clear"),
};
