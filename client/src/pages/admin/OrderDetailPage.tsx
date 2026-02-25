import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { ordersApi, type Order, type InspectionItemPayload } from "@/api/orders.api";
import { formatVND } from "@/utils/formatCurrency";
import { useNotification } from "@/contexts/NotificationContext";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { BRAND } from "@/pages/CategoriesPage";

const paymentStatusLabels: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => ordersApi.admin.getById(id!),
    enabled: !!id,
  });

  // Damage percentage map for auto-calculating inspection damage fee
  const DAMAGE_PERCENT: Record<string, number> = {
    new: 0, good: 0,
    damage_20: 20, damage_40: 40, damage_60: 60, damage_80: 80,
    destroyed: 100,
  };

  // Mutations
  const confirmMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.admin.confirmOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã xác nhận đơn hàng!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Xác nhận thất bại");
    },
  });

  const activateCodMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.admin.activateCodRental(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã xác nhận thanh toán & kích hoạt thuê tại shop!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Thao tác thất bại");
    },
  });

  const pickMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.admin.pickOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã chuyển sang chuẩn bị hàng!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Thao tác thất bại");
    },
  });

  const shipOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.admin.shipOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đơn hàng đã được gửi đi!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Gửi hàng thất bại");
    },
  });

  const deliverMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.admin.deliverOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã đánh dấu đã giao!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Thao tác thất bại");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.admin.activateRental(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã kích hoạt thuê!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Thao tác thất bại");
    },
  });

  const markReturnedMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.admin.markReturned(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã đánh dấu đã trả!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Thao tác thất bại");
    },
  });

  const startInspectionMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.admin.startInspection(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã bắt đầu kiểm tra!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Thao tác thất bại");
    },
  });

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: (reason?: string) => void;
    requireReason?: boolean;
    reasonLabel?: string;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });
  const reasonInputRef = useRef<HTMLInputElement>(null);

  function openConfirm(opts: {
    title: string;
    message: string;
    onConfirm: (reason?: string) => void;
    requireReason?: boolean;
    reasonLabel?: string;
  }) {
    setConfirmModal({ show: true, ...opts });
  }

  function closeConfirm() {
    setConfirmModal({ show: false, title: "", message: "", onConfirm: () => {} });
  }

  // Inspection form state
  const [inspectionItems, setInspectionItems] = useState<
    { conditionAfter: string; damageNotes: string; damageFee: number }[]
  >([]);
  const [inspectionNotes, setInspectionNotes] = useState("");

  useEffect(() => {
    if (order?.items?.length) {
      setInspectionItems(
        order.items.map(() => ({ conditionAfter: "good", damageNotes: "", damageFee: 0 }))
      );
    }
  }, [order?.items?.length]);

  function updateInspectionItem(idx: number, field: string, value: string | number) {
    setInspectionItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        // Auto-calculate damage fee when condition changes
        if (field === "conditionAfter" && typeof value === "string") {
          const pct = DAMAGE_PERCENT[value] ?? 0;
          const orderItem = order?.items?.[idx];
          updated.damageFee = pct > 0 && orderItem
            ? Math.round((orderItem.deposit || 0) * (orderItem.quantity || 1) * pct / 100)
            : 0;
          if (pct === 0) updated.damageNotes = "";
        }
        return updated;
      })
    );
  }

  const totalDamageFee = inspectionItems.reduce((sum, item) => sum + (item.damageFee || 0), 0);
  const depositRefundAmount = Math.max(
    0,
    (order?.totalDeposit || 0) - (order?.lateFee || 0) - totalDamageFee
  );

  const completeInspectionMutation = useMutation({
    mutationFn: (orderId: string) =>
      ordersApi.admin.completeInspection(orderId, {
        items: inspectionItems.map((item, idx) => ({
          orderItemIndex: idx,
          conditionAfter: item.conditionAfter,
          damageNotes: item.damageNotes || undefined,
          damageFee: item.damageFee || 0,
        })),
        notes: inspectionNotes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã hoàn thành kiểm tra!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Thao tác thất bại");
    },
  });

  function handleCompleteInspection() {
    openConfirm({
      title: "Hoàn thành kiểm tra",
      message: `Xác nhận hoàn thành kiểm tra đơn hàng #${order?.orderNumber}? Thao tác này không thể hoàn tác.`,
      onConfirm: () => completeInspectionMutation.mutate(id!),
    });
  }

  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      ordersApi.admin.cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã hủy đơn hàng!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Hủy đơn hàng thất bại");
    },
  });

  function handleShipOrder() {
    openConfirm({
      title: "Xác nhận gửi hàng",
      message: `Xác nhận gửi hàng cho đơn #${order?.orderNumber}? Trạng thái sẽ chuyển sang "Đang vận chuyển".`,
      onConfirm: () => shipOrderMutation.mutate(id!),
    });
  }

  function handleCancelOrder() {
    openConfirm({
      title: "Hủy đơn hàng",
      message: `Bạn có chắc chắn muốn hủy đơn hàng #${order?.orderNumber}?`,
      requireReason: true,
      reasonLabel: "Lý do hủy (không bắt buộc)",
      onConfirm: (reason) => cancelOrderMutation.mutate({ orderId: id!, reason: reason || undefined }),
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px]">
        <div className="border-b border-slate-200 bg-white">
          <Container>
            <div className="py-6">
              <div className="text-sm text-slate-500">Đang tải chi tiết đơn hàng...</div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-[400px]">
        <div className="border-b border-slate-200 bg-white">
          <Container>
            <div className="py-6">
              <div className="text-sm text-red-600">Không tìm thấy đơn hàng</div>
              <Link
                to="/admin/orders"
                className="mt-4 inline-block text-sm font-medium hover:underline"
                style={{ color: BRAND.blushRose }}
              >
                ← Quay lại danh sách đơn hàng
              </Link>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px]">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="py-6">
            <Link
              to="/admin/orders"
              className="text-sm font-medium hover:underline mb-4 inline-block"
              style={{ color: BRAND.blushRose }}
            >
              ← Quay lại danh sách
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Đơn hàng #{order.orderNumber}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Đặt hàng lúc{" "}
                  {new Date(order.createdAt).toLocaleString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border ${
                    ORDER_STATUS_COLORS[order.status] ||
                    "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-6">
          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap gap-3">
            {(order.status === "pending" || order.status === "pending_payment") && order.paymentMethod === "cod" && (
              <button
                onClick={() => openConfirm({
                  title: "Xác nhận thanh toán & Kích hoạt thuê",
                  message: `Xác nhận thanh toán COD và kích hoạt thuê cho đơn #${order.orderNumber}?`,
                  onConfirm: () => activateCodMutation.mutate(id!),
                })}
                disabled={activateCodMutation.isPending}
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Xác nhận thanh toán & Kích hoạt thuê
              </button>
            )}
            {(order.status === "pending" || order.status === "pending_payment") && order.paymentMethod !== "cod" && (
              <button
                onClick={() => openConfirm({
                  title: "Xác nhận thanh toán",
                  message: `Xác nhận đơn hàng #${order.orderNumber} đã được thanh toán?`,
                  onConfirm: () => confirmMutation.mutate(id!),
                })}
                disabled={confirmMutation.isPending}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Xác nhận thanh toán
              </button>
            )}
            {order.status === "confirmed" && (
              <button
                onClick={() => openConfirm({
                  title: "Bắt đầu chuẩn bị hàng",
                  message: `Bắt đầu chuẩn bị hàng cho đơn #${order.orderNumber}?`,
                  onConfirm: () => pickMutation.mutate(id!),
                })}
                disabled={pickMutation.isPending}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Bắt đầu chuẩn bị
              </button>
            )}
            {order.status === "picking" && (
              <button
                onClick={handleShipOrder}
                disabled={shipOrderMutation.isPending}
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Gửi hàng
              </button>
            )}
            {order.status === "shipping" && (
              <button
                onClick={() => openConfirm({
                  title: "Xác nhận đã giao hàng",
                  message: `Xác nhận đã giao hàng thành công cho đơn #${order.orderNumber}?`,
                  onConfirm: () => deliverMutation.mutate(id!),
                })}
                disabled={deliverMutation.isPending}
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Đánh dấu đã giao
              </button>
            )}
            {order.status === "delivered" && (
              <button
                onClick={() => openConfirm({
                  title: "Kích hoạt thuê",
                  message: `Kích hoạt cho thuê đơn hàng #${order.orderNumber}? Thời gian thuê sẽ bắt đầu tính từ hôm nay.`,
                  onConfirm: () => activateMutation.mutate(id!),
                })}
                disabled={activateMutation.isPending}
                className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                Kích hoạt thuê
              </button>
            )}
            {(order.status === "active_rental" || order.status === "overdue") && (
              <button
                onClick={() => openConfirm({
                  title: "Đánh dấu đã trả hàng",
                  message: `Xác nhận khách đã trả hàng cho đơn #${order.orderNumber}? Hệ thống sẽ tính phí trả muộn nếu có.`,
                  onConfirm: () => markReturnedMutation.mutate(id!),
                })}
                disabled={markReturnedMutation.isPending}
                className="px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                Đánh dấu đã trả
              </button>
            )}
            {order.status === "returned" && (
              <button
                onClick={() => openConfirm({
                  title: "Bắt đầu kiểm tra hàng",
                  message: `Bắt đầu quy trình kiểm tra hàng hoàn trả cho đơn #${order.orderNumber}?`,
                  onConfirm: () => startInspectionMutation.mutate(id!),
                })}
                disabled={startInspectionMutation.isPending}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Bắt đầu kiểm tra
              </button>
            )}
            {["draft", "pending_payment", "pending", "confirmed", "picking", "inspecting"].includes(order.status) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>

          {/* ── Inspection form (visible only when inspecting) ── */}
          {order.status === "inspecting" && (
            <div className="mb-6 border border-amber-300 rounded-lg p-6 bg-amber-50">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Kiểm tra hàng hoàn trả</h2>
              <p className="text-sm text-slate-500 mb-4">
                Đánh giá tình trạng từng sản phẩm, ghi nhận hư hại (nếu có) để xác định phí đền bù và hoàn cọc.
              </p>

              {/* Late fee banner */}
              {(order.lateFee || 0) > 0 && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="text-base">⏰</span>
                  <span>
                    Khách trả muộn — <strong>phí trễ hạn: {formatVND(order.lateFee)}</strong>
                  </span>
                </div>
              )}

              {/* Per-item damage assessment */}
              <div className="space-y-3 mb-5">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.variant?.size && `Size: ${item.variant.size}`}
                          {item.variant?.color && ` • ${item.variant.color}`}
                          {` • SL: ${item.quantity}`}
                        </div>
                      </div>
                    </div>
                    {(() => {
                      const condition = inspectionItems[idx]?.conditionAfter || "good";
                      const pct = DAMAGE_PERCENT[condition] ?? 0;
                      const isDamaged = pct > 0;
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Tình trạng sau khi trả
                            </label>
                            <select
                              value={condition}
                              onChange={(e) => updateInspectionItem(idx, "conditionAfter", e.target.value)}
                              className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                            >
                              <option value="new">Mới (như ban đầu)</option>
                              <option value="good">Tốt (không hư hại)</option>
                              <option value="damage_20">Hư hại 20%</option>
                              <option value="damage_40">Hư hại 40%</option>
                              <option value="damage_60">Hư hại 60%</option>
                              <option value="damage_80">Hư hại 80%</option>
                              <option value="destroyed">Hỏng hoàn toàn (100%)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Mô tả hư hại
                            </label>
                            <input
                              type="text"
                              placeholder={isDamaged ? "VD: rách nhẹ ở gấu váy..." : "Không có hư hại"}
                              value={inspectionItems[idx]?.damageNotes || ""}
                              disabled={!isDamaged}
                              onChange={(e) => updateInspectionItem(idx, "damageNotes", e.target.value)}
                              className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Phí đền bù hư hại (tự động)
                            </label>
                            {isDamaged ? (
                              <div className="w-full text-sm border border-amber-300 bg-amber-50 rounded px-2 py-1.5 font-medium text-amber-800">
                                {formatVND(inspectionItems[idx]?.damageFee || 0)}
                                <span className="ml-1 text-xs text-amber-600">({pct}% tiền cọc)</span>
                              </div>
                            ) : (
                              <div className="w-full text-sm border border-slate-200 bg-slate-50 rounded px-2 py-1.5 text-slate-400">
                                Không có phí
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-amber-200 bg-white p-4 text-sm space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tiền đặt cọc</span>
                  <span className="font-medium">{formatVND(order.totalDeposit)}</span>
                </div>
                {(order.lateFee || 0) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Trừ phí trễ hạn</span>
                    <span>− {formatVND(order.lateFee)}</span>
                  </div>
                )}
                {totalDamageFee > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Trừ phí hư hại</span>
                    <span>− {formatVND(totalDamageFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-slate-200">
                  <span>Hoàn cọc cho khách</span>
                  <span className="text-green-600">{formatVND(depositRefundAmount)}</span>
                </div>
              </div>

              {/* General notes */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Ghi chú kiểm tra (không bắt buộc)
                </label>
                <textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Ghi chú thêm về quá trình kiểm tra..."
                  rows={2}
                  className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <button
                onClick={handleCompleteInspection}
                disabled={completeInspectionMutation.isPending}
                className="px-6 py-2.5 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {completeInspectionMutation.isPending ? "Đang xử lý..." : "✓ Hoàn thành kiểm tra"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Thông tin khách hàng</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500 mb-1">Tên người nhận</div>
                    <div className="font-medium">{order.shippingAddress?.receiverName}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1">Số điện thoại</div>
                    <div className="font-medium">{order.shippingAddress?.receiverPhone}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-slate-500 mb-1">Địa chỉ giao hàng</div>
                    <div className="text-slate-700">
                      {order.shippingAddress?.line1}
                      <br />
                      {order.shippingAddress?.ward}, {order.shippingAddress?.district}
                      <br />
                      {order.shippingAddress?.province}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Sản phẩm ({order.items?.length || 0})
                </h2>
                <div className="space-y-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-4 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded border border-slate-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {item.variant?.size && <span>Size: {item.variant.size}</span>}
                          {item.variant?.color && <span> • Màu: {item.variant.color}</span>}
                          <span> • SL: {item.quantity}</span>
                        </div>
                        {item.rental && (
                          <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded px-3 py-2">
                            <div>
                              📅 Thuê: {new Date(item.rental.startDate).toLocaleDateString("vi-VN")}{" "}
                              → {new Date(item.rental.endDate).toLocaleDateString("vi-VN")}
                            </div>
                            <div className="mt-1">
                              {item.rental.days} ngày × {formatVND(item.rental.pricePerDay)}/ngày
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">
                          {formatVND(item.lineTotal)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History Timeline */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="border border-slate-200 rounded-lg p-6 bg-white">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Lịch sử trạng thái
                  </h2>
                  <OrderTimeline
                    statusHistory={order.statusHistory}
                    currentStatus={order.status}
                  />
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="border border-slate-200 rounded-lg p-6 bg-white">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">Ghi chú</h2>
                  <p className="text-sm text-slate-600">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Tổng quan</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tiền thuê</span>
                    <span className="font-medium">{formatVND(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Giảm giá</span>
                      <span className="font-medium text-green-600">
                        -{formatVND(order.discount)}
                      </span>
                    </div>
                  )}
                  {order.couponCode && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã giảm giá</span>
                      <span className="font-medium text-green-600">
                        {order.couponCode} (-{formatVND(order.couponDiscount || 0)})
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phí vận chuyển</span>
                    <span className="font-medium">{formatVND(order.shippingFee)}</span>
                  </div>
                  {order.serviceFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phí dịch vụ</span>
                      <span className="font-medium">{formatVND(order.serviceFee)}</span>
                    </div>
                  )}
                  {order.totalDeposit > 0 && (
                    <div className="flex justify-between pt-3 border-t border-slate-200">
                      <span className="text-orange-600 font-medium">Tiền đặt cọc</span>
                      <span className="text-orange-600 font-medium">
                        {formatVND(order.totalDeposit)}
                      </span>
                    </div>
                  )}
                  {order.lateFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600 font-medium">Phí trả muộn</span>
                      <span className="text-red-600 font-medium">
                        {formatVND(order.lateFee)}
                      </span>
                    </div>
                  )}
                  {order.depositRefunded > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600 font-medium">Cọc đã hoàn</span>
                      <span className="text-green-600 font-medium">
                        {formatVND(order.depositRefunded)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-slate-200 text-base">
                    <span className="font-semibold text-slate-900">Tổng thanh toán</span>
                    <span className="font-bold text-lg" style={{ color: BRAND.blushRose }}>
                      {formatVND(order.total + (order.totalDeposit || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Thanh toán</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phương thức</span>
                    <span className="font-medium uppercase">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái</span>
                    <span
                      className={`font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* COD Pickup Deadline */}
              {order.paymentMethod === "cod" && order.pickupDeadline && (
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start gap-2 text-sm text-orange-800">
                    <span className="text-lg">⏰</span>
                    <div>
                      <div className="font-medium">Hạn lấy hàng</div>
                      <div className="mt-1">
                        {new Date(order.pickupDeadline).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* ── Confirm Modal ── */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">{confirmModal.title}</h3>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600 leading-relaxed">{confirmModal.message}</p>

              {confirmModal.requireReason && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {confirmModal.reasonLabel || "Lý do"}
                  </label>
                  <input
                    ref={reasonInputRef}
                    type="text"
                    placeholder="Nhập lý do (không bắt buộc)..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  const reason = confirmModal.requireReason
                    ? reasonInputRef.current?.value || undefined
                    : undefined;
                  confirmModal.onConfirm(reason);
                  closeConfirm();
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
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
