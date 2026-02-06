import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi, type AddToCartPayload, type UpdateCartItemPayload, type RemoveCartItemPayload } from "@/api/cart.api";

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.get(),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartApi.add(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCartItemPayload) => cartApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RemoveCartItemPayload) => cartApi.remove(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}
