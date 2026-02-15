import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { PaginationBar } from "@/components/common/PaginationBar";
import { ordersApi, type Order } from "@/api/orders.api";
import { formatVND } from "@/utils/formatCurrency";
import { useNotification } from "@/contexts/NotificationContext";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

const statusLabels = ORDER_STATUS_LABELS;

const statusColors: Record<string, string> = {
  ...ORDER_STATUS_COLORS,
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export default function AdminOrdersPage() {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // UI state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Status update modal
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Fetch orders
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, pageSize, statusFilter, search],
    queryFn: () =>
      ordersApi.admin.getAll({
        page,
        limit: pageSize,
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.admin.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Cập nhật trạng thái đơn hàng thành công!");
      setShowStatusModal(false);
      setUpdatingOrder(null);
    },
    onError: (error: any) => {
      showNotification(
        "error",
        error.message || "Cập nhật trạng thái thất bại"
      );
    },
  });

  // Confirm order mutation
  const confirmMutation = useMutation({
    mutationFn: (id: string) => ordersApi.admin.confirmOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã xác nhận đơn hàng!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Xác nhận thất bại");
    },
  });

  // Pick order mutation
  const pickMutation = useMutation({
    mutationFn: (id: string) => ordersApi.admin.pickOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đã chuyển sang chuẩn bị hàng!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Thao tác thất bại");
    },
  });

  // Ship order mutation
  const shipOrderMutation = useMutation({
    mutationFn: (id: string) => ordersApi.admin.shipOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      showNotification("success", "Đơn hàng đã được gửi đi!");
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Gửi hàng thất bại");
    },
  });

  const orders = data?.items || [];
  const totalPages = data?.totalPages || 1;

  function handleShipOrder(order: Order) {
    if (
      confirm(
        `Xác nhận gửi hàng cho đơn ${order.orderNumber}?\nTrạng thái sẽ chuyển sang "Đang vận chuyển".`
      )
    ) {
      shipOrderMutation.mutate(order._id);
    }
  }

  function openDetail(order: Order) {
    setSelectedOrder(order);
    setShowDetail(true);
  }

  function openStatusUpdate(order: Order) {
    setUpdatingOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  }

  function handleStatusUpdate() {
    if (!updatingOrder) return;
    updateStatusMutation.mutate({ id: updatingOrder._id, status: newStatus });
  }

  return (
    <div className="min-h-[400px]">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-lg font-semibold text-slate-900">
              Quản lý đơn hàng
            </h1>
            <div className="text-sm text-slate-500">/admin/orders</div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 mb-4 flex flex-wrap items-center gap-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo mã đơn hàng..."
            className="w-64 rounded-md border border-slate-200 px-3 py-2 text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending_payment">Chờ thanh toán</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="picking">Đang chuẩn bị</option>
            <option value="shipping">Đang vận chuyển</option>
            <option value="delivered">Đã giao</option>
            <option value="active_rental">Đang thuê</option>
            <option value="overdue">Quá hạn</option>
            <option value="returned">Đã trả</option>
            <option value="inspecting">Đang kiểm tra</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <div className="ml-auto flex items-center gap-3">
            <label className="text-sm text-slate-600">Hiển thị</label>
            <select
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-slate-200 px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
            Đang tải...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
            Không tìm thấy đơn hàng nào
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-lg border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-slate-900">
                          #{order.orderNumber}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${
                            statusColors[order.status] ||
                            "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {paymentStatusLabels[order.paymentStatus] ||
                            order.paymentStatus}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        <div>
                          Khách hàng:{" "}
                          {order.shippingAddress?.receiverName || "—"}
                        </div>
                        <div>
                          Số điện thoại:{" "}
                          {order.shippingAddress?.receiverPhone || "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </div>

                      {order.paymentMethod === "cod" && order.pickupDeadline && (
                        <div className="mt-2 text-xs text-orange-600">
                          ⏰ Hạn lấy hàng:{" "}
                          {new Date(order.pickupDeadline).toLocaleString(
                            "vi-VN"
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">
                        {formatVND(order.total)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 uppercase">
                        {order.paymentMethod}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => openDetail(order)}
                          className="text-xs px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => openStatusUpdate(order)}
                          className="text-xs px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Cập nhật
                        </button>
                        {(order.status === "pending" || order.status === "pending_payment") && (
                          <button
                            onClick={() => confirmMutation.mutate(order._id)}
                            disabled={confirmMutation.isPending}
                            className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Xác nhận
                          </button>
                        )}
                        {order.status === "confirmed" && (
                          <button
                            onClick={() => pickMutation.mutate(order._id)}
                            disabled={pickMutation.isPending}
                            className="text-xs px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Chuẩn bị
                          </button>
                        )}
                        {order.status === "picking" && (
                          <button
                            onClick={() => handleShipOrder(order)}
                            disabled={shipOrderMutation.isPending}
                            className="text-xs px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Gửi hàng
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500 mb-2">
                      Sản phẩm ({order.items?.length || 0}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.slice(0, 3).map((item: any, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{item.name}</span>
                          <span className="text-slate-500">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center text-xs text-slate-500">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PaginationBar
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </>
        )}
      </Container>

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Chi tiết đơn hàng #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedOrder(null);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Status & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Trạng thái</div>
                  <div className="font-medium">
                    {statusLabels[selectedOrder.status]}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Thanh toán</div>
                  <div className="font-medium">
                    {paymentStatusLabels[selectedOrder.paymentStatus]} (
                    {selectedOrder.paymentMethod.toUpperCase()})
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <div className="text-xs text-slate-500 mb-2">
                  Địa chỉ giao hàng
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {selectedOrder.shippingAddress?.receiverName}
                  </div>
                  <div>{selectedOrder.shippingAddress?.receiverPhone}</div>
                  <div className="mt-1 text-slate-600">
                    {selectedOrder.shippingAddress?.line1},{" "}
                    {selectedOrder.shippingAddress?.ward},{" "}
                    {selectedOrder.shippingAddress?.district},{" "}
                    {selectedOrder.shippingAddress?.province}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="text-xs text-slate-500 mb-2">
                  Sản phẩm ({selectedOrder.items?.length || 0})
                </div>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, idx) => (
                    <div key={idx} className="flex gap-3 pb-3 border-b">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-slate-500">
                          {item.variant?.size && `Size: ${item.variant.size}`}
                          {item.variant?.color &&
                            ` • Color: ${item.variant.color}`}
                        </div>
                        {item.rental && (
                          <div className="text-xs text-slate-500 mt-1">
                            Thuê: {item.rental.days} ngày ({formatVND(item.rental.pricePerDay)}/ngày)
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm">x{item.quantity}</div>
                        <div className="font-semibold text-sm mt-1">
                          {formatVND(item.lineTotal)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tạm tính</span>
                  <span>{formatVND(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Giảm giá</span>
                    <span className="text-green-600">
                      -{formatVND(selectedOrder.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Phí vận chuyển</span>
                  <span>{formatVND(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-lg">{formatVND(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Order Timeline */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-2">Lịch sử trạng thái</div>
                  <div className="bg-slate-50 rounded p-3">
                    <OrderTimeline
                      statusHistory={selectedOrder.statusHistory}
                      currentStatus={selectedOrder.status}
                    />
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Ghi chú</div>
                  <div className="text-sm bg-slate-50 rounded p-3">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && updatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              Cập nhật trạng thái đơn hàng
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              #{updatingOrder.orderNumber}
            </p>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">
                Trạng thái mới
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="delivered">Đã giao</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setUpdatingOrder(null);
                }}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm"
                disabled={updateStatusMutation.isPending}
              >
                Hủy
              </button>
              <button
                onClick={handleStatusUpdate}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Đang lưu..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
