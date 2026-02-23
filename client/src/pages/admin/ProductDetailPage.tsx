import { useParams, useNavigate } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { useProduct } from "@/hooks/useProduct";
import { ProductGallery } from "@/components/products/ProductGallery";
import { formatVND } from "@/utils/formatCurrency";
import { BRAND } from "@/pages/CategoriesPage";

const CONDITION_LABELS: Record<string, string> = {
  new: "Mới",
  "like-new": "Như mới",
  good: "Tốt",
};

export default function AdminProductDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug);

  if (isLoading) {
    return (
      <div className="min-h-[400px]">
        <div className="border-b border-slate-200 bg-white">
          <Container>
            <div className="py-6">
              <h1 className="text-lg font-semibold text-slate-900">Chi tiết sản phẩm</h1>
            </div>
          </Container>
        </div>
        <Container>
          <div className="py-12 text-center text-sm text-slate-500">Đang tải...</div>
        </Container>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-[400px]">
        <div className="border-b border-slate-200 bg-white">
          <Container>
            <div className="py-6">
              <h1 className="text-lg font-semibold text-slate-900">Chi tiết sản phẩm</h1>
            </div>
          </Container>
        </div>
        <Container>
          <div className="py-12 text-center text-sm text-rose-600">
            Không tìm thấy sản phẩm
          </div>
        </Container>
      </div>
    );
  }

  const sizes = Array.from(new Set(product.variants?.map((v) => v.size).filter(Boolean) ?? []));
  const colors = Array.from(new Set(product.variants?.map((v) => v.color).filter(Boolean) ?? []));

  return (
    <div className="min-h-[400px]">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{product.name}</h1>
              <p className="mt-0.5 text-xs text-slate-400 font-mono">{product.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/admin/products")}
              >
                ← Quay lại
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/admin/products/${product._id}/edit`)}
              >
                ✎ Chỉnh sửa
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container>
        <div className="py-8">
          <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
            {/* Left: Gallery */}
            <div>
              <ProductGallery images={product.images} />
            </div>

            {/* Right: Details */}
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    product.status === "active"
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {product.status === "active" ? "Hoạt động" : "Lưu trữ"}
                </span>
                <span className="rounded-full px-3 py-1 text-sm font-medium bg-slate-100 text-slate-700">
                  {CONDITION_LABELS[product.condition] || product.condition}
                </span>
              </div>

              {/* Basic Info */}
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Thông tin cơ bản</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID:</span>
                    <span className="font-mono text-slate-900 text-xs">{product._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Brand:</span>
                    <span className="text-slate-900">{product.brand || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chất liệu:</span>
                    <span className="text-slate-900">{product.material || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nhóm màu:</span>
                    <span className="text-slate-900">{product.colorFamily || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Giá thuê</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Giá tối thiểu:</span>
                    <span className="text-lg font-semibold" style={{ color: BRAND.blushRose }}>
                      {product.minPrice ? formatVND(product.minPrice) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Tiền đặt cọc:</span>
                    <span className="text-base font-semibold text-slate-900">
                      {formatVND(product.depositDefault || 0)}
                    </span>
                  </div>
                </div>

                {product.rentalTiers && product.rentalTiers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-semibold text-slate-600 mb-2">Các gói thuê:</h3>
                    <div className="space-y-2">
                      {product.rentalTiers.map((tier, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-600">{tier.label}</span>
                          <span className="font-medium text-slate-900">{formatVND(tier.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Variants */}
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">
                  Biến thể ({product.variants?.length || 0})
                </h2>

                {/* Sizes */}
                {sizes.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-slate-500 mb-2">Kích cỡ:</div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-1 rounded text-xs border border-slate-200 bg-slate-50 text-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {colors.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-500 mb-2">Màu sắc:</div>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-1 rounded text-xs border border-slate-200 bg-slate-50 text-slate-700"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variant List */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500 mb-2">Danh sách biến thể:</div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {product.variants.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">#{idx + 1}</span>
                          <span className="text-slate-700">{v.size}</span>
                          {v.color && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-700">{v.color}</span>
                            </>
                          )}
                          {v.skuHint && (
                            <span className="ml-auto font-mono text-slate-400 text-[10px]">
                              {v.skuHint}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-semibold text-slate-700 mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-semibold text-slate-700 mb-3">Mô tả</h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {product.notes && (
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-semibold text-slate-700 mb-3">Ghi chú</h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {product.notes}
                  </p>
                </div>
              )}

              {/* Care Instructions */}
              {product.care && (
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-semibold text-slate-700 mb-3">Hướng dẫn bảo quản</h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {product.care}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Metadata</h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày tạo:</span>
                    <span className="text-slate-700">
                      {new Date(product.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cập nhật lần cuối:</span>
                    <span className="text-slate-700">
                      {new Date(product.updatedAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
