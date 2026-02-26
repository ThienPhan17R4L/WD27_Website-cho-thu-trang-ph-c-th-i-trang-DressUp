import { Container } from "@/components/common/Container";
import { useDashboard } from "@/hooks/useDashboard";
import { formatVND } from "@/utils/formatCurrency";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";

function StatCard({ title, value, color }: { title: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-400">{title}</div>
      <div className="mt-2">
        <div className={`text-2xl font-bold ${color || "text-slate-900"}`}>{value}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
            <div className="text-sm text-slate-500">/admin</div>
          </div>
        </Container>
      </div>

      <Container>
        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-400">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="-mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Đơn hàng hôm nay"
                value={String(data?.ordersToday || 0)}
              />
              <StatCard
                title="Đang cho thuê"
                value={String(data?.activeRentals || 0)}
                color="text-green-600"
              />
              <StatCard
                title="Quá hạn trả"
                value={String(data?.overdueCount || 0)}
                color={data?.overdueCount ? "text-red-600" : "text-slate-900"}
              />
              <StatCard
                title="Doanh thu 7 ngày"
                value={formatVND(data?.revenue7Days || 0)}
                color="text-rose-600"
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700">Đơn hàng gần đây</h2>
                <div className="mt-4 overflow-x-auto">
                  {data?.recentOrders && data.recentOrders.length > 0 ? (
                    <table className="w-full table-auto text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-400">
                          <th className="px-3 py-2">Mã đơn</th>
                          <th className="px-3 py-2">Tổng tiền</th>
                          <th className="px-3 py-2">Trạng thái</th>
                          <th className="px-3 py-2">Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.recentOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-slate-50">
                            <td className="px-3 py-3 font-medium text-slate-900">
                              {order.orderNumber}
                            </td>
                            <td className="px-3 py-3 text-slate-700">
                              {formatVND(order.total)}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  ORDER_STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {ORDER_STATUS_LABELS[order.status] || order.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                      Chưa có đơn hàng nào
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700">Tổng quan</h2>
                <ul className="mt-3 space-y-3 text-sm text-slate-600">
                  <li className="flex justify-between">
                    <span>Đơn hàng hôm nay</span>
                    <strong className="text-slate-900">{data?.ordersToday || 0}</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Đang cho thuê</span>
                    <strong className="text-green-600">{data?.activeRentals || 0}</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Quá hạn trả</span>
                    <strong className={data?.overdueCount ? "text-red-600" : "text-slate-900"}>
                      {data?.overdueCount || 0}
                    </strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Chờ kiểm tra trả</span>
                    <strong className="text-amber-600">{data?.pendingReturns || 0}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
