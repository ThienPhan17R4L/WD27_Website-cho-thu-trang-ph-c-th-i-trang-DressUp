import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/api/audit.api";

export function useAuditLogs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditApi.list(params),
  });
}

export function useAuditTrail(entity: string, entityId: string) {
  return useQuery({
    queryKey: ["audit-trail", entity, entityId],
    queryFn: () => auditApi.getTrail(entity, entityId),
    enabled: !!(entity && entityId),
  });
}
