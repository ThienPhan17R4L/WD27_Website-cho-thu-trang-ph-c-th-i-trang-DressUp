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

export function useInventoryGrouped(params: { page: number; limit: number; search?: string }) {
  return useQuery({
    queryKey: ["inventory-grouped", params],
    queryFn: () => inventoryApi.getGrouped(params),
  });
}

export function useCreateInventoryForVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, size, color, initialQty }: { productId: string; size: string; color?: string; initialQty: number }) =>
      inventoryApi.createForVariant(productId, size, color, initialQty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory-grouped"] }),
  });
}

export function useAddStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => inventoryApi.addStock(id, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory-grouped"] }),
  });
}

export function useRemoveStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => inventoryApi.removeStock(id, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory-grouped"] }),
  });
}

export function useMarkCleaned() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => inventoryApi.markCleaned(id, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory-grouped"] }),
  });
}

export function useMarkRepaired() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => inventoryApi.markRepaired(id, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory-grouped"] }),
  });
}

export function useMarkBroken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => inventoryApi.markBroken(id, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory-grouped"] }),
  });
}
