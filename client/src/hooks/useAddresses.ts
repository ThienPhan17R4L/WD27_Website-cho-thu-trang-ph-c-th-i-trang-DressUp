import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressesApi } from "@/api/addresses.api";
import type { CreateAddressPayload, UpdateAddressPayload } from "@/types/address";

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.list(),
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAddressPayload) => addressesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressPayload }) =>
      addressesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useRemoveAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}
