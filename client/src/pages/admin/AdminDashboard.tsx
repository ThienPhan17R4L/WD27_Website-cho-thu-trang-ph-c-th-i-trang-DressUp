import { useNavigate } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { useDashboard } from "@/hooks/useDashboard";
import { formatVND } from "@/utils/formatCurrency";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  accent,
  urgent,
  loading,
}: {
  label: string;
  value?: string | number;
  sub?: string;
  accent?: string;
  urgent?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        urgent ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      {loading ? (
        <div className="mt-2 space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      ) : (
        <>
          <div className={`mt-2 text-3xl font-bold ${accent ?? "text-slate-900"}`}>{value}</div>
          {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
        </>
      )}
    </div>
  );
}

// ─── Revenue Bar Chart ─────────────────────────────────────────────────────
function RevenueChart({
  data,
}: {
  data: Array<{ date: string; revenue: number; count: number }>;
}) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const allZero = data.every((d) => d.revenue === 0);

  return (
    <div>
      <div className="relative flex h-44 items-end gap-1.5 border-b border-slate-100 pb-0">
        {/* Grid lines */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-full border-t border-slate-100" />
          ))}
        </div>

        {data.map((d) => {
          const heightPct = d.revenue > 0 ? Math.max((d.revenue / max) * 100, 5) : 0;
          const label = new Date(d.date + "T00:00:00").toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
          return (
            <div
              key={d.date}
              className="group relative flex flex-1 flex-col items-center justify-end h-full"
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block whitespace-nowrap z-10">
                <div className="text-slate-300">{label}</div>
                <div className="font-semibold">{formatVND(d.revenue)}</div>
                <div className="text-slate-400">{d.count} đơn</div>
              </div>
              {/* Bar */}
              {d.revenue > 0 ? (
                <div
                  className="w-full rounded-t transition-all duration-500 cursor-pointer hover:opacity-80"
                  style={{
                    height: `${heightPct}%`,
                    background: "rgb(213,176,160)",
                  }}
                />
              ) : (
                /* Zero bar — thin 2px line */
                <div className="w-full" style={{ height: "2px", background: "#e2e8f0" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* No data overlay */}
      {allZero && (
        <div className="mt-3 text-center text-xs text-slate-400">
          Chưa có doanh thu đã thanh toán trong 7 ngày qua
        </div>
      )}

      {/* X labels */}
      <div className="mt-2 flex gap-1.5">
        {data.map((d) => {
          const label = new Date(d.date + "T00:00:00").toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
          return (
            <div key={d.date} className="flex-1 text-center text-[10px] text-slate-400">
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Revenue Chart Skeleton ────────────────────────────────────────────────
function RevenueChartSkeleton() {
  const heights = [55, 35, 75, 25, 65, 45, 85];
  return (
    <div>
      <div className="flex h-44 items-end gap-1.5 border-b border-slate-100">
        {heights.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t animate-pulse bg-slate-200"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {Array(7).fill(0).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-3" />
        ))}
      </div>
    </div>
  );
}

// ─── Status Breakdown ──────────────────────────────────────────────────────
function StatusBreakdown({
  data,
  total,
}: {
  data: Array<{ _id: string; count: number }>;
  total: number;
}) {
  const barColors: Record<string, string> = {
    completed: "bg-emerald-400",
    active_rental: "bg-green-400",
    renting: "bg-green-400",
    delivered: "bg-teal-400",
    shipping: "bg-purple-400",
    picking: "bg-indigo-400",
    confirmed: "bg-blue-400",
    returned: "bg-orange-400",
    overdue: "bg-red-500",
    inspecting: "bg-amber-400",
    pending_payment: "bg-yellow-400",
    pending: "bg-yellow-400",
    cancelled: "bg-slate-300",
    draft: "bg-slate-200",
  };

  return (
    <ul className="mt-3 space-y-3">
      {data.slice(0, 9).map((row) => {
        const pct = total > 0 ? Math.max((row.count / total) * 100, 1) : 0;
        return (
          <li key={row._id}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-600">{ORDER_STATUS_LABELS[row._id] ?? row._id}</span>
              <span className="font-semibold text-slate-800">{row.count}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${barColors[row._id] ?? "bg-slate-300"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data, isLoading, refetch, dataUpdatedAt } = useDashboard();
  const navigate = useNavigate();

  const updatedTime = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const urgent =
    (data?.overdueCount ?? 0) > 0 ||
    (data?.pendingReturns ?? 0) > 0 ||
    (data?.pendingPaymentCount ?? 0) > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Tổng quan hệ thống</h1>
              {updatedTime && (
                <p className="text-xs text-slate-400">Cập nhật lúc {updatedTime}</p>
              )}
            </div>
            <button
              onClick={() => void refetch()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Làm mới
            </button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-6 space-y-6">
          {/* Alert bar — chỉ hiện khi đã có data */}
          {urgent && !isLoading && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <svg
                className="h-4 w-4 shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-red-700">Cần xử lý:</span>
              {(data?.overdueCount ?? 0) > 0 && (
                <span
                  className="cursor-pointer rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 hover:bg-red-200"
                  onClick={() => navigate("/admin/orders?status=overdue")}
                >
                  {data!.overdueCount} đơn quá hạn
                </span>
              )}
              {(data?.pendingReturns ?? 0) > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  {data!.pendingReturns} chờ kiểm tra trả hàng
                </span>
              )}
              {(data?.pendingPaymentCount ?? 0) > 0 && (
                <span
                  className="cursor-pointer rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 hover:bg-yellow-200"
                  onClick={() => navigate("/admin/orders?status=pending_payment")}
                >
                  {data!.pendingPaymentCount} chờ thanh toán
                </span>
              )}
            </div>
          )}

          {/* ── KPI row 1: hoạt động thuê ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Đơn hàng hôm nay"
              loading={isLoading}
              value={data?.ordersToday ?? 0}
              sub={`Tổng tất cả: ${data?.totalOrdersAllTime ?? 0} đơn`}
            />
            <KpiCard
              label="Đang cho thuê"
              loading={isLoading}
              value={data?.activeRentals ?? 0}
              accent="text-green-600"
            />
            <KpiCard
              label="Quá hạn trả"
              loading={isLoading}
              value={data?.overdueCount ?? 0}
              accent={(data?.overdueCount ?? 0) > 0 ? "text-red-600" : "text-slate-900"}
              urgent={(data?.overdueCount ?? 0) > 0}
            />
            <KpiCard
              label="Chờ kiểm tra trả"
              loading={isLoading}
              value={data?.pendingReturns ?? 0}
              accent={(data?.pendingReturns ?? 0) > 0 ? "text-amber-600" : "text-slate-900"}
            />
          </div>

          {/* ── KPI row 2: doanh thu & người dùng ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Chờ thanh toán"
              loading={isLoading}
              value={data?.pendingPaymentCount ?? 0}
              accent={(data?.pendingPaymentCount ?? 0) > 0 ? "text-yellow-600" : "text-slate-900"}
            />
            <KpiCard
              label="Khách hàng"
              loading={isLoading}
              value={data?.totalUsers ?? 0}
              sub={`+${data?.newUsersToday ?? 0} hôm nay`}
              accent="text-blue-600"
            />
            <KpiCard
              label="Doanh thu tháng này"
              loading={isLoading}
              value={formatVND(data?.revenueThisMonth ?? 0)}
              accent="text-rose-600"
            />
            <KpiCard
              label="Doanh thu 7 ngày"
              loading={isLoading}
              value={formatVND(data?.revenue7Days ?? 0)}
              accent="text-rose-500"
            />
          </div>

          {/* ── Biểu đồ + Trạng thái ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Revenue chart */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-700">
                    Doanh thu 7 ngày gần nhất
                  </h2>
                  <p className="text-xs text-slate-400">Chỉ tính đơn đã thanh toán</p>
                </div>
                {!isLoading && (
                  <span className="text-xs font-semibold" style={{ color: "rgb(213,176,160)" }}>
                    {formatVND(data?.revenue7Days ?? 0)}
                  </span>
                )}
              </div>
              {isLoading ? (
                <RevenueChartSkeleton />
              ) : (
                <RevenueChart data={data?.revenue7DaysFilled ?? []} />
              )}
            </div>

            {/* Status breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700">Phân tích trạng thái đơn</h2>
              <p className="text-xs text-slate-400">
                Tổng {data?.totalOrdersAllTime ?? "—"} đơn
              </p>
              {isLoading ? (
                <ul className="mt-3 space-y-3">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <li key={i}>
                        <Skeleton className="mb-1.5 h-3 w-full" />
                        <Skeleton className="h-1.5 w-full" />
                      </li>
                    ))}
                </ul>
              ) : data?.orderStatusBreakdown?.length ? (
                <StatusBreakdown
                  data={data.orderStatusBreakdown}
                  total={data.totalOrdersAllTime ?? 0}
                />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>

          {/* ── Đơn hàng gần đây (full width) ── */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-700">Đơn hàng gần đây</h2>
              <button
                onClick={() => navigate("/admin/orders")}
                className="text-xs font-medium hover:underline"
                style={{ color: "rgb(213,176,160)" }}
              >
                Xem tất cả →
              </button>
            </div>

            {isLoading ? (
              <div className="divide-y divide-slate-100">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex gap-6 px-5 py-3.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                  ))}
              </div>
            ) : data?.recentOrders?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs text-slate-400">
                      <th className="px-5 py-3 font-medium">Mã đơn</th>
                      <th className="px-5 py-3 font-medium">Tổng tiền</th>
                      <th className="px-5 py-3 font-medium">Trạng thái đơn</th>
                      <th className="px-5 py-3 font-medium">Thanh toán</th>
                      <th className="px-5 py-3 font-medium">Phương thức</th>
                      <th className="px-5 py-3 font-medium">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="cursor-pointer transition-colors hover:bg-slate-50"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-800">
                          {order.orderNumber}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          {formatVND(order.total)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              ORDER_STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              order.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : order.paymentStatus === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : order.paymentStatus === "refunded"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {order.paymentStatus === "paid"
                              ? "Đã thanh toán"
                              : order.paymentStatus === "failed"
                                ? "Thất bại"
                                : order.paymentStatus === "refunded"
                                  ? "Đã hoàn tiền"
                                  : "Chờ TT"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {order.paymentMethod === "store"
                            ? "Tại cửa hàng"
                            : order.paymentMethod === "cod"
                              ? "COD"
                              : order.paymentMethod?.toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                Chưa có đơn hàng nào
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
