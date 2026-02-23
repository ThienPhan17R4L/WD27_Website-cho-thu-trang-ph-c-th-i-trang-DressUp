import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { PaginationBar } from "@/components/common/PaginationBar";
import { ordersApi, type Order } from "@/api/orders.api";
import { formatVND } from "@/utils/formatCurrency";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { BRAND } from "@/pages/CategoriesPage";

type TabStatus = "all" | "pending" | "confirmed" | "picking" | "shipping" | "delivered" | "active_rental" | "returned" | "completed" | "cancelled";

const TABS: { key: TabStatus; label: string; statusFilter?: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận", statusFilter: "pending,pending_payment" },
  { key: "confirmed", label: "Đã xác nhận", statusFilter: "confirmed" },
  { key: "picking", label: "Đang chuẩn bị", statusFilter: "picking" },
  { key: "shipping", label: "Đang vận chuyển", statusFilter: "shipping" },
  { key: "delivered", label: "Đã giao", statusFilter: "delivered" },
  { key: "active_rental", label: "Đang thuê", statusFilter: "active_rental,renting,overdue" },
  { key: "returned", label: "Đã trả", statusFilter: "returned,inspecting" },
  { key: "completed", label: "Hoàn thành", statusFilter: "completed" },
  { key: "cancelled", label: "Đã hủy", statusFilter: "cancelled" },
];

const paymentStatusLabels: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export default function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageSize, setPageSize] = useState(10);

  const activeTab = (searchParams.get("tab") as TabStatus) || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";

  // Get status filter for API
  const statusFilter = TABS.find((t) => t.key === activeTab)?.statusFilter;

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

  const orders = data?.items || [];
  const totalPages = data?.totalPages || 1;

  function handleTabChange(tab: TabStatus) {
    setSearchParams({ tab, page: "1", ...(search && { search }) });
  }

  function handleSearchChange(value: string) {
    setSearchParams({ tab: activeTab, page: "1", ...(value && { search: value }) });
  }

  function handlePageChange(p: number) {
    setSearchParams({ tab: activeTab, page: String(p), ...(search && { search }) });
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
        {/* Search and Filters */}
        <div className="mt-6 mb-4 flex flex-wrap items-center gap-4">
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo mã đơn hàng..."
            className="w-64 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <div className="ml-auto flex items-center gap-3">
            <label className="text-sm text-slate-600">Hiển thị</label>
            <select
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setSearchParams({ tab: activeTab, page: "1", ...(search && { search }) });
              }}
              className="rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex flex-wrap gap-2 -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
                style={
                  activeTab === tab.key
                    ? { borderBottomColor: BRAND.blushRose, color: BRAND.blushRose }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
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
                <Link
                  key={order._id}
                  to={`/admin/orders/${order._id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="font-semibold text-slate-900">
                          #{order.orderNumber}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${
                            ORDER_STATUS_COLORS[order.status] ||
                            "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status] || order.status}
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
                          <span className="font-medium">
                            {order.shippingAddress?.receiverName || "—"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
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
                      <div className="mt-2 text-xs font-medium hover:underline" style={{ color: BRAND.blushRose }}>
                        Xem chi tiết →
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order.items?.slice(0, 4).map((item: any, idx) => (
                          item.image && (
                            <img
                              key={idx}
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded border-2 border-white object-cover"
                            />
                          )
                        ))}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.items?.length} sản phẩm
                        {order.items?.length > 4 && ` (và ${order.items.length - 4} khác)`}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
