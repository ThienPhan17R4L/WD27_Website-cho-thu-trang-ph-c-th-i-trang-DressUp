import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categories.api";
import { uploadImage } from "@/api/upload.api";
import type { Category } from "@/types/category";
import { useNotification } from "@/contexts/NotificationContext";

type CategoryForm = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  parentId: string;
  isActive: boolean;
  sortOrder: number;
  image: string;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  isActive: true,
  sortOrder: 0,
  image: "",
};

export default function AdminCategoriesPage() {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryForm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load all categories (high limit, no pagination needed)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories-all"],
    queryFn: () => getAllCategories({ page: 1, limit: 500 }),
  });

  const allCategories: Category[] = data?.items || [];

  // Build tree
  const roots = allCategories.filter(
    (c) => !c.parentId && (
      !search || c.name.toLowerCase().includes(search.toLowerCase())
    )
  );
  // when searching, also show children whose name matches
  const childrenMatchingSearch = search
    ? allCategories.filter(
        (c) => c.parentId && c.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];
  const childrenByParent: Record<string, Category[]> = {};
  allCategories
    .filter((c) => !!c.parentId)
    .forEach((c) => {
      const pid = c.parentId!;
      if (!childrenByParent[pid]) childrenByParent[pid] = [];
      childrenByParent[pid].push(c);
    });

  // Roots to display: roots matching search, plus parents of matched children
  const extraParentIds = new Set(childrenMatchingSearch.map((c) => c.parentId!));
  const displayRoots = [
    ...roots,
    ...allCategories.filter(
      (c) => !c.parentId && extraParentIds.has(c._id) && !roots.find((r) => r._id === c._id)
    ),
  ].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      showNotification("success", "Tạo danh mục thành công!");
      closeForm();
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Tạo danh mục thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      showNotification("success", "Cập nhật danh mục thành công!");
      closeForm();
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Cập nhật danh mục thất bại");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      showNotification("success", "Xóa danh mục thành công!");
      setShowDelete(false);
      setDeleteId(null);
    },
    onError: (error: any) => {
      showNotification("error", error.message || "Xóa danh mục thất bại");
    },
  });

  function openAdd(parentId = "") {
    setEditing({ ...EMPTY_FORM, parentId });
    setShowForm(true);
  }

  function openEdit(category: Category) {
    setEditing({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      image: category.image || "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setEditing(null);
    setShowForm(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    try {
      setUploading(true);
      const result = await uploadImage(file);
      setEditing({ ...editing, image: result.url });
      showNotification("success", "Tải ảnh thành công!");
    } catch {
      showNotification("error", "Tải ảnh thất bại");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    const payload = {
      name: editing.name,
      slug: editing.slug,
      description: editing.description || undefined,
      parentId: editing.parentId || null,
      isActive: editing.isActive,
      sortOrder: editing.sortOrder,
      image: editing.image || undefined,
    };

    if (editing._id) {
      updateMutation.mutate({ id: editing._id, data: payload });
    } else {
      createMutation.mutate(payload);
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

  // Render a category row (root or child)
  function renderRow(category: Category, depth: number): React.ReactElement {
    const children = (childrenByParent[category._id] || []).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
    );
    const hasChildren = children.length > 0;
    const isOpen = expanded.has(category._id);
    const parentName = category.parentId
      ? allCategories.find((c) => c._id === category.parentId)?.name
      : null;

    return (
      <>
        <tr key={category._id} className="hover:bg-slate-50 group">
          {/* Name cell with indent + expand toggle */}
          <td className="px-3 py-2.5">
            <div
              className="flex items-center gap-1.5"
              style={{ paddingLeft: depth * 20 }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(category._id)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-slate-400 hover:text-slate-700"
                >
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <span className="h-5 w-5 flex-shrink-0" />
              )}
              {/* Thumbnail */}
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-8 w-8 flex-shrink-0 rounded object-cover border border-slate-100"
                />
              ) : (
                <div className="h-8 w-8 flex-shrink-0 rounded border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 text-xs">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
              <div>
                <span className={`font-medium text-slate-900 ${depth === 0 ? "text-sm" : "text-xs"}`}>
                  {category.name}
                </span>
                {parentName && (
                  <span className="ml-2 text-xs text-slate-400">
                    trong {parentName}
                  </span>
                )}
              </div>
            </div>
          </td>
          <td className="px-3 py-2.5 font-mono text-xs text-slate-500">
            {category.slug}
          </td>
          <td className="px-3 py-2.5 text-xs text-slate-500 max-w-xs truncate">
            {category.description || "—"}
          </td>
          <td className="px-3 py-2.5 text-xs text-slate-500 text-center">
            {category.sortOrder}
          </td>
          <td className="px-3 py-2.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                category.isActive
                  ? "bg-green-50 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {category.isActive ? "Hoạt động" : "Ẩn"}
            </span>
          </td>
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Add child (only for roots) */}
              {depth === 0 && (
                <button
                  onClick={() => openAdd(category._id)}
                  title="Thêm danh mục con"
                  className="inline-flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => openEdit(category)}
                title="Sửa"
                className="inline-flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-700 hover:bg-amber-100"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M3 21v-3.75L14.06 6.19a2.25 2.25 0 013.18 0l.57.57a2.25 2.25 0 010 3.18L6.75 21H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => promptDelete(category._id)}
                title="Xóa"
                className="inline-flex h-7 w-7 items-center justify-center rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        {/* Children rows */}
        {hasChildren && isOpen && (
          <>
            {children.map((child) => renderRow(child, depth + 1))}
          </>
        )}
      </>
    );
  }

  return (
    <div className="min-h-[400px]">
      {/* Page header */}
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Quản lý danh mục</h1>
              <p className="mt-0.5 text-xs text-slate-400">
                {allCategories.filter((c) => !c.parentId).length} danh mục cha ·{" "}
                {allCategories.filter((c) => !!c.parentId).length} danh mục con
              </p>
            </div>
            <Button variant="primary" onClick={() => openAdd()}>
              + Thêm danh mục
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên danh mục..."
            className="w-72 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm">
            Đang tải danh mục...
          </div>
        ) : displayRoots.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm">
            Không tìm thấy danh mục nào
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-3 py-3">Danh mục</th>
                  <th className="px-3 py-3">Slug</th>
                  <th className="px-3 py-3">Mô tả</th>
                  <th className="px-3 py-3 text-center">Thứ tự</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayRoots.map((root) => renderRow(root, 0))}
              </tbody>
            </table>
          </div>
        )}
      </Container>

      {/* Add/Edit Modal */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">
                {editing._id ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <button
                onClick={closeForm}
                className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Tên + slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Tên danh mục <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={editing.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditing({
                        ...editing,
                        name,
                        slug: editing.slug || autoSlug(name),
                      });
                    }}
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Slug (URL) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="danh-muc-moi"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="text-xs font-medium text-slate-600">Mô tả</label>
                <textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  rows={2}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {/* Danh mục cha + thứ tự + trạng thái */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-medium text-slate-600">
                    Danh mục cha
                  </label>
                  <select
                    value={editing.parentId}
                    onChange={(e) =>
                      setEditing({ ...editing, parentId: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">— Không có (danh mục gốc) —</option>
                    {allCategories
                      .filter((c) => !c.parentId && c._id !== editing._id)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    value={editing.sortOrder}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        sortOrder: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Trạng thái
                  </label>
                  <select
                    value={editing.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="true">Hoạt động</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Hình ảnh đại diện{" "}
                  <span className="text-slate-400">(dành cho danh mục cha)</span>
                </label>
                <div className="mt-1 flex gap-3">
                  <input
                    value={editing.image}
                    onChange={(e) =>
                      setEditing({ ...editing, image: e.target.value })
                    }
                    placeholder="https://... hoặc tải lên bên cạnh"
                    className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-shrink-0 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    {uploading ? "Đang tải..." : "Tải ảnh lên"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                {editing.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={editing.image}
                      alt="preview"
                      className="h-16 w-16 rounded object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, image: "" })}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Hủy
                </button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending || uploading
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Đang lưu..."
                    : editing._id
                    ? "Lưu thay đổi"
                    : "Tạo danh mục"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-lg">
                !
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Xác nhận xóa</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Hành động này không thể hoàn tác. Các danh mục con sẽ trở thành danh mục gốc.
                </p>
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
                onClick={confirmDelete}
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
