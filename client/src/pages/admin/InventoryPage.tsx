import { useState } from "react";
import { Container } from "@/components/common/Container";
import { useInventory, useAdjustInventory } from "@/hooks/useInventory";
import { useNotification } from "@/contexts/NotificationContext";
import { PaginationBar } from "@/components/common/PaginationBar";

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInventory({ page, limit: 20 });
  const adjustInventory = useAdjustInventory();
  const { showNotification } = useNotification();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQtyTotal, setEditQtyTotal] = useState(0);
  const [editQtyAvailable, setEditQtyAvailable] = useState(0);

  const items = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const startEdit = (item: any) => {
    setEditingId(item._id);
    setEditQtyTotal(item.qtyTotal);
    setEditQtyAvailable(item.qtyAvailable);
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await adjustInventory.mutateAsync({
        id: editingId,
        data: { qtyTotal: editQtyTotal, qtyAvailable: editQtyAvailable },
      });
      showNotification("success", "Cập nhật tồn kho thành công");
      setEditingId(null);
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Màu</th>
                    <th className="px-4 py-3 text-center">Tổng SL</th>
                    <th className="px-4 py-3 text-center">Còn lại</th>
                    <th className="px-4 py-3 text-center">Đang giặt</th>
                    <th className="px-4 py-3 text-center">Sửa chữa</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      {/* Sản phẩm: ảnh + tên */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt=""
                              className="h-9 w-9 rounded object-cover border border-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <svg className="h-4 w-4 text-slate-300" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-slate-900 text-sm">
                              {item.product?.name || (
                                <span className="text-slate-400 italic text-xs">ID: {String(item.productId)}</span>
                              )}
                            </div>
                            {item.product?.slug && (
                              <div className="text-xs text-slate-400 font-mono">{item.product.slug}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* SKU */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.sku || "—"}</td>
                      {/* Size */}
                      <td className="px-4 py-3 text-sm text-slate-700">{item.variantKey?.size || "—"}</td>
                      {/* Màu */}
                      <td className="px-4 py-3 text-sm text-slate-700">{item.variantKey?.color || "—"}</td>
                      {/* Tổng SL */}
                      <td className="px-4 py-3 text-center">
                        {editingId === item._id ? (
                          <input
                            type="number"
                            value={editQtyTotal}
                            onChange={(e) => setEditQtyTotal(Number(e.target.value))}
                            className="w-16 rounded border border-slate-200 px-2 py-1 text-sm text-center"
                          />
                        ) : (
                          <span className="text-slate-700">{item.qtyTotal}</span>
                        )}
                      </td>
                      {/* Còn lại */}
                      <td className="px-4 py-3 text-center">
                        {editingId === item._id ? (
                          <input
                            type="number"
                            value={editQtyAvailable}
                            onChange={(e) => setEditQtyAvailable(Number(e.target.value))}
                            className="w-16 rounded border border-slate-200 px-2 py-1 text-sm text-center"
                          />
                        ) : (
                          <span className={`font-medium ${item.qtyAvailable === 0 ? "text-red-600" : item.qtyAvailable < 2 ? "text-amber-600" : "text-green-700"}`}>
                            {item.qtyAvailable}
                          </span>
                        )}
                      </td>
                      {/* Đang giặt */}
                      <td className="px-4 py-3 text-center text-sm text-slate-500">
                        {item.qtyInCleaning ?? 0}
                      </td>
                      {/* Sửa chữa */}
                      <td className="px-4 py-3 text-center text-sm text-slate-500">
                        {item.qtyInRepair ?? 0}
                      </td>
                      {/* Thao tác */}
                      <td className="px-4 py-3">
                        {editingId === item._id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSave}
                              disabled={adjustInventory.isPending}
                              className="rounded bg-rose-600 px-2 py-1 text-xs text-white hover:bg-rose-700 disabled:opacity-60"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                            >
                              Huỷ
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            Chỉnh sửa
                          </button>
                        )}
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
