import { apiGet, apiPost, apiPatch } from "@/lib/api";
import type { Return, ReturnsListResponse } from "@/types/return";

export const returnsApi = {
  // Customer: initiate return
  initiate: (orderId: string, data: { returnMethod: "in_store" | "shipping"; trackingNumber?: string }) =>
    apiPost<Return>(`/orders/${orderId}/return`, data),

  // Staff/Admin: list & manage returns
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    apiGet<ReturnsListResponse>("/returns", params),

  getById: (id: string) => apiGet<Return>(`/returns/${id}`),

  inspect: (id: string, items: Array<{
    orderItemIndex: number;
    conditionAfter: string;
    damageNotes?: string;
    damageFee: number;
  }>) => apiPatch<Return>(`/returns/${id}/inspect`, { items }),

  close: (id: string) => apiPatch<Return>(`/returns/${id}/close`, {}),
};
