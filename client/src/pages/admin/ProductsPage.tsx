import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { PaginationBar } from "@/components/common/PaginationBar";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/products.api";
import type { Product } from "@/types/product";
import { formatVND } from "@/utils/formatCurrency";
import { useNotification } from "@/contexts/NotificationContext";

type ProductForm = {
  _id?: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  depositDefault: number;
  status: "active" | "archived";
  // Simplified: Single rental tier for admin
  rentalPrice: number; // Price per day
  rentalDays: number; // Default days
};

export default function AdminProductsPage() {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // UI state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, pageSize, search],
    queryFn: () =>
      getAllProducts({
        page,
        limit: pageSize,
        q: search || undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      showNotification("success", "Tạo sản phẩm thành công!");
      closeForm();
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Tạo sản phẩm thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      showNotification("success", "Cập nhật sản phẩm thành công!");
      closeForm();
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Cập nhật sản phẩm thất bại");
    },
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

  function openAdd() {
    setEditing({
      name: "",
      slug: "",
      categoryId: "",
      description: "",
      depositDefault: 0,
      status: "active",
      rentalPrice: 0,
      rentalDays: 3,
    });
    setShowForm(true);
  }

  function openEdit(product: Product) {
    // Extract first rental tier for editing
    const firstTier = product.rentalTiers?.[0];

    setEditing({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId || "",
      description: product.description || "",
      depositDefault: product.depositDefault || 0,
      status: product.status,
      rentalPrice: firstTier?.price || 0,
      rentalDays: firstTier?.days || 3,
    });
    setShowForm(true);
  }

  function closeForm() {
    setEditing(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    // Build product data with minimal required fields
    const data: any = {
      name: editing.name,
      slug: editing.slug,
      categoryId: editing.categoryId || undefined,
      description: editing.description || undefined,
      depositDefault: editing.depositDefault,
      status: editing.status,
      images: [], // Empty for now
      variants: [], // Empty for now
      tags: [],
      rentalTiers: [
        {
          label: `${editing.rentalDays} ngày`,
          days: editing.rentalDays,
          price: editing.rentalPrice,
        },
      ],
    };

    if (editing._id) {
      updateMutation.mutate({ id: editing._id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function promptDelete(id: string) {
    setDeleteId(id);
    setShowDelete(true);
  }

  function confirmDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  }

  return (
    <div className="min-h-[400px]">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-lg font-semibold text-slate-900">
              Quản lý sản phẩm
            </h1>
            <div className="text-sm text-slate-500">/admin/products</div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={openAdd}>
              Thêm sản phẩm
            </Button>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên, slug"
              className="w-72 rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Hiển thị</label>
            <select
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-slate-200 px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
            Đang tải...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
            Không tìm thấy sản phẩm nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b">
                    <th className="px-3 py-3">Hình</th>
                    <th className="px-3 py-3">Tên sản phẩm</th>
                    <th className="px-3 py-3">Slug</th>
                    <th className="px-3 py-3">Giá thuê</th>
                    <th className="px-3 py-3">Đặt cọc</th>
                    <th className="px-3 py-3">Trạng thái</th>
                    <th className="px-3 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-3 py-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {product.name}
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-mono text-xs">
                        {product.slug}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {product.minPrice
                          ? formatVND(product.minPrice)
                          : "—"} / ngày
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatVND(product.depositDefault || 0)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            product.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.status === "active"
                            ? "Hoạt động"
                            : "Lưu trữ"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                            title="Sửa"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M3 21v-3.75L14.06 6.19a2.25 2.25 0 0 1 3.18 0l.57.57a2.25 2.25 0 0 1 0 3.18L6.75 24H3v-3z"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => promptDelete(product._id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100"
                            title="Xóa"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M3 6h18"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 11v6M14 11v6"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationBar
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </>
        )}
      </Container>

      {/* Add/Edit Form Modal */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editing._id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Form đơn giản hóa - chỉnh sửa các trường cơ bản
                </p>
              </div>
              <button
                onClick={closeForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Tên sản phẩm *
                  </label>
                  <input
                    required
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Slug (URL) *
                  </label>
                  <input
                    required
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
                    placeholder="san-pham-moi"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Giá thuê / ngày (VNĐ) *
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={editing.rentalPrice}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        rentalPrice: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Số ngày thuê mặc định
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editing.rentalDays}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        rentalDays: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Đặt cọc (VNĐ) *
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={editing.depositDefault}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        depositDefault: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Trạng thái
                  </label>
                  <select
                    value={editing.status}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        status: e.target.value as "active" | "archived",
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-600">
                    ID danh mục
                  </label>
                  <input
                    value={editing.categoryId}
                    onChange={(e) =>
                      setEditing({ ...editing, categoryId: e.target.value })
                    }
                    placeholder="Nhập ID danh mục (optional)"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-600">
                    Mô tả
                  </label>
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={3}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  Hủy
                </button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Đang lưu..."
                    : editing._id
                    ? "Lưu thay đổi"
                    : "Tạo sản phẩm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
                !
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Xác nhận xóa
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Hành động này không thể hoàn tác. Bạn có chắc muốn xóa sản
                  phẩm này?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDelete(false);
                  setDeleteId(null);
                }}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm"
                disabled={deleteMutation.isPending}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={deleteMutation.isPending}
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
