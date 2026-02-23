import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { ordersApi, type Order } from "@/api/orders.api";
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

  const completeOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.admin.completeOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã hoàn thành đơn!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Thao tác thất bại");
    },
  });

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
    if (
      confirm(
        `Xác nhận gửi hàng cho đơn ${order?.orderNumber}?\nTrạng thái sẽ chuyển sang "Đang vận chuyển".`
      )
    ) {
      shipOrderMutation.mutate(id!);
    }
  }

  function handleCancelOrder() {
    const reason = prompt("Lý do hủy đơn hàng (không bắt buộc):");
    if (reason !== null) {
      cancelOrderMutation.mutate({ orderId: id!, reason: reason || undefined });
    }
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
            {(order.status === "pending" || order.status === "pending_payment") && (
              <button
                onClick={() => confirmMutation.mutate(id!)}
                disabled={confirmMutation.isPending}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Xác nhận thanh toán
              </button>
            )}
            {order.status === "confirmed" && (
              <button
                onClick={() => pickMutation.mutate(id!)}
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
                onClick={() => deliverMutation.mutate(id!)}
                disabled={deliverMutation.isPending}
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Đánh dấu đã giao
              </button>
            )}
            {order.status === "delivered" && (
              <button
                onClick={() => activateMutation.mutate(id!)}
                disabled={activateMutation.isPending}
                className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                Kích hoạt thuê
              </button>
            )}
            {(order.status === "active_rental" || order.status === "overdue") && (
              <button
                onClick={() => markReturnedMutation.mutate(id!)}
                disabled={markReturnedMutation.isPending}
                className="px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                Đánh dấu đã trả
              </button>
            )}
            {order.status === "returned" && (
              <button
                onClick={() => startInspectionMutation.mutate(id!)}
                disabled={startInspectionMutation.isPending}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Bắt đầu kiểm tra
              </button>
            )}
            {order.status === "inspecting" && (
              <button
                onClick={() => completeOrderMutation.mutate(id!)}
                disabled={completeOrderMutation.isPending}
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Hoàn thành đơn
              </button>
            )}
            {order.status !== "cancelled" && order.status !== "completed" && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>

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
                    <span className="font-semibold text-slate-900">Tổng cộng</span>
                    <span className="font-bold text-lg" style={{ color: BRAND.blushRose }}>
                      {formatVND(order.total)}
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
    </div>
  );
}
