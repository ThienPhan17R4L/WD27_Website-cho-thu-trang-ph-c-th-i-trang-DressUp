import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { PaginationBar } from "@/components/common/PaginationBar";
import { getAllProducts, deleteProduct } from "@/api/products.api";
import { formatVND } from "@/utils/formatCurrency";
import { useNotification } from "@/contexts/NotificationContext";
import { useCategories } from "@/hooks/useCategories";

const CONDITION_LABELS: Record<string, string> = {
  new: "Mới",
  "like-new": "Như mới",
  good: "Tốt",
};

export default function AdminProductsPage() {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: categories = [] } = useCategories();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, pageSize, search],
    queryFn: () =>
      getAllProducts({ page, limit: pageSize, q: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      showNotification("success", "Xóa sản phẩm thành công!");
      setShowDelete(false);
      setDeleteId(null);
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Xóa sản phẩm thất bại");
    },
  });

  const products = data?.items || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-[400px]">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Quản lý sản phẩm</h1>
              <p className="mt-0.5 text-xs text-slate-400">{data?.total ?? 0} sản phẩm</p>
            </div>
            <Button variant="primary" onClick={() => navigate("/admin/products/new")}>
              + Thêm sản phẩm
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 mb-4 flex items-center justify-between gap-4">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên, slug..."
            className="w-72 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(213,176,160,0.7)]"
          />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            Hiển thị
            <select
              value={String(pageSize)}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded border border-slate-200 px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm">
            Đang tải...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm">
            Không tìm thấy sản phẩm nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="px-3 py-3 w-14">Hình</th>
                    <th className="px-3 py-3">Tên sản phẩm</th>
                    <th className="px-3 py-3">Danh mục</th>
                    <th className="px-3 py-3">Giá thuê</th>
                    <th className="px-3 py-3">Đặt cọc</th>
                    <th className="px-3 py-3">Tình trạng</th>
                    <th className="px-3 py-3">Trạng thái</th>
                    <th className="px-3 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const cat = categories.find((c) => c._id === product.categoryId);
                    return (
                      <tr key={product._id} className="hover:bg-slate-50 group">
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => navigate(`/admin/products/${product.slug}`)}
                            className="cursor-pointer hover:opacity-75 transition-opacity"
                            title="Xem sản phẩm"
                          >
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-12 w-12 rounded object-cover border border-slate-100"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 text-xs">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => navigate(`/admin/products/${product.slug}`)}
                            className="text-left cursor-pointer hover:text-[rgb(213,176,160)] transition-colors"
                            title="Xem sản phẩm"
                          >
                            <div className="font-medium text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{product.slug}</div>
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{cat?.name || "—"}</td>
                        <td className="px-3 py-2.5 text-slate-700 text-xs">
                          {product.minPrice ? formatVND(product.minPrice) : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 text-xs">
                          {formatVND(product.depositDefault || 0)}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">
                          {CONDITION_LABELS[product.condition] || product.condition}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            product.status === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {product.status === "active" ? "Hoạt động" : "Lưu trữ"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/admin/products/${product.slug}`)}
                              title="Xem chi tiết"
                              className="inline-flex h-7 w-7 items-center justify-center rounded text-blue-700 hover:bg-blue-50"
                              style={{ background: "rgba(213, 176, 160, 0.1)", color: "rgb(213, 176, 160)" }}
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                              title="Sửa"
                              className="inline-flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-700 hover:bg-amber-100"
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => { setDeleteId(product._id); setShowDelete(true); }}
                              title="Xóa"
                              className="inline-flex h-7 w-7 items-center justify-center rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Container>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-lg">!</div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Xác nhận xóa</h3>
                <p className="mt-1 text-sm text-slate-600">Hành động này không thể hoàn tác. Bạn có chắc muốn xóa sản phẩm này?</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => { setShowDelete(false); setDeleteId(null); }}
                disabled={deleteMutation.isPending}
                className="rounded border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
