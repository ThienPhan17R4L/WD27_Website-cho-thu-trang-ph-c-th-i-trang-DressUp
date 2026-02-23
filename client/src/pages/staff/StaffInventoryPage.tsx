import { useState } from "react";
import { Container } from "@/components/common/Container";
import { PaginationBar } from "@/components/common/PaginationBar";
import { useInventory, useAdjustInventory } from "@/hooks/useInventory";
import { useNotification } from "@/contexts/NotificationContext";

export default function StaffInventoryPage() {
  const { showNotification } = useNotification();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useInventory({ page, limit: 20 });
  const adjustMutation = useAdjustInventory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQtyTotal, setEditQtyTotal] = useState(0);
  const [editQtyAvailable, setEditQtyAvailable] = useState(0);

  const items = data?.data || [];
  const totalPages = data?.totalPages || 1;

  function openEdit(item: any) {
    setEditingId(item._id);
    setEditQtyTotal(item.qtyTotal);
    setEditQtyAvailable(item.qtyAvailable);
  }

  async function handleSave() {
    if (!editingId) return;
    try {
      await adjustMutation.mutateAsync({
        id: editingId,
        data: { qtyTotal: editQtyTotal, qtyAvailable: editQtyAvailable },
      });
      showNotification("success", "Đã cập nhật tồn kho");
      setEditingId(null);
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-xl font-semibold text-slate-900">Quản lý tồn kho</h1>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Không có dữ liệu tồn kho</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Biến thể</th>
                    <th className="px-4 py-3">Tổng SL</th>
                    <th className="px-4 py-3">Có sẵn</th>
                    <th className="px-4 py-3">Đang thuê</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item: any) => {
                    const renting = item.qtyTotal - item.qtyAvailable;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.product?.images?.[0] ? (
                              <img src={item.product.images[0]} alt="" className="h-10 w-10 rounded object-cover border border-slate-100 flex-shrink-0" />
                            ) : (
                              <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <svg className="h-4 w-4 text-slate-300" viewBox="0 0 24 24" fill="none">
                                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-900">
                                {item.product?.name || (
                                  <span className="text-slate-400 italic text-xs">Không tìm thấy</span>
                                )}
                              </div>
                              {item.sku && (
                                <div className="text-xs text-slate-400 font-mono">{item.sku}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          <span className="font-medium">{item.variantKey?.size || "—"}</span>
                          {item.variantKey?.color && <span className="text-slate-400"> / {item.variantKey.color}</span>}
                        </td>
                        <td className="px-4 py-3 font-medium">{item.qtyTotal}</td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${item.qtyAvailable === 0 ? "text-red-600" : "text-green-700"}`}>
                            {item.qtyAvailable}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{renting}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openEdit(item)}
                            className="text-xs text-rose-600 hover:underline"
                          >
                            Điều chỉnh
                          </button>
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

      {/* Adjust Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Điều chỉnh tồn kho</h3>
              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Tổng số lượng</label>
                <input
                  type="number"
                  min={0}
                  value={editQtyTotal}
                  onChange={(e) => setEditQtyTotal(Number(e.target.value))}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Số lượng có sẵn</label>
                <input
                  type="number"
                  min={0}
                  value={editQtyAvailable}
                  onChange={(e) => setEditQtyAvailable(Number(e.target.value))}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditingId(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={adjustMutation.isPending}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {adjustMutation.isPending ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
