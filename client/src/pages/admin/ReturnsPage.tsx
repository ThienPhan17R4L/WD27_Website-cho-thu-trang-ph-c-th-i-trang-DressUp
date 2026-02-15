import { useState } from "react";
import { Container } from "@/components/common/Container";
import { useReturns, useInspectReturn, useCloseReturn } from "@/hooks/useReturns";
import { useNotification } from "@/contexts/NotificationContext";
import { PaginationBar } from "@/components/common/PaginationBar";
import { formatVND } from "@/utils/formatCurrency";

const STATUS_LABELS: Record<string, string> = {
  pending_inspection: "Chờ kiểm tra",
  inspected: "Đã kiểm tra",
  closed: "Đã đóng",
};

const STATUS_COLORS: Record<string, string> = {
  pending_inspection: "bg-yellow-100 text-yellow-700",
  inspected: "bg-blue-100 text-blue-700",
  closed: "bg-green-100 text-green-700",
};

const CONDITION_OPTIONS = ["new", "like-new", "good", "damaged"];

export default function ReturnsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useReturns({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });
  const inspectReturn = useInspectReturn();
  const closeReturn = useCloseReturn();
  const { showNotification } = useNotification();

  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [inspectionData, setInspectionData] = useState<Array<{
    orderItemIndex: number;
    conditionAfter: string;
    damageNotes: string;
    damageFee: number;
  }>>([]);

  const items = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const openInspection = (ret: any) => {
    setSelectedReturn(ret);
    setInspectionData(
      (ret.items || []).map((item: any) => ({
        orderItemIndex: item.orderItemIndex,
        conditionAfter: item.conditionAfter || "new",
        damageNotes: item.damageNotes || "",
        damageFee: item.damageFee || 0,
      }))
    );
  };

  const handleInspect = async () => {
    if (!selectedReturn) return;
    try {
      await inspectReturn.mutateAsync({ id: selectedReturn._id, items: inspectionData });
      showNotification("success", "Kiểm tra đơn trả thành công");
      setSelectedReturn(null);
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeReturn.mutateAsync(id);
      showNotification("success", "Đã đóng đơn trả và hoàn thành đơn hàng");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

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
        <div className="mt-6 flex gap-3">
          {["", "pending_inspection", "inspected", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusFilter === s
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s ? STATUS_LABELS[s] : "Tất cả"}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Không có đơn trả nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Mã đơn trả</th>
                    <th className="px-4 py-3">Phương thức</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Phí hư hại</th>
                    <th className="px-4 py-3">Hoàn cọc</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((ret: any) => (
                    <tr key={ret._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {ret._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {ret.returnMethod === "in_store" ? "Tại cửa hàng" : "Giao hàng"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ret.status] || "bg-slate-100 text-slate-600"}`}>
                          {STATUS_LABELS[ret.status] || ret.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {ret.totalDamageFee ? formatVND(ret.totalDamageFee) : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {ret.depositRefundAmount != null ? formatVND(ret.depositRefundAmount) : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(ret.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {ret.status === "pending_inspection" && (
                            <button
                              onClick={() => openInspection(ret)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Kiểm tra
                            </button>
                          )}
                          {ret.status === "inspected" && (
                            <button
                              onClick={() => handleClose(ret._id)}
                              disabled={closeReturn.isPending}
                              className="text-xs text-green-600 hover:underline"
                            >
                              Đóng & hoàn thành
                            </button>
                          )}
                        </div>
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

      {/* Inspection Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Kiểm tra đơn trả #{selectedReturn._id.slice(-8).toUpperCase()}
              </h3>
              <button onClick={() => setSelectedReturn(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {inspectionData.map((item, idx) => (
                <div key={idx} className="rounded-md border border-slate-200 p-3">
                  <div className="text-xs font-medium text-slate-500">
                    Sản phẩm #{item.orderItemIndex + 1}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600">Tình trạng sau</label>
                      <select
                        value={item.conditionAfter}
                        onChange={(e) => {
                          const copy = [...inspectionData];
                          copy[idx] = { ...copy[idx], conditionAfter: e.target.value };
                          setInspectionData(copy);
                        }}
                        className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                      >
                        {CONDITION_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600">Ghi chú hư hại</label>
                      <input
                        value={item.damageNotes}
                        onChange={(e) => {
                          const copy = [...inspectionData];
                          copy[idx] = { ...copy[idx], damageNotes: e.target.value };
                          setInspectionData(copy);
                        }}
                        className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600">Phí hư hại (VND)</label>
                      <input
                        type="number"
                        value={item.damageFee}
                        onChange={(e) => {
                          const copy = [...inspectionData];
                          copy[idx] = { ...copy[idx], damageFee: Number(e.target.value) };
                          setInspectionData(copy);
                        }}
                        className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReturn(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleInspect}
                disabled={inspectReturn.isPending}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {inspectReturn.isPending ? "Đang xử lý..." : "Xác nhận kiểm tra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
