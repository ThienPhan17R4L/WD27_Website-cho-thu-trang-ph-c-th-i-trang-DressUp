import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import CategorySearchSelect from "@/components/admin/CategorySearchSelect";
import { TagInput } from "@/components/admin/TagInput";
import {
  createProduct,
  updateProduct,
  getProductById,
} from "@/api/products.api";
import { uploadImage } from "@/api/upload.api";
import { useCategories } from "@/hooks/useCategories";
import { useNotification } from "@/contexts/NotificationContext";
import type { RentalTier, Variant } from "@/types/product";

/* ---------- helpers ---------- */
function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ---------- types ---------- */
type ProductForm = {
  name: string;
  slug: string;
  categoryId: string;
  brand: string;
  material: string;
  colorFamily: string;
  condition: "new" | "like-new" | "good";
  description: string;
  images: string[];
  rentalTiers: RentalTier[];
  depositDefault: number;
  variants: Variant[];
  tags: string;
  care: string;
  notes: string;
  status: "active" | "archived";
};

const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  categoryId: "",
  brand: "",
  material: "",
  colorFamily: "",
  condition: "new",
  description: "",
  images: [],
  rentalTiers: [{ label: "3 ngày", days: 3, price: 0 }],
  depositDefault: 0,
  variants: [{ size: "", color: "", skuHint: "" }],
  tags: "",
  care: "",
  notes: "",
  status: "active",
};

/* ---------- component ---------- */
export default function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(!isEdit);

  const { data: categories = [] } = useCategories();

  // Load existing product for edit
  const { data: existingProduct, isLoading: loadingProduct } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: () => getProductById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProduct && !loaded) {
      setForm({
        name: existingProduct.name,
        slug: existingProduct.slug,
        categoryId: existingProduct.categoryId || "",
        brand: existingProduct.brand || "",
        material: existingProduct.material || "",
        colorFamily: existingProduct.colorFamily || "",
        condition: existingProduct.condition || "new",
        description: existingProduct.description || "",
        images: [...(existingProduct.images || [])],
        rentalTiers: existingProduct.rentalTiers?.length
          ? existingProduct.rentalTiers.map((t) => ({ ...t }))
          : [{ label: "3 ngày", days: 3, price: 0 }],
        depositDefault: existingProduct.depositDefault || 0,
        variants: existingProduct.variants?.length
          ? existingProduct.variants.map((v) => ({
              size: v.size,
              color: v.color || "",
              skuHint: v.skuHint || "",
            }))
          : [],
        tags: (existingProduct.tags || []).join(", "),
        care: existingProduct.care || "",
        notes: existingProduct.notes || "",
        status: existingProduct.status,
      });
      setLoaded(true);
    }
  }, [existingProduct, loaded]);

  /* helpers */
  function setField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : toSlug(name),
    }));
  }

  /* rental tiers */
  function addTier() {
    setField("rentalTiers", [...form.rentalTiers, { label: "", days: 1, price: 0 }]);
  }
  function removeTier(idx: number) {
    setField("rentalTiers", form.rentalTiers.filter((_, i) => i !== idx));
  }
  function updateTier(idx: number, patch: Partial<RentalTier>) {
    setField("rentalTiers", form.rentalTiers.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }

  /* variants */
  function addVariant() {
    setField("variants", [...form.variants, { size: "", color: "", skuHint: "" }]);
  }
  function removeVariant(idx: number) {
    setField("variants", form.variants.filter((_, i) => i !== idx));
  }
  function updateVariant(idx: number, patch: Partial<Variant>) {
    setField("variants", form.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }

  /* images */
  function addImageUrl() {
    if (!imageUrl.trim()) return;
    setField("images", [...form.images, imageUrl.trim()]);
    setImageUrl("");
  }
  function removeImage(idx: number) {
    setField("images", form.images.filter((_, i) => i !== idx));
  }
  async function handleFileUpload(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await uploadImage(files[i]);
        urls.push(result.url);
      }
      setField("images", [...form.images, ...urls]);
      showNotification("success", `Đã upload ${urls.length} ảnh`);
    } catch (err: any) {
      showNotification("error", err.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /* mutations */
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      showNotification("success", "Tạo sản phẩm thành công!");
      navigate("/admin/products");
    },
    onError: (e: any) => showNotification("error", e.message || "Tạo sản phẩm thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-detail", id] });
      showNotification("success", "Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    },
    onError: (e: any) => showNotification("error", e.message || "Cập nhật thất bại"),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const validTiers = form.rentalTiers.filter((t) => t.label.trim() && t.days > 0 && t.price >= 0);
    const validVariants = form.variants.filter((v) => v.size.trim());

    const payload: any = {
      name: form.name,
      slug: form.slug || undefined,
      categoryId: form.categoryId || undefined,
      brand: form.brand || undefined,
      material: form.material || undefined,
      colorFamily: form.colorFamily || undefined,
      condition: form.condition,
      description: form.description || undefined,
      images: form.images,
      rentalTiers: validTiers,
      depositDefault: form.depositDefault,
      variants: validVariants,
      tags,
      care: form.care || undefined,
      notes: form.notes || undefined,
      status: form.status,
    };

    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Đang tải sản phẩm...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header bar */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div>
                <h1 className="text-base font-semibold text-slate-900">
                  {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h1>
                {isEdit && existingProduct && (
                  <p className="text-xs text-slate-400 mt-0.5">{existingProduct.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="rounded border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <Button
                variant="primary"
                type="submit"
                form="product-form"
                disabled={isSaving}
              >
                {isSaving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <form id="product-form" onSubmit={handleSubmit} className="py-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ===== Left column (2/3): main info ===== */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section: Thông tin cơ bản */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Thông tin cơ bản</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Tên sản phẩm <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Áo dài cưới trắng"
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Slug (URL)</label>
                    <input
                      value={form.slug}
                      onChange={(e) => setField("slug", e.target.value)}
                      placeholder="Tự sinh từ tên"
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <p className="mt-1 text-xs text-slate-400">Để trống sẽ tự sinh từ tên</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Danh mục <span className="text-rose-500">*</span>
                    </label>
                    <div className="mt-1">
                      <CategorySearchSelect
                        categories={categories}
                        value={form.categoryId}
                        onChange={(id) => setField("categoryId", id)}
                        placeholder="Chọn danh mục..."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Mô tả</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      rows={4}
                      placeholder="Mô tả chi tiết sản phẩm..."
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Đặc tính */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Đặc tính sản phẩm</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Thương hiệu</label>
                    <input
                      value={form.brand}
                      onChange={(e) => setField("brand", e.target.value)}
                      placeholder="Gucci, Chanel..."
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Tình trạng</label>
                    <select
                      value={form.condition}
                      onChange={(e) => setField("condition", e.target.value as "new" | "like-new" | "good")}
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="new">Mới</option>
                      <option value="like-new">Như mới</option>
                      <option value="good">Tốt</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Chất liệu</label>
                    <input
                      value={form.material}
                      onChange={(e) => setField("material", e.target.value)}
                      placeholder="Lụa, Voan, Cotton..."
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Họ màu</label>
                    <input
                      value={form.colorFamily}
                      onChange={(e) => setField("colorFamily", e.target.value)}
                      placeholder="Trắng, Đỏ, Đen..."
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-600">Tags</label>
                  <TagInput
                    value={form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : []}
                    onChange={(tags) => setField("tags", tags.join(", "))}
                    placeholder="Nhập tag và nhấn Enter..."
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Nhập tag và nhấn Enter hoặc dấu phẩy để thêm
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Hướng dẫn bảo quản</label>
                    <textarea
                      value={form.care}
                      onChange={(e) => setField("care", e.target.value)}
                      rows={2}
                      placeholder="Giặt tay nhẹ..."
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Ghi chú nội bộ</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      rows={2}
                      placeholder="Ghi chú cho nhân viên..."
                      className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Hình ảnh */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Hình ảnh sản phẩm</h2>
                <div className="flex gap-2 mb-3">
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
                    placeholder="Nhập URL hình ảnh..."
                    className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    disabled={!imageUrl.trim()}
                    className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                  >
                    Thêm URL
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {uploading ? "Đang upload..." : "Upload ảnh"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>

                {form.images.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {form.images.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`Ảnh ${idx + 1}`}
                          className="h-24 w-24 rounded object-cover border border-slate-200"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/96x96?text=Error"; }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >✕</button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center rounded-b">Ảnh bìa</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border-2 border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                    Chưa có hình ảnh
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">Ảnh đầu tiên sẽ làm ảnh bìa</p>
              </div>

              {/* Section: Biến thể */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-800">Biến thể (Size / Màu)</h2>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    + Thêm biến thể
                  </button>
                </div>
                {form.variants.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có biến thể.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2 text-xs text-slate-400 px-1">
                      <span>Size *</span><span>Màu sắc</span><span>Mã SKU</span><span></span>
                    </div>
                    {form.variants.map((v, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2">
                        <input value={v.size} onChange={(e) => updateVariant(idx, { size: e.target.value })} placeholder="S, M, L..." className="rounded border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                        <input value={v.color || ""} onChange={(e) => updateVariant(idx, { color: e.target.value })} placeholder="Đen, Trắng..." className="rounded border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                        <input value={v.skuHint || ""} onChange={(e) => updateVariant(idx, { skuHint: e.target.value })} placeholder="AD-001" className="rounded border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                        <button type="button" onClick={() => removeVariant(idx)} className="inline-flex h-8 w-8 items-center justify-center rounded text-rose-500 hover:bg-rose-50">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ===== Right column (1/3): pricing + status ===== */}
            <div className="space-y-6">
              {/* Trạng thái */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Trạng thái</h2>
                <select
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value as "active" | "archived")}
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="active">Hoạt động</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>

              {/* Giá & đặt cọc */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Giá thuê & Đặt cọc</h2>
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-600">
                    Tiền đặt cọc (VND) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.depositDefault}
                    onChange={(e) => setField("depositDefault", Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-600">Mức giá thuê</label>
                  <button
                    type="button"
                    onClick={addTier}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >+ Thêm</button>
                </div>

                {form.rentalTiers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có mức giá.</p>
                ) : (
                  <div className="space-y-2">
                    {form.rentalTiers.map((tier, idx) => (
                      <div key={idx} className="rounded border border-slate-100 bg-slate-50 p-2.5 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            value={tier.label}
                            onChange={(e) => updateTier(idx, { label: e.target.value })}
                            placeholder="Nhãn (VD: 3 ngày)"
                            className="flex-1 rounded border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          />
                          <button type="button" onClick={() => removeTier(idx)} className="text-rose-400 hover:text-rose-600">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400">Số ngày</label>
                            <input
                              type="number"
                              min={1}
                              value={tier.days}
                              onChange={(e) => updateTier(idx, { days: Number(e.target.value) })}
                              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Giá (VND)</label>
                            <input
                              type="number"
                              min={0}
                              value={tier.price}
                              onChange={(e) => updateTier(idx, { price: Number(e.target.value) })}
                              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
