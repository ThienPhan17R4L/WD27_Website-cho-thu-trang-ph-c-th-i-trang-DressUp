import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ordersApi } from "@/api/orders.api";
import { returnsApi } from "@/api/returns.api";

function StatCard({
  label,
  value,
  color,
  onClick,
}: {
  label: string;
  value: number | string;
  color: "indigo" | "amber" | "rose" | "green" | "slate";
  onClick?: () => void;
}) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    green: "bg-green-50 text-green-700 border-green-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-5 text-left transition-shadow hover:shadow-md w-full ${colorMap[color]} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm font-medium opacity-80">{label}</div>
    </button>
  );
}

export default function StaffDashboardPage() {
  const navigate = useNavigate();

  const { data: ordersData } = useQuery({
    queryKey: ["staff-dashboard-orders"],
    queryFn: () => ordersApi.admin.getAll({ limit: 200, page: 1 }),
    refetchInterval: 60_000,
  });

  const { data: returnsData } = useQuery({
    queryKey: ["staff-dashboard-returns"],
    queryFn: () => returnsApi.list({ limit: 200, page: 1 }),
    refetchInterval: 60_000,
  });

  const orders = (ordersData as any)?.items || (ordersData as any)?.orders || [];
  const returns = (returnsData as any)?.items || [];

  // Count by status
  const toConfirm = orders.filter((o: any) => o.status === "confirmed").length;
  const toPick = orders.filter((o: any) => o.status === "picking").length;
  const toShip = orders.filter((o: any) => o.status === "shipping").length;
  const activeRentals = orders.filter((o: any) => o.status === "active_rental").length;
  const overdue = orders.filter((o: any) => o.status === "overdue").length;
  const toInspect = returns.filter((r: any) => r.status === "pending_inspection").length;

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-6">
          <h1 className="text-xl font-bold text-slate-900">Dashboard nhân viên</h1>
          <p className="mt-1 text-sm text-slate-400">{today}</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Việc cần làm hôm nay */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Việc cần xử lý
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              label="Đơn đã xác nhận (cần lấy hàng)"
              value={toConfirm}
              color="indigo"
              onClick={() => navigate("/staff/orders")}
            />
            <StatCard
              label="Đang lấy hàng"
              value={toPick}
              color="amber"
              onClick={() => navigate("/staff/orders")}
            />
            <StatCard
              label="Đang giao hàng"
              value={toShip}
              color="amber"
              onClick={() => navigate("/staff/orders")}
            />
          </div>
        </section>

        {/* Tình trạng thuê */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Tình trạng thuê
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              label="Đang thuê"
              value={activeRentals}
              color="green"
              onClick={() => navigate("/staff/orders")}
            />
            <StatCard
              label="Quá hạn"
              value={overdue}
              color="rose"
              onClick={() => navigate("/staff/orders")}
            />
            <StatCard
              label="Chờ kiểm tra trả hàng"
              value={toInspect}
              color="rose"
              onClick={() => navigate("/staff/returns")}
            />
          </div>
        </section>

        {/* Quick links */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Truy cập nhanh
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              onClick={() => navigate("/staff/orders")}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">Quản lý đơn hàng</div>
                <div className="text-xs text-slate-400 mt-0.5">Xem & xử lý đơn thuê</div>
              </div>
            </button>

            <button
              onClick={() => navigate("/staff/inventory")}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">Kiểm tra tồn kho</div>
                <div className="text-xs text-slate-400 mt-0.5">Xem trạng thái sản phẩm</div>
              </div>
            </button>

            <button
              onClick={() => navigate("/staff/returns")}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M9 14l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">Kiểm tra trả hàng</div>
                <div className="text-xs text-slate-400 mt-0.5">Kiểm tra & đóng đơn trả</div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
