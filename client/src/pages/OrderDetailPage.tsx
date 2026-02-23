import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { ordersApi, type Order } from "@/api/orders.api";
import { formatVND } from "@/utils/formatCurrency";
import { useNotification } from "@/contexts/NotificationContext";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { BRAND } from "@/pages/CategoriesPage";

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

  // Activate rental mutation
  const activateRentalMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.activateRental(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showNotification("success", "Đã kích hoạt thuê thành công!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Kích hoạt thuê thất bại");
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

  function handleConfirmDelivery() {
    if (
      confirm(
        `Xác nhận bạn đã nhận được đơn hàng ${order?.orderNumber}?\nTrạng thái sẽ chuyển sang "Đã giao hàng".`
      )
    ) {
      deliverOrderMutation.mutate(id!);
    }
  }

  function handleActivateRental() {
    if (
      confirm(
        `Xác nhận kích hoạt thuê cho đơn hàng ${order?.orderNumber}?\nThời gian thuê sẽ bắt đầu tính từ bây giờ.`
      )
    ) {
      activateRentalMutation.mutate(id!);
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
  const canActivateRental = order.status === "delivered";
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
          {(canConfirmDelivery || canActivateRental || canCancel) && (
            <div className="mb-8 flex flex-wrap gap-3">
              {canConfirmDelivery && (
                <button
                  onClick={handleConfirmDelivery}
                  disabled={deliverOrderMutation.isPending}
                  className="px-6 py-2.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deliverOrderMutation.isPending ? "Đang xử lý..." : "✓ Đã nhận hàng"}
                </button>
              )}
              {canActivateRental && (
                <button
                  onClick={handleActivateRental}
                  disabled={activateRentalMutation.isPending}
                  className="px-6 py-2.5 rounded-md text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: BRAND.blushRose }}
                >
                  {activateRentalMutation.isPending ? "Đang xử lý..." : "Kích hoạt thuê"}
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
    </div>
  );
}
