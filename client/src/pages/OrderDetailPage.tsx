import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { ordersApi, type Order } from "@/api/orders.api";
import { formatVND } from "@/utils/formatCurrency";
import { useNotification } from "@/contexts/NotificationContext";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { BRAND } from "@/pages/CategoriesPage";

const CONDITION_LABELS: Record<string, string> = {
  new: "Mới (như ban đầu)",
  good: "Tốt (không hư hại)",
  minor_damage: "Hư hại nhẹ",
  major_damage: "Hư hại nặng",
  destroyed: "Hỏng hoàn toàn",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

  // Fetch return/inspection record when order is inspecting or completed
  const { data: returnRecord } = useQuery({
    queryKey: ["order-return", id],
    queryFn: () => ordersApi.getReturn(id!),
    enabled: !!id && ["inspecting", "completed"].includes(order?.status || ""),
  });

  // Deliver order mutation (customer confirms receipt)
  const deliverOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.deliverOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showNotification("success", "Đã xác nhận nhận hàng thành công!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Xác nhận nhận hàng thất bại");
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      ordersApi.cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showNotification("success", "Đã hủy đơn hàng!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Hủy đơn hàng thất bại");
    },
  });

  const [confirmModal, setConfirmModal] = useState<{
    type: "deliver" | "cancel";
    cancelReason: string;
  } | null>(null);

  function handleConfirmDelivery() {
    setConfirmModal({ type: "deliver", cancelReason: "" });
  }

  function handleCancelOrder() {
    setConfirmModal({ type: "cancel", cancelReason: "" });
  }

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <Container>
          <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
            <div className="text-sm text-slate-500">Đang tải chi tiết đơn hàng...</div>
          </div>
        </Container>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-white min-h-screen">
        <Container>
          <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
            <div className="text-sm text-red-600">Không tìm thấy đơn hàng</div>
            <Link
              to="/orders"
              className="mt-4 inline-block text-sm font-medium hover:underline"
              style={{ color: BRAND.blushRose }}
            >
              ← Quay lại danh sách đơn hàng
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const canConfirmDelivery = order.status === "shipping";
  const canCancel = ["pending", "pending_payment", "confirmed"].includes(order.status);

  return (
    <div className="bg-white min-h-screen">
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to="/orders"
              className="text-sm font-medium hover:underline"
              style={{ color: BRAND.blushRose }}
            >
              ← Quay lại danh sách đơn hàng
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Đơn hàng #{order.orderNumber}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
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
              <span
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border ${
                  ORDER_STATUS_COLORS[order.status] ||
                  "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {(canConfirmDelivery || canCancel) && (
            <div className="mb-8 flex flex-wrap gap-3">
              {canConfirmDelivery && (
                <button
                  onClick={handleConfirmDelivery}
                  disabled={deliverOrderMutation.isPending}
                  className="px-6 py-2.5 rounded-md text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: BRAND.blushRose }}
                >
                  {deliverOrderMutation.isPending ? "Đang xử lý..." : "✓ Đã nhận hàng"}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelOrderMutation.isPending}
                  className="px-6 py-2.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelOrderMutation.isPending ? "Đang xử lý..." : "Hủy đơn hàng"}
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
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

              {/* Inspection / damage report */}
              {returnRecord && (
                <div className="border border-amber-200 rounded-lg p-6 bg-amber-50">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">
                    Kết quả kiểm tra hàng trả
                  </h2>
                  {returnRecord.inspectedAt && (
                    <p className="text-xs text-slate-500 mb-4">
                      Kiểm tra lúc{" "}
                      {new Date(returnRecord.inspectedAt).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}

                  {/* Per-item results */}
                  {returnRecord.items?.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {returnRecord.items.map((ri, idx) => {
                        const orderItem = order.items?.[ri.orderItemIndex];
                        return (
                          <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                            <div className="font-medium text-slate-900 mb-1">
                              {orderItem?.name || `Sản phẩm #${ri.orderItemIndex + 1}`}
                              {orderItem?.variant?.size && (
                                <span className="ml-2 text-xs text-slate-500">
                                  Size {orderItem.variant.size}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
                              <span>
                                Tình trạng:{" "}
                                <strong>{CONDITION_LABELS[ri.conditionAfter] || ri.conditionAfter}</strong>
                              </span>
                              {ri.damageNotes && (
                                <span>Ghi chú: <em>{ri.damageNotes}</em></span>
                              )}
                              {ri.damageFee > 0 && (
                                <span className="text-red-600 font-medium">
                                  Phí đền bù: {formatVND(ri.damageFee)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Financial summary */}
                  <div className="rounded-lg border border-amber-200 bg-white p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền đặt cọc</span>
                      <span className="font-medium">{formatVND(order.totalDeposit)}</span>
                    </div>
                    {(returnRecord.lateFee || 0) > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Phí trễ hạn</span>
                        <span>− {formatVND(returnRecord.lateFee)}</span>
                      </div>
                    )}
                    {(returnRecord.totalDamageFee || 0) > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Phí đền bù hư hại</span>
                        <span>− {formatVND(returnRecord.totalDamageFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-2 border-t border-slate-200">
                      <span>Hoàn cọc</span>
                      <span
                        className={
                          returnRecord.depositRefundAmount > 0 ? "text-green-600" : "text-slate-900"
                        }
                      >
                        {formatVND(returnRecord.depositRefundAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                      {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Địa chỉ giao hàng</h2>
                <div className="text-sm space-y-1">
                  <div className="font-medium text-slate-900">
                    {order.shippingAddress?.receiverName}
                  </div>
                  <div className="text-slate-600">{order.shippingAddress?.receiverPhone}</div>
                  <div className="text-slate-600 mt-2">
                    {order.shippingAddress?.line1}
                    <br />
                    {order.shippingAddress?.ward}, {order.shippingAddress?.district}
                    <br />
                    {order.shippingAddress?.province}
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

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            {confirmModal.type === "deliver" ? (
              <>
                <h3 className="text-lg font-semibold text-slate-900">Xác nhận đã nhận hàng</h3>
                <p className="mt-3 text-sm text-slate-600">
                  Xác nhận bạn đã nhận được đơn hàng{" "}
                  <strong>#{order?.orderNumber}</strong>?{" "}
                  Trạng thái sẽ chuyển sang &quot;Đã giao hàng&quot;.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deliverOrderMutation.mutate(id!);
                      setConfirmModal(null);
                    }}
                    disabled={deliverOrderMutation.isPending}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: BRAND.blushRose }}
                  >
                    Xác nhận
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-slate-900">Hủy đơn hàng</h3>
                <p className="mt-3 text-sm text-slate-600">
                  Bạn có chắc muốn hủy đơn hàng{" "}
                  <strong>#{order?.orderNumber}</strong>?
                </p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Lý do hủy (không bắt buộc)
                  </label>
                  <textarea
                    value={confirmModal.cancelReason}
                    onChange={(e) =>
                      setConfirmModal({ ...confirmModal, cancelReason: e.target.value })
                    }
                    rows={3}
                    placeholder="Nhập lý do hủy đơn hàng..."
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-[#f6f3ef] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgba(213,176,160,0.5)]"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      cancelOrderMutation.mutate({
                        orderId: id!,
                        reason: confirmModal.cancelReason || undefined,
                      });
                      setConfirmModal(null);
                    }}
                    disabled={cancelOrderMutation.isPending}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    Hủy đơn hàng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
