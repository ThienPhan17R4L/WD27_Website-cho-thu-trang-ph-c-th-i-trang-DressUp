import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { User } from "@/types/auth";

export const profileApi = {
  getProfile: () => apiGet<User>("/profile"),

  updateProfile: (data: { fullName?: string; phone?: string }) =>
    apiPatch<User>("/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiPost<{ ok: true }>("/profile/change-password", data),

  forgotPassword: (email: string) =>
    apiPost<{ ok: true }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiPost<{ ok: true }>("/auth/reset-password", { token, newPassword }),
};
