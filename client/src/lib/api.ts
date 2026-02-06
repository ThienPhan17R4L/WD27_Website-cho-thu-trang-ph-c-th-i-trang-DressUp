import axiosInstance from "@/api/axios";

export type ApiOk<T> = { ok: true; data: T; meta?: unknown };
export type ApiFail = { ok: false; error?: { message?: string; code?: string; details?: unknown } };

export async function apiGet<T>(path: string, params?: any) {
  const res = await axiosInstance.get<ApiOk<T> | ApiFail>(path, { params });
  const payload: any = res.data;
  if (payload?.ok === false) throw new Error(payload?.error?.message ?? "Request failed");
  return payload as T;
}

export async function apiPost<T>(path: string, body?: any) {
  const res = await axiosInstance.post<ApiOk<T> | ApiFail>(path, body);
  const payload: any = res.data;
  if (payload?.ok === false) throw new Error(payload?.error?.message ?? "Request failed");
  return payload as T;
}

export async function apiPatch<T>(path: string, body?: any) {
  const res = await axiosInstance.patch<ApiOk<T> | ApiFail>(path, body);
  const payload: any = res.data;
  if (payload?.ok === false) throw new Error(payload?.error?.message ?? "Request failed");
  return payload as T;
}

export async function apiDelete<T>(path: string, body?: any) {
  const res = await axiosInstance.delete<ApiOk<T> | ApiFail>(path, { data: body });
  const payload: any = res.data;
  if (payload?.ok === false) throw new Error(payload?.error?.message ?? "Request failed");
  return payload as T;
}
