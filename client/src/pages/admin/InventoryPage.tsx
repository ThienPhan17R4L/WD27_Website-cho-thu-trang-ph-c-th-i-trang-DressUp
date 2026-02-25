import { useState } from "react";
import { Container } from "@/components/common/Container";
import {
  useInventoryGrouped,
  useCreateInventoryForVariant,
  useAddStock,
  useRemoveStock,
  useMarkCleaned,
  useMarkRepaired,
  useMarkBroken,
} from "@/hooks/useInventory";
import { useNotification } from "@/contexts/NotificationContext";
import { PaginationBar } from "@/components/common/PaginationBar";

type ActionType = "add" | "remove" | "cleaned" | "repaired" | "broken";

interface ActionModalState {
  show: boolean;
  type: ActionType | null;
  variantId: string | null;
  productId?: string;
  variantInfo: { productName: string; size: string; color?: string } | null;
  maxQty?: number;
}

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [actionModal, setActionModal] = useState<ActionModalState>({
    show: false,
    type: null,
    variantId: null,
    variantInfo: null,
  });
  const [actionQty, setActionQty] = useState(1);

  const { data, isLoading } = useInventoryGrouped({ page, limit: 20, search });
  const createInventory = useCreateInventoryForVariant();
  const addStock = useAddStock();
  const removeStock = useRemoveStock();
  const markCleaned = useMarkCleaned();
  const markRepaired = useMarkRepaired();
  const markBroken = useMarkBroken();
  const { showNotification } = useNotification();

  const products = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const toggleProduct = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const openActionModal = (
    type: ActionType,
    variantId: string | null,
    productId: string,
    productName: string,
    size: string,
    color: string | undefined,
    maxQty?: number
  ) => {
    setActionModal({
      show: true,
      type,
      variantId,
      productId,
      variantInfo: { productName, size, color },
      maxQty,
    });
    setActionQty(1);
  };

  const closeActionModal = () => {
    setActionModal({ show: false, type: null, variantId: null, variantInfo: null });
    setActionQty(1);
  };

  const handleAction = async () => {
    if (!actionModal.type) return;

    try {
      // If variant has no inventory ID, create it first (only for "add" action)
      if (!actionModal.variantId && actionModal.type === "add") {
        if (!actionModal.productId || !actionModal.variantInfo) return;

        await createInventory.mutateAsync({
          productId: actionModal.productId,
          size: actionModal.variantInfo.size,
          color: actionModal.variantInfo.color,
          initialQty: actionQty,
        });
        showNotification("success", `Đã tạo và nhập ${actionQty} sản phẩm`);
        closeActionModal();
        return;
      }

      // For existing inventory
      if (!actionModal.variantId) return;

      const payload = { id: actionModal.variantId, qty: actionQty };

      switch (actionModal.type) {
        case "add":
          await addStock.mutateAsync(payload);
          showNotification("success", `Đã nhập ${actionQty} sản phẩm`);
          break;
        case "remove":
          await removeStock.mutateAsync(payload);
          showNotification("success", `Đã bỏ ${actionQty} sản phẩm`);
          break;
        case "cleaned":
          await markCleaned.mutateAsync(payload);
          showNotification("success", `Đã đánh dấu ${actionQty} sản phẩm giặt xong`);
          break;
        case "repaired":
          await markRepaired.mutateAsync(payload);
          showNotification("success", `Đã đánh dấu ${actionQty} sản phẩm sửa xong`);
          break;
        case "broken":
          await markBroken.mutateAsync(payload);
          showNotification("success", `Đã đánh dấu ${actionQty} sản phẩm hỏng`);
          break;
      }
      closeActionModal();
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const getActionLabel = (type: ActionType) => {
    const labels = {
      add: "Nhập hàng",
      remove: "Bỏ hàng",
      cleaned: "Giặt xong",
      repaired: "Sửa xong",
      broken: "Đánh dấu hỏng",
    };
    return labels[type];
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
        {/* Search */}
        <div className="mt-6 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-md rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Grouped Products */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Đang tải...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Không tìm thấy sản phẩm
            </div>
          ) : (
            products.map((product: any) => {
              const isExpanded = expandedProducts.has(product._id);
              return (
                <div
                  key={product._id}
                  className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  {/* Product Header */}
                  <button
                    onClick={() => toggleProduct(product._id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                  >
                    {product.productImage && (
                      <img
                        src={product.productImage}
                        alt=""
                        className="h-16 w-16 rounded object-cover border border-slate-100 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-slate-900">{product.productName}</h3>
                      <p className="text-xs text-slate-400 font-mono">{product.productSlug}</p>
                      <div className="mt-1 flex gap-4 text-xs text-slate-600">
                        <span>
                          Tổng: <strong>{product.totalQty}</strong>
                        </span>
                        <span>
                          Còn lại: <strong className="text-green-700">{product.availableQty}</strong>
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Variants Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-left text-slate-500">
                            <th className="px-4 py-2 font-medium">SKU</th>
                            <th className="px-4 py-2 font-medium">Size</th>
                            <th className="px-4 py-2 font-medium">Màu</th>
                            <th className="px-4 py-2 font-medium text-center">Tổng</th>
                            <th className="px-4 py-2 font-medium text-center">Còn</th>
                            <th className="px-4 py-2 font-medium text-center">Giặt</th>
                            <th className="px-4 py-2 font-medium text-center">Sửa</th>
                            <th className="px-4 py-2 font-medium text-center">Hỏng</th>
                            <th className="px-4 py-2 font-medium">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {product.variants.map((variant: any) => (
                            <tr key={variant._id || `${variant.size}-${variant.color || "none"}`} className="hover:bg-slate-50">
                              <td className="px-4 py-2 font-mono text-slate-600">{variant.sku}</td>
                              <td className="px-4 py-2 text-slate-700">{variant.size}</td>
                              <td className="px-4 py-2 text-slate-700">{variant.color || "—"}</td>
                              <td className="px-4 py-2 text-center text-slate-700">{variant.qtyTotal}</td>
                              <td className="px-4 py-2 text-center">
                                <span
                                  className={`font-medium ${
                                    variant.qtyAvailable === 0
                                      ? "text-red-600"
                                      : variant.qtyAvailable < 2
                                      ? "text-amber-600"
                                      : "text-green-700"
                                  }`}
                                >
                                  {variant.qtyAvailable}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center text-slate-500">{variant.qtyInCleaning}</td>
                              <td className="px-4 py-2 text-center text-slate-500">{variant.qtyInRepair}</td>
                              <td className="px-4 py-2 text-center text-slate-500">{variant.qtyLost}</td>
                              <td className="px-4 py-2">
                                <div className="flex flex-wrap gap-1">
                                  <button
                                    onClick={() =>
                                      openActionModal(
                                        "add",
                                        variant._id,
                                        product._id,
                                        product.productName,
                                        variant.size,
                                        variant.color
                                      )
                                    }
                                    className="px-2 py-1 text-[10px] rounded bg-green-600 text-white hover:bg-green-700"
                                    title="Nhập hàng"
                                  >
                                    + Nhập
                                  </button>
                                  {variant._id && (
                                    <>
                                      <button
                                        onClick={() =>
                                          openActionModal(
                                            "remove",
                                            variant._id,
                                            product._id,
                                            product.productName,
                                            variant.size,
                                            variant.color,
                                            variant.qtyAvailable
                                          )
                                        }
                                        className="px-2 py-1 text-[10px] rounded bg-red-600 text-white hover:bg-red-700"
                                        title="Bỏ hàng"
                                      >
                                        - Bỏ
                                      </button>
                                      {variant.qtyInCleaning > 0 && (
                                        <button
                                          onClick={() =>
                                            openActionModal(
                                              "cleaned",
                                              variant._id,
                                              product._id,
                                              product.productName,
                                              variant.size,
                                              variant.color,
                                              variant.qtyInCleaning
                                            )
                                          }
                                          className="px-2 py-1 text-[10px] rounded bg-blue-600 text-white hover:bg-blue-700"
                                          title="Giặt xong"
                                        >
                                          Giặt xong
                                        </button>
                                      )}
                                      {variant.qtyInRepair > 0 && (
                                        <button
                                          onClick={() =>
                                            openActionModal(
                                              "repaired",
                                              variant._id,
                                              product._id,
                                              product.productName,
                                              variant.size,
                                              variant.color,
                                              variant.qtyInRepair
                                            )
                                          }
                                          className="px-2 py-1 text-[10px] rounded bg-purple-600 text-white hover:bg-purple-700"
                                          title="Sửa xong"
                                        >
                                          Sửa xong
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          openActionModal(
                                            "broken",
                                            variant._id,
                                            product._id,
                                            product.productName,
                                            variant.size,
                                            variant.color,
                                            variant.qtyAvailable
                                          )
                                        }
                                        className="px-2 py-1 text-[10px] rounded bg-slate-600 text-white hover:bg-slate-700"
                                        title="Đánh dấu hỏng"
                                      >
                                        Hỏng
                                      </button>
                                    </>
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
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </Container>

      {/* Action Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm bg-white rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {getActionLabel(actionModal.type!)}
            </h3>
            <p className="text-sm text-slate-600 mb-1">{actionModal.variantInfo?.productName}</p>
            <p className="text-xs text-slate-400 mb-4">
              Size: {actionModal.variantInfo?.size}
              {actionModal.variantInfo?.color && ` • Màu: ${actionModal.variantInfo.color}`}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Số lượng</label>
              <input
                type="number"
                min={1}
                max={actionModal.maxQty}
                value={actionQty}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const raw = e.target.value.replace(/^0+(?=\d)/, "");
                  setActionQty(raw ? Math.max(1, Number(raw)) : 1);
                }}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {actionModal.maxQty && (
                <p className="mt-1 text-xs text-slate-400">Tối đa: {actionModal.maxQty}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeActionModal}
                className="flex-1 h-10 border border-slate-200 rounded text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAction}
                disabled={
                  addStock.isPending ||
                  removeStock.isPending ||
                  markCleaned.isPending ||
                  markRepaired.isPending ||
                  markBroken.isPending
                }
                className="flex-1 h-10 bg-rose-600 text-white rounded text-sm hover:bg-rose-700 disabled:opacity-50"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
