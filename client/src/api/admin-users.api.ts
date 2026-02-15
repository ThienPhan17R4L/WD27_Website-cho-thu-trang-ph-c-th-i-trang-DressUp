import { apiGet, apiPost, apiPatch } from "@/lib/api";
import type { User } from "@/types/auth";

export type UsersListResponse = {
  data: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const adminUsersApi = {
  list: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    apiGet<UsersListResponse>("/admin/users", params),

  getById: (id: string) => apiGet<User>(`/admin/users/${id}`),

  createStaff: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    apiPost<User>("/admin/users/staff", data),

  updateRoles: (id: string, roles: string[]) =>
    apiPatch<User>(`/admin/users/${id}/roles`, { roles }),

  block: (id: string, reason?: string) =>
    apiPatch<User>(`/admin/users/${id}/block`, { reason }),

  unblock: (id: string) =>
    apiPatch<User>(`/admin/users/${id}/unblock`, {}),
};
