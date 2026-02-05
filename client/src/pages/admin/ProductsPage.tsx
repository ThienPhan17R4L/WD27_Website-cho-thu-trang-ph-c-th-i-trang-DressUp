import { Container } from '@/components/common/Container';

export default function AdminProductsPage() {
  return (
    <div className="min-h-[400px]">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-lg font-semibold text-slate-900">Quản lý sản phẩm</h1>
            <div className="text-sm text-slate-500">/admin/products</div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">Chưa có dữ liệu — đây là trang quản lý sản phẩm (placeholder).</div>
      </Container>
    </div>
  );
}
