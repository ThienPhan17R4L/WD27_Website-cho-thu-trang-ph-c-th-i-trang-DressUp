import { useState } from "react";
import { Container } from "@/components/common/Container";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { PaginationBar } from "@/components/common/PaginationBar";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs({ page, limit: 30 });

  const items = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const formatChanges = (changes: any[]) => {
    if (!changes || changes.length === 0) return "-";
    return changes.map((c) => {
      if (c.oldValue !== undefined && c.newValue !== undefined) {
        return `${c.field}: ${c.oldValue} → ${c.newValue}`;
      }
      if (c.newValue !== undefined) {
        return `${c.field}: ${c.newValue}`;
      }
      return c.field;
    }).join(", ");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-xl font-semibold text-slate-900">Nhật ký hệ thống</h1>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Chưa có log nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Hành động</th>
                    <th className="px-4 py-3">Người thực hiện</th>
                    <th className="px-4 py-3">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((log: any) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                          {log.entity}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {log.entityId?.slice(-8)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{log.action}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.performedBy === "system" ? (
                          <span className="text-xs italic text-slate-400">system</span>
                        ) : (
                          <span className="font-mono text-xs">{log.performedBy?.slice(-6)}</span>
                        )}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-500">
                        {formatChanges(log.changes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </Container>
    </div>
  );
}
