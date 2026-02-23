import { apiGet } from "@/lib/api";

export type AuditLog = {
  _id: string;
  entity: string;
  entityId: string;
  action: string;
  performedBy: string;
  changes: Array<{
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }>;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type AuditLogsResponse = {
  data: AuditLog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const auditApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiGet<AuditLogsResponse>("/admin/audit-logs", params),

  getTrail: (entity: string, entityId: string) =>
    apiGet<AuditLog[]>(`/admin/audit-logs/${entity}/${entityId}`),
};
