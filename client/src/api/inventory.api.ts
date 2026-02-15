import { apiGet, apiPatch } from "@/lib/api";

export type InventoryItem = {
  _id: string;
  productId: string;
  variantKey: { size: string; color?: string };
  qtyTotal: number;
  qtyAvailable: number;
  product?: {
    _id: string;
    name: string;
    images: string[];
  };
  createdAt: string;
  updatedAt: string;
};

export type InventoryListResponse = {
  data: InventoryItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const inventoryApi = {
  list: (params?: { page?: number; limit?: number; productId?: string }) =>
    apiGet<InventoryListResponse>("/admin/inventory", params),

  adjust: (id: string, data: { qtyTotal?: number; qtyAvailable?: number }) =>
    apiPatch<InventoryItem>(`/admin/inventory/${id}`, data),
};
