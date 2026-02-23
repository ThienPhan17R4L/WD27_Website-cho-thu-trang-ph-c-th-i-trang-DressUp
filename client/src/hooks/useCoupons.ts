import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponsApi } from "@/api/coupons.api";
import type { Coupon } from "@/types/coupon";

export function useAdminCoupons(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ["admin-coupons", params],
    queryFn: () => couponsApi.admin.list(params),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Coupon>) => couponsApi.admin.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Coupon> }) =>
      couponsApi.admin.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.admin.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, orderSubtotal }: { code: string; orderSubtotal: number }) =>
      couponsApi.validate(code, orderSubtotal),
  });
}
