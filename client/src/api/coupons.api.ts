import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { Coupon, CouponValidateResult, CouponsListResponse } from "@/types/coupon";

export const couponsApi = {
  // Customer
  validate: (code: string, orderSubtotal: number) =>
    apiPost<CouponValidateResult>("/coupons/validate", { code, orderSubtotal }),

  // Admin CRUD
  admin: {
    list: (params?: { page?: number; limit?: number; isActive?: boolean }) =>
      apiGet<CouponsListResponse>("/coupons/admin", params),

    create: (data: Partial<Coupon>) =>
      apiPost<Coupon>("/coupons/admin", data),

    update: (id: string, data: Partial<Coupon>) =>
      apiPatch<Coupon>(`/coupons/admin/${id}`, data),

    remove: (id: string) =>
      apiDelete<{ ok: true }>(`/coupons/admin/${id}`),
  },
};
