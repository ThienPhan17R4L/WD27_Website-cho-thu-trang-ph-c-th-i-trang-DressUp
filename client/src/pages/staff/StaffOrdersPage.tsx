import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { PaginationBar } from "@/components/common/PaginationBar";
import { ordersApi, type Order } from "@/api/orders.api";
import { useNotification } from "@/contexts/NotificationContext";
import { formatVND } from "@/utils/formatCurrency";

/* ── Status labels (đúng theo server orderStateMachine) ── */
const STATUS_LABELS: Record<string, { text: string; cls: string }> = {
  pending_payment: { text: "Chờ thanh toán", cls: "bg-yellow-100 text-yellow-700" },
  confirmed: { text: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
  picking: { text: "Đang chuẩn bị", cls: "bg-indigo-100 text-indigo-700" },
  shipping: { text: "Đang giao", cls: "bg-purple-100 text-purple-700" },
  delivered: { text: "Đã giao", cls: "bg-green-100 text-green-700" },
  active_rental: { text: "Đang thuê", cls: "bg-teal-100 text-teal-700" },
  overdue: { text: "Quá hạn", cls: "bg-orange-100 text-orange-700" },
  returned: { text: "Đã trả", cls: "bg-slate-100 text-slate-600" },
  inspecting: { text: "Đang kiểm tra", cls: "bg-amber-100 text-amber-700" },
  completed: { text: "Hoàn thành", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { text: "Đã huỷ", cls: "bg-red-100 text-red-600" },
};

/* Staff chỉ lọc các trạng thái liên quan đến công việc */
const STATUS_FILTER = [
  { value: "", label: "Tất cả" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "picking", label: "Đang chuẩn bị" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "active_rental", label: "Đang thuê" },
  { value: "overdue", label: "Quá hạn" },
  { value: "returned", label: "Đã trả" },
  { value: "inspecting", label: "Đang kiểm tra" },
  { value: "completed", label: "Hoàn thành" },
];

export default function StaffOrdersPage() {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff-orders", page, status, search],
    queryFn: () => ordersApi.admin.getAll({ page, limit: 20, status: status || undefined, search: search || undefined }),
  });

  /* Staff chỉ có 2 thao tác: Chuẩn bị (pick) & Gửi hàng (ship) */
  const pickMutation = useMutation({
    mutationFn: (id: string) => ordersApi.admin.pickOrder(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["staff-orders"] }); showNotification("success", "Đã chuyển sang chuẩn bị hàng"); },
    onError: (e: any) => showNotification("error", e.message || "Lỗi"),
  });

  const shipMutation = useMutation({
    mutationFn: (id: string) => ordersApi.admin.shipOrder(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["staff-orders"] }); showNotification("success", "Đã gửi hàng"); },
    onError: (e: any) => showNotification("error", e.message || "Lỗi"),
  });

  const orders: Order[] = data?.items || [];
  const totalPages = data?.totalPages || 1;

  function getActions(order: Order) {
    const actions: { label: string; onClick: () => void; cls: string }[] = [];
    if (order.status === "confirmed") {
      actions.push({ label: "Chuẩn bị hàng", onClick: () => pickMutation.mutate(order._id), cls: "bg-indigo-600 hover:bg-indigo-700 text-white" });
    }
    if (order.status === "picking") {
      actions.push({ label: "Gửi hàng", onClick: () => shipMutation.mutate(order._id), cls: "bg-purple-600 hover:bg-purple-700 text-white" });
    }
    return actions;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-xl font-semibold text-slate-900">Quản lý đơn hàng</h1>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm mã đơn hàng..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-64 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
          />
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
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Không có đơn hàng</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Tổng tiền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thanh toán</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const st = STATUS_LABELS[order.status] || { text: order.status, cls: "bg-slate-100 text-slate-600" };
                    const actions = getActions(order);
                    return (
                      <tr key={order._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDetailOrder(order)}
                            className="font-mono text-xs text-rose-600 hover:underline"
                          >
                            {order.orderNumber}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-slate-700 text-xs">
                          {order.shippingAddress?.receiverName || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {order.items.length} sản phẩm
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{formatVND(order.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.text}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {actions.map((a, i) => (
                              <button
                                key={i}
                                onClick={a.onClick}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${a.cls}`}
                              >
                                {a.label}
                              </button>
                            ))}
                            {actions.length === 0 && <span className="text-xs text-slate-400">—</span>}
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

      {/* Chi tiết đơn hàng modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Đơn hàng #{detailOrder.orderNumber}
              </h3>
              <button onClick={() => setDetailOrder(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Thông tin chung */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Trạng thái:</span>{" "}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${(STATUS_LABELS[detailOrder.status] || { cls: "" }).cls}`}>
                  {(STATUS_LABELS[detailOrder.status] || { text: detailOrder.status }).text}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Thanh toán:</span>{" "}
                <span className="font-medium">{detailOrder.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</span>
              </div>
              <div>
                <span className="text-slate-500">Phương thức:</span>{" "}
                <span className="font-medium">{detailOrder.paymentMethod?.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-500">Ngày tạo:</span>{" "}
                <span className="font-medium">{new Date(detailOrder.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="mt-4 rounded-md border border-slate-200 p-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Địa chỉ giao hàng</div>
              <div className="text-sm text-slate-800">
                <div className="font-medium">{detailOrder.shippingAddress?.receiverName}</div>
                <div>{detailOrder.shippingAddress?.receiverPhone}</div>
                <div>
                  {[
                    detailOrder.shippingAddress?.line1,
                    detailOrder.shippingAddress?.ward,
                    detailOrder.shippingAddress?.district,
                    detailOrder.shippingAddress?.province,
                  ].filter(Boolean).join(", ")}
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sản phẩm</div>
              <div className="space-y-2">
                {detailOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 rounded-md border border-slate-100 p-2">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-12 w-12 rounded object-cover shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-slate-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{item.name}</div>
                      <div className="text-xs text-slate-500">
                        {item.variant?.size && `Size: ${item.variant.size}`}
                        {item.variant?.color && ` · Màu: ${item.variant.color}`}
                        {" · "}SL: {item.quantity}
                      </div>
                      {item.rental && (
                        <div className="text-xs text-slate-400">
                          {new Date(item.rental.startDate).toLocaleDateString("vi-VN")} → {new Date(item.rental.endDate).toLocaleDateString("vi-VN")} ({item.rental.days} ngày)
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-700 shrink-0">
                      {formatVND(item.lineTotal || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tổng tiền */}
            <div className="mt-4 border-t border-slate-200 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span>{formatVND(detailOrder.subtotal)}</span></div>
              {detailOrder.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Giảm giá</span><span className="text-green-600">-{formatVND(detailOrder.discount)}</span></div>}
              {detailOrder.couponDiscount > 0 && <div className="flex justify-between"><span className="text-slate-500">Mã giảm giá</span><span className="text-green-600">-{formatVND(detailOrder.couponDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">Phí giao hàng</span><span>{formatVND(detailOrder.shippingFee)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phí dịch vụ</span><span>{formatVND(detailOrder.serviceFee)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tiền cọc</span><span>{formatVND(detailOrder.totalDeposit)}</span></div>
              <div className="flex justify-between font-semibold text-base border-t border-slate-200 pt-2 mt-2">
                <span>Tổng cộng</span><span className="text-rose-600">{formatVND(detailOrder.total)}</span>
              </div>
            </div>

            {/* Thao tác */}
            <div className="mt-5 flex justify-end gap-2">
              {detailOrder.status === "confirmed" && (
                <button
                  onClick={() => { pickMutation.mutate(detailOrder._id); setDetailOrder(null); }}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Chuẩn bị hàng
                </button>
              )}
              {detailOrder.status === "picking" && (
                <button
                  onClick={() => { shipMutation.mutate(detailOrder._id); setDetailOrder(null); }}
                  className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  Gửi hàng
                </button>
              )}
              <button
                onClick={() => setDetailOrder(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
