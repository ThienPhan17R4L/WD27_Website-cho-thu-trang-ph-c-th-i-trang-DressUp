import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { PaginationBar } from "@/components/common/PaginationBar";
import { useOrders } from "@/hooks/useOrders";
import { formatVND } from "@/utils/formatCurrency";
import { type Order } from "@/api/orders.api";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { BRAND } from "@/pages/CategoriesPage";

type TabStatus = "all" | "pending" | "confirmed" | "shipping" | "delivered" | "active_rental" | "completed" | "cancelled";

const TABS: { key: TabStatus; label: string; statusFilter?: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận", statusFilter: "pending,pending_payment" },
  { key: "confirmed", label: "Đã xác nhận", statusFilter: "confirmed,picking" },
  { key: "shipping", label: "Đang giao", statusFilter: "shipping" },
  { key: "delivered", label: "Đã giao", statusFilter: "delivered" },
  { key: "active_rental", label: "Đang thuê", statusFilter: "active_rental,renting,overdue" },
  { key: "completed", label: "Hoàn thành", statusFilter: "completed,returned,inspecting" },
  { key: "cancelled", label: "Đã hủy", statusFilter: "cancelled" },
];

interface OrderCardProps {
  order: Order & { totalDeposit?: number; lateFee?: number };
}

function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      to={`/orders/${order._id}`}
      className="block border border-slate-200 rounded-lg p-5 bg-white hover:border-slate-300 hover:shadow-sm transition-all"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="font-semibold text-slate-900">Order #{order.orderNumber}</div>
          <div className="mt-1 text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800 border-gray-200"
          }`}
        >
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {/* Items Preview */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-2">
          {order.items?.slice(0, 3).map((item: any, idx: number) => (
            item.image && (
              <img
                key={idx}
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded border-2 border-white object-cover"
              />
            )
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-slate-600">
            {order.items?.length} sản phẩm
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-lg" style={{ color: BRAND.blushRose }}>
            {formatVND(order.total)}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          <span className="uppercase font-medium">{order.paymentMethod}</span>
          {" • "}
          <span className={order.paymentStatus === "paid" ? "text-green-600" : "text-orange-600"}>
            {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
          </span>
        </div>
        <div className="font-medium hover:underline" style={{ color: BRAND.blushRose }}>
          Xem chi tiết →
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ activeTab }: { activeTab: TabStatus }) {
  const messages: Record<TabStatus, string> = {
    all: "Bạn chưa có đơn hàng nào",
    pending: "Không có đơn hàng chờ xác nhận",
    confirmed: "Không có đơn hàng đã xác nhận",
    shipping: "Không có đơn hàng đang giao",
    delivered: "Không có đơn hàng đã giao",
    active_rental: "Không có đơn hàng đang thuê",
    completed: "Không có đơn hàng hoàn thành",
    cancelled: "Không có đơn hàng đã hủy",
  };

  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📦</div>
      <div className="text-lg font-medium text-slate-700">{messages[activeTab]}</div>
      {activeTab === "all" && (
        <>
          <div className="mt-2 text-sm text-slate-500">
            Lịch sử đơn hàng của bạn sẽ hiển thị ở đây
          </div>
          <a
            href="/products"
            className="mt-6 inline-block px-6 py-3 text-sm font-semibold text-white rounded"
            style={{ backgroundColor: BRAND.blushRose }}
          >
            Bắt đầu mua sắm
          </a>
        </>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get("tab") as TabStatus) || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 10;

  // Get status filter for API
  const statusFilter = TABS.find((t) => t.key === activeTab)?.statusFilter;

  const { data, isLoading, isError } = useOrders({
    page,
    limit,
    status: statusFilter,
  });

  function handleTabChange(tab: TabStatus) {
    setSearchParams({ tab, page: "1" });
  }

  function handlePageChange(p: number) {
    setSearchParams({ tab: activeTab, page: String(p) });
  }

  const orders = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <Container>
          <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
            <div className="text-sm text-slate-500">Đang tải đơn hàng...</div>
          </div>
        </Container>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white min-h-screen">
        <Container>
          <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
            <div className="text-sm text-red-600">Không thể tải đơn hàng. Vui lòng thử lại sau.</div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
              Đơn hàng của tôi
            </h1>
            {data && data.total > 0 && (
              <p className="mt-2 text-sm text-slate-500">
                Tổng {data.total} đơn hàng
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b border-slate-200">
            <div className="flex flex-wrap gap-2 -mb-px">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
          {orders.length === 0 ? (
            <EmptyState activeTab={activeTab} />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <PaginationBar page={page} totalPages={totalPages} onChange={handlePageChange} />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
