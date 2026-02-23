import { apiGet, apiPatch, apiPost } from "@/lib/api";

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

export type GroupedInventory = {
  _id: string;
  productName: string;
  productImage: string;
  productSlug: string;
  totalQty: number;
  availableQty: number;
  variants: Array<{
    _id: string | null;
    sku: string;
    size: string;
    color?: string;
    qtyTotal: number;
    qtyAvailable: number;
    qtyInCleaning: number;
    qtyInRepair: number;
    qtyLost: number;
  }>;
};

export type GroupedInventoryResponse = {
  data: GroupedInventory[];
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

  getGrouped: (params: { page: number; limit: number; search?: string }) =>
    apiGet<GroupedInventoryResponse>("/admin/inventory/grouped", params),

  createForVariant: (productId: string, size: string, color: string | undefined, initialQty: number) =>
    apiPost(`/admin/inventory/create-for-variant`, { productId, size, color, initialQty }),

  addStock: (id: string, qty: number) =>
    apiPost(`/admin/inventory/${id}/add-stock`, { qty }),

  removeStock: (id: string, qty: number) =>
    apiPost(`/admin/inventory/${id}/remove-stock`, { qty }),

  markCleaned: (id: string, qty: number) =>
    apiPost(`/admin/inventory/${id}/mark-cleaned`, { qty }),

  markRepaired: (id: string, qty: number) =>
    apiPost(`/admin/inventory/${id}/mark-repaired`, { qty }),

  markBroken: (id: string, qty: number) =>
    apiPost(`/admin/inventory/${id}/mark-broken`, { qty }),
};
