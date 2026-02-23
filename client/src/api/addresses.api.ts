import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "@/types/address";

export const addressesApi = {
  list: () => apiGet<{ data: Address[] }>("/addresses"),

  create: (data: CreateAddressPayload) => apiPost<Address>("/addresses", data),

  update: (id: string, data: UpdateAddressPayload) =>
    apiPatch<Address>(`/addresses/${id}`, data),

  remove: (id: string) => apiDelete<{ ok: true }>(`/addresses/${id}`),

  setDefault: (id: string) =>
    apiPatch<Address>(`/addresses/${id}/default`, {}),
};
