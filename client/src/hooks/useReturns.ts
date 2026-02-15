import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { returnsApi } from "@/api/returns.api";

export function useReturns(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["returns", params],
    queryFn: () => returnsApi.list(params),
  });
}

export function useReturn(id: string) {
  return useQuery({
    queryKey: ["returns", id],
    queryFn: () => returnsApi.getById(id),
    enabled: !!id,
  });
}

export function useInitiateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: {
      orderId: string;
      data: { returnMethod: "in_store" | "shipping"; trackingNumber?: string };
    }) => returnsApi.initiate(orderId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["returns"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useInspectReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: {
      id: string;
      items: Array<{
        orderItemIndex: number;
        conditionAfter: string;
        damageNotes?: string;
        damageFee: number;
      }>;
    }) => returnsApi.inspect(id, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["returns"] }),
  });
}

export function useCloseReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => returnsApi.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["returns"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
