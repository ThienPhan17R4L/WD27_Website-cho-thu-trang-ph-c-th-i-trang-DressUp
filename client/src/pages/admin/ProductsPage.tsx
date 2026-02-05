import { useMemo, useState } from 'react';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { PaginationBar } from '@/components/common/PaginationBar';
import { formatVND } from '@/utils/money';

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
};

function sampleProducts(): Product[] {
  const cats = ['Đầm dạ hội', 'Đầm cưới', 'Đầm công sở', 'Áo khoác'];
  const items: Product[] = [];
  for (let i = 1; i <= 37; i++) {
    items.push({
      id: i,
      name: `Sản phẩm ${i}`,
      sku: `SKU-${String(i).padStart(3, '0')}`,
      price: Math.round((200 + (i % 10) * 50) * 1000),
      category: cats[i % cats.length],
      stock: (i * 3) % 25,
    });
  }
  return items;
}

export default function AdminProductsPage() {
  const all = useMemo(() => sampleProducts(), []);
  const [products, setProducts] = useState<Product[]>(all);

  // UI state
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal / form state
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openAdd() {
    setEditing({ id: 0, name: '', sku: '', price: 0, category: '', stock: 0 });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing({ ...p });
    setShowForm(true);
  }

  function closeForm() {
    setEditing(null);
    setShowForm(false);
  }

  function saveProduct(form: Product) {
    if (form.id === 0) {
      // create
      const nextId = Math.max(0, ...products.map((p) => p.id)) + 1;
      setProducts([{ ...form, id: nextId }, ...products]);
    } else {
      // update
      setProducts(products.map((p) => (p.id === form.id ? form : p)));
    }
    closeForm();
  }


  function promptDelete(id: number) {
    setDeleteId(id);
    setShowDelete(true);
  }

  function confirmDelete() {
    if (deleteId == null) return;
    setProducts(products.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    setShowDelete(false);
  }

  function cancelDelete() {
    setDeleteId(null);
    setShowDelete(false);
  }

  // Reset page when filters change
  function handleSearchChange(v: string) {
    setQuery(v);
    setPage(1);
  }

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
        <div className="mt-6 mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={openAdd}>Thêm sản phẩm</Button>
            <input
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo tên, SKU, danh mục"
              className="w-72 rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Hiển thị</label>
            <select value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-md border border-slate-200 px-2 py-1 text-sm">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Tên</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Giá</th>
                <th className="px-3 py-3">Danh mục</th>
                <th className="px-3 py-3">Tồn kho</th>
                <th className="px-3 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-slate-600">{p.id}</td>
                  <td className="px-3 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-3 py-3 text-slate-600">{p.sku}</td>
                  <td className="px-3 py-3 text-slate-700">{formatVND(p.price)}</td>
                  <td className="px-3 py-3 text-slate-700">{p.category}</td>
                  <td className={`px-3 py-3 ${p.stock <= 2 ? 'text-rose-600' : 'text-slate-700'}`}>{p.stock}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        aria-label={`Sửa ${p.name}`}
                        title="Sửa"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M3 21v-3.75L14.06 6.19a2.25 2.25 0 0 1 3.18 0l.57.57a2.25 2.25 0 0 1 0 3.18L6.75 24H3v-3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <button
                        onClick={() => promptDelete(p.id)}
                        aria-label={`Xóa ${p.name}`}
                        title="Xóa"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M3 6h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationBar page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />
      </Container>

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{editing.id === 0 ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h3>
                <p className="mt-1 text-sm text-slate-500">Thêm thông tin cơ bản cho sản phẩm. Bạn có thể bổ sung hình ảnh và mô tả sau.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={closeForm} aria-label="Đóng" className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100">✕</button>
              </div>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={(e) => { e.preventDefault(); editing && saveProduct(editing); }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Tên sản phẩm *</label>
                    <input required className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-rose-200" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">SKU *</label>
                    <input required className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-rose-200" value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Giá (VNĐ) *</label>
                    <input required type="number" min={0} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-rose-200" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Danh mục</label>
                    <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-rose-200" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Tồn kho</label>
                    <input type="number" min={0} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-rose-200" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Hình ảnh</label>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="h-20 w-28 shrink-0 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">Preview</div>
                      <input type="file" disabled className="text-sm text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={closeForm} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm">Hủy</button>
                  <Button variant="primary" type="submit">{editing.id === 0 ? 'Tạo sản phẩm' : 'Lưu thay đổi'}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">!</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Xác nhận xóa</h3>
                <p className="mt-1 text-sm text-slate-600">Hành động này không thể hoàn tác. Bạn có chắc muốn xóa sản phẩm này?</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={cancelDelete} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm">Hủy</button>
              <button onClick={confirmDelete} className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
