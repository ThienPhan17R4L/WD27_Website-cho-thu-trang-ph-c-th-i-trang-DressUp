import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/inventory.api";

export function useInventory(params?: {
  page?: number;
  limit?: number;
  productId?: string;
}) {
  return useQuery({
    queryKey: ["inventory", params],
    queryFn: () => inventoryApi.list(params),
  });
}

export function useAdjustInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { qtyTotal?: number; qtyAvailable?: number } }) =>
      inventoryApi.adjust(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
