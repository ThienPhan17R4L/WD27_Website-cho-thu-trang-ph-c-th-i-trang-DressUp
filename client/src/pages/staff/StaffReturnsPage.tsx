import { useState } from "react";
import { Container } from "@/components/common/Container";
import { PaginationBar } from "@/components/common/PaginationBar";
import { useReturns, useInspectReturn, useCloseReturn } from "@/hooks/useReturns";
import { useNotification } from "@/contexts/NotificationContext";
import { formatVND } from "@/utils/formatCurrency";
import type { Return } from "@/types/return";

/* ── Status labels đúng theo server Return model ── */
const STATUS_LABELS: Record<string, { text: string; cls: string }> = {
  pending_inspection: { text: "Chờ kiểm tra", cls: "bg-yellow-100 text-yellow-700" },
  inspected: { text: "Đã kiểm tra", cls: "bg-indigo-100 text-indigo-700" },
  closed: { text: "Đã đóng", cls: "bg-green-100 text-green-700" },
};

const STATUS_FILTER = [
  { value: "", label: "Tất cả" },
  { value: "pending_inspection", label: "Chờ kiểm tra" },
  { value: "inspected", label: "Đã kiểm tra" },
  { value: "closed", label: "Đã đóng" },
];

const CONDITION_LABELS: Record<string, string> = {
  good: "Tốt",
  minor_damage: "Hư hỏng nhẹ",
  major_damage: "Hư hỏng nặng",
  lost: "Mất",
};

export default function StaffReturnsPage() {
  const { showNotification } = useNotification();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useReturns({ page, limit: 20, status: status || undefined });
  const inspectMutation = useInspectReturn();
  const closeMutation = useCloseReturn();

  // Inspect modal
  const [inspectingReturn, setInspectingReturn] = useState<Return | null>(null);
  const [inspectItems, setInspectItems] = useState<Array<{
    orderItemIndex: number;
    conditionAfter: string;
    damageNotes: string;
    damageFee: number;
  }>>([]);

  const items: Return[] = data?.data || [];
  const totalPages = data?.totalPages || 1;

  function openInspect(ret: Return) {
    setInspectingReturn(ret);
    setInspectItems(
      ret.items.map((item) => ({
        orderItemIndex: item.orderItemIndex,
        conditionAfter: "good",
        damageNotes: "",
        damageFee: 0,
      }))
    );
  }

  async function handleInspect() {
    if (!inspectingReturn) return;
    try {
      await inspectMutation.mutateAsync({
        id: inspectingReturn._id,
        items: inspectItems,
      });
      showNotification("success", "Đã kiểm tra hoàn trả");
      setInspectingReturn(null);
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  }

  async function handleClose(id: string) {
    try {
      await closeMutation.mutateAsync(id);
      showNotification("success", "Đã đóng hoàn trả");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-xl font-semibold text-slate-900">Quản lý trả hàng</h1>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {STATUS_FILTER.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Không có hoàn trả nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Mã hoàn trả</th>
                    <th className="px-4 py-3">Mã đơn hàng</th>
                    <th className="px-4 py-3">Số SP</th>
                    <th className="px-4 py-3">Phương thức</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Phí hư hỏng</th>
                    <th className="px-4 py-3">Phí trễ hạn</th>
                    <th className="px-4 py-3">Hoàn cọc</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((ret) => {
                    const st = STATUS_LABELS[ret.status] || { text: ret.status, cls: "bg-slate-100 text-slate-600" };
                    return (
                      <tr key={ret._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{ret._id.slice(-8)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{ret.orderId.slice(-8)}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{ret.items.length}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {ret.returnMethod === "in_store" ? "Tại cửa hàng" : "Giao hàng"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.text}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {ret.totalDamageFee > 0 ? formatVND(ret.totalDamageFee) : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {ret.lateFee > 0 ? formatVND(ret.lateFee) : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {ret.status !== "pending_inspection" ? formatVND(ret.depositRefundAmount) : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {new Date(ret.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {ret.status === "pending_inspection" && (
                              <button
                                onClick={() => openInspect(ret)}
                                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                              >
                                Kiểm tra
                              </button>
                            )}
                            {ret.status === "inspected" && (
                              <button
                                onClick={() => handleClose(ret._id)}
                                disabled={closeMutation.isPending}
                                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                Đóng hoàn trả
                              </button>
                            )}
                            {ret.status === "closed" && (
                              <span className="text-xs text-slate-400">Đã hoàn tất</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Inspect Modal */}
      {inspectingReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Kiểm tra hoàn trả — Đơn #{inspectingReturn.orderId.slice(-8)}
              </h3>
              <button onClick={() => setInspectingReturn(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Phương thức: {inspectingReturn.returnMethod === "in_store" ? "Tại cửa hàng" : "Giao hàng"}
              {inspectingReturn.trackingNumber && ` · Mã vận đơn: ${inspectingReturn.trackingNumber}`}
            </div>

            <div className="mt-4 space-y-4">
              {inspectItems.map((item, idx) => {
                const returnItem = inspectingReturn.items[idx];
                return (
                  <div key={idx} className="rounded-md border border-slate-200 p-3">
                    <div className="text-sm font-medium text-slate-700 mb-2">
                      Sản phẩm #{idx + 1}
                      {returnItem?.variantKey?.size && (
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          Size: {returnItem.variantKey.size}
                          {returnItem.variantKey.color && ` · ${returnItem.variantKey.color}`}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Tình trạng</label>
                        <select
                          value={item.conditionAfter}
                          onChange={(e) => {
                            const arr = [...inspectItems];
                            arr[idx] = { ...arr[idx], conditionAfter: e.target.value };
                            setInspectItems(arr);
                          }}
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                        >
                          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Phí hư hỏng (VND)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.damageFee}
                          onChange={(e) => {
                            const arr = [...inspectItems];
                            arr[idx] = { ...arr[idx], damageFee: Number(e.target.value) };
                            setInspectItems(arr);
                          }}
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-600 mb-1">Ghi chú hư hỏng</label>
                        <input
                          value={item.damageNotes}
                          onChange={(e) => {
                            const arr = [...inspectItems];
                            arr[idx] = { ...arr[idx], damageNotes: e.target.value };
                            setInspectItems(arr);
                          }}
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                          placeholder="Mô tả hư hỏng nếu có..."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tổng phí hư hỏng preview */}
            {inspectItems.some((i) => i.damageFee > 0) && (
              <div className="mt-3 text-sm text-right text-slate-700">
                Tổng phí hư hỏng: <span className="font-semibold text-rose-600">{formatVND(inspectItems.reduce((s, i) => s + i.damageFee, 0))}</span>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setInspectingReturn(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleInspect}
                disabled={inspectMutation.isPending}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {inspectMutation.isPending ? "Đang lưu..." : "Xác nhận kiểm tra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
