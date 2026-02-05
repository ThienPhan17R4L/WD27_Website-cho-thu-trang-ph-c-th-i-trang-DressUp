import { Container } from "@/components/common/Container";

function StatCard({ title, value, delta }: { title: string; value: string; delta?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-400">{title}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {delta && <div className="text-sm text-green-600">{delta}</div>}
      </div>
    </div>
  );
}

const recentProducts = [
  { id: 1, name: "Đầm dạ hội Lux", sku: "SKU-001", price: "1.200.000đ", stock: 12 },
  { id: 2, name: "Đầm tiệc Pink", sku: "SKU-002", price: "850.000đ", stock: 5 },
  { id: 3, name: "Đầm cưới Alice", sku: "SKU-003", price: "2.500.000đ", stock: 2 },
];

export default function AdminDashboard() {
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
        <div className="-mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Doanh thu (tháng)" value="45.200.000đ" delta="+12%" />
          <StatCard title="Đơn hàng" value="1.240" delta="+4%" />
          <StatCard title="Khách hàng mới" value="320" delta="+9%" />
          <StatCard title="Sản phẩm hết hàng" value="8" delta="-3%" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">Doanh thu theo ngày (placeholder)</h2>
            <div className="mt-4 h-48 flex items-center justify-center rounded-md border border-dashed border-slate-200 text-sm text-slate-400">
              Biểu đồ (placeholder) — tích hợp Chart khi cần
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">Tổng quan</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Đơn chờ xử lý: <strong className="text-slate-900">12</strong></li>
              <li>Yêu cầu trả hàng: <strong className="text-slate-900">3</strong></li>
              <li>Khách khiếu nại: <strong className="text-slate-900">1</strong></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Sản phẩm gần đây</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Giá</th>
                  <th className="px-3 py-2">Tồn kho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 text-slate-600">{p.id}</td>
                    <td className="px-3 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-3 py-3 text-slate-600">{p.sku}</td>
                    <td className="px-3 py-3 text-slate-700">{p.price}</td>
                    <td className={`px-3 py-3 ${p.stock <= 2 ? 'text-rose-600' : 'text-slate-700'}`}>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </div>
  );
}
