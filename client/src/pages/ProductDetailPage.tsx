import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { useProduct } from "@/hooks/useProduct";
import { ProductGallery } from "@/components/products/ProductGallery";
import { QuantityStepper } from "@/components/products/QuantityStepper";
import { ColorSwatches } from "@/components/products/ColorSwatches";
import { ProductTabs } from "@/components/products/ProductTabs";
import { useAddToCart } from "@/hooks/useCart";
import type { Variant, RentalTier } from "@/types/product";
import { formatVND } from "@/utils/formatCurrency";
import { validateRentalDates } from "@/utils/dateValidation";

const ACCENT = "rgb(213, 176, 160)";

function getPriceRange(prices: number[]) {
  if (!prices.length) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
}

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function toISODate(d: string) {
  // accept YYYY-MM-DD; keep as-is (backend của bạn parse được)
  return d;
}

export default function ProductDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug);

  const addToCart = useAddToCart();

  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");

  const [start, setStart] = useState<string>(""); // YYYY-MM-DD
  const [end, setEnd] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");

  const [qty, setQty] = useState<number>(1);
  const [cartMsg, setCartMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [rentNowPending, setRentNowPending] = useState(false);

  // Real-time date validation
  useEffect(() => {
    if (start && end) {
      const validation = validateRentalDates(start, end);
      setDateError(validation.error || "");
    } else {
      setDateError("");
    }
  }, [start, end]);

  const sizes = useMemo(() => {
    if (!product?.variants?.length) return [];
    return unique(product.variants.map((v: any) => v.size)).filter(Boolean);
  }, [product?.variants]);

  const colors = useMemo(() => {
    if (!product?.variants?.length) return [];
    return unique(product.variants.map((v: any) => v.color).filter(Boolean) as string[]);
  }, [product?.variants]);

  const priceRange = useMemo(() => {
    // bạn đang có rentalTiers, giữ nguyên
    if (!product?.rentalTiers?.length) return null;
    return getPriceRange(product.rentalTiers.map((t: any) => t.price));
  }, [product?.rentalTiers]);

  const pickedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return (
      product.variants.find((v: Variant) => {
        const okSize = size ? v.size === size : true;
        const okColor = color ? v.color === color : true;
        return okSize && okColor;
      }) ?? null
    );
  }, [product?.variants, size, color]);


  if (isLoading) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32 text-sm text-slate-500">Đang tải...</div>
      </Container>
    );
  }

  if (isError || !product) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32 text-sm text-rose-700">Tải thất bại</div>
      </Container>
    );
  }

  return (
    <div className="bg-white">
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
            {/* Left: gallery */}
            <ProductGallery images={product.images} />

            {/* Right: details */}
            <div className="max-w-[520px]">
              <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                {product.name}
              </div>

              <div className="mt-3 text-[26px] font-semibold" style={{ color: ACCENT }}>
                {priceRange ?? "—"}
              </div>

              <div className="mt-6 space-y-5 text-[14px] leading-7 text-slate-600">
                <p>
                  {product.notes ??
                    "Lorem ipsum dolor sit amet, populo doming ne duo, pro in soleat persius corpora..."}
                </p>

                {/* block thông số như ảnh */}
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-slate-800">NGỰC:</span>{" "}
                    Phù hợp mọi số đo ngực – thoải mái ở phần ngực
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">EO:</span>{" "}
                    Ôm sát – váy ôm sát eo tự nhiên
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">HÔNG:</span> Vừa vặn – chất liệu co giãn ở hông
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">CHIỀU DÀI:</span> Dài đến gối – (trên người mẫu cao 1m68)
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="mt-8">
                <div className="text-[13px] font-medium text-slate-700">Size</div>
                <div className="mt-2">
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  >
                    <option value="">Chọn tùy chọn</option>
                    {sizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color */}
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <div className="text-[13px] font-medium text-slate-700">Màu sắc</div>
                  {color && (
                    <div className="text-[13px] text-slate-500">
                      — <span className="font-medium text-slate-800">{color}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <ColorSwatches colors={colors} value={color} onChange={setColor} />
                </div>
              </div>

              {/* Rental Tier Suggestions */}
              {product.rentalTiers && product.rentalTiers.length > 0 && (
                <div className="mt-7">
                  <div className="text-[13px] font-medium text-slate-700">Tùy chọn thuê nhanh</div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {product.rentalTiers.map((tier: RentalTier) => (
                      <button
                        key={tier.days}
                        type="button"
                        className="h-auto px-5 py-3 text-left ring-1 ring-slate-200 hover:ring-[rgba(213,176,160,0.8)] hover:bg-[rgba(213,176,160,0.05)] transition-all"
                        onClick={() => {
                          const today = new Date();
                          const endDate = new Date(today);
                          endDate.setDate(today.getDate() + tier.days);

                          const formatDate = (d: Date) => {
                            const year = d.getFullYear();
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const day = String(d.getDate()).padStart(2, "0");
                            return `${year}-${month}-${day}`;
                          };

                          setStart(formatDate(today));
                          setEnd(formatDate(endDate));
                        }}
                      >
                        <div className="text-sm font-semibold text-slate-900">{tier.label}</div>
                        <div className="mt-1 text-xs text-slate-500">{formatVND(tier.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Start/End giống ảnh */}
              <div className="mt-7">
                <div className="text-[13px] font-medium text-slate-700 mb-3">
                  Hoặc chọn ngày tùy chỉnh <span className="text-red-600">*</span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <div className="text-[13px] font-medium text-slate-700">
                    Ngày bắt đầu <span className="text-red-600">*</span>
                  </div>
                  <input
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="Chọn ngày bắt đầu"
                    type="date"
                    required
                    className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-700">
                    Ngày kết thúc <span className="text-red-600">*</span>
                  </div>
                  <input
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    placeholder="Chọn ngày kết thúc"
                    type="date"
                    required
                    className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>
              </div>
              {dateError && (
                <div className="mt-2 text-xs text-red-600">
                  {dateError}
                </div>
              )}
              {!start || !end ? (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  ⚠️ Vui lòng chọn ngày thuê trước khi thêm vào giỏ hàng
                </div>
              ) : null}
              </div>

              {/* Rental Price Info */}
              {product.rentalTiers && product.rentalTiers.length > 0 && (
                <div className="mt-7 p-5 bg-[#f6f3ef] ring-1 ring-slate-100">
                  <div className="text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium">Giá thuê từ</span>
                      <span className="text-[24px] font-semibold" style={{ color: ACCENT }}>
                        {formatVND(product.minPrice || Math.min(...product.rentalTiers.map((t: RentalTier) => t.price)))}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Tiền đặt cọc</span>
                      <span className="font-semibold text-slate-700">
                        {formatVND(product.depositDefault || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Qty + Add to Cart */}
              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <QuantityStepper value={qty} onChange={setQty} />

                  <button
                    type="button"
                    className={[
                      "h-12 px-10 text-[12px] font-semibold tracking-[0.22em] uppercase",
                      "ring-1 ring-[rgba(213,176,160,0.45)]",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    ].join(" ")}
                    style={{ backgroundColor: "rgba(213,176,160,0.28)", color: "rgba(15,23,42,0.55)" }}
                    disabled={!pickedVariant || !start || !end || addToCart.isPending || rentNowPending}
                    onClick={() => {
                      setCartMsg(null);

                      if (!pickedVariant) {
                        setCartMsg({ type: "error", text: "Vui lòng chọn size và màu sắc" });
                        return;
                      }

                      if (!start || !end) {
                        setCartMsg({ type: "error", text: "Vui lòng chọn ngày bắt đầu và kết thúc thuê" });
                        return;
                      }

                      const validation = validateRentalDates(start, end);
                      if (!validation.isValid) {
                        setCartMsg({ type: "error", text: validation.error! });
                        return;
                      }

                      addToCart.mutate(
                        {
                          productId: product._id,
                          rentalStart: toISODate(start),
                          rentalEnd: toISODate(end),
                          variant: {
                            size: (pickedVariant as any).size,
                            color: (pickedVariant as any).color,
                          },
                          quantity: qty,
                        },
                        {
                          onSuccess: () => {
                            setCartMsg({ type: "success", text: "Đã thêm vào giỏ hàng thành công!" });
                          },
                          onError: (error: any) => {
                            setCartMsg({ type: "error", text: error.response?.data?.message || "Không thể thêm vào giỏ hàng" });
                          },
                        }
                      );
                    }}
                  >
                    {addToCart.isPending ? "ĐANG THÊM..." : "THÊM VÀO GIỎ"}
                  </button>

                  {/* Thuê ngay — add to cart then go directly to checkout */}
                  <button
                    type="button"
                    className={[
                      "h-12 px-10 text-[12px] font-semibold tracking-[0.22em] uppercase text-white",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    ].join(" ")}
                    style={{ backgroundColor: ACCENT }}
                    disabled={!pickedVariant || !start || !end || addToCart.isPending || rentNowPending}
                    onClick={async () => {
                      setCartMsg(null);

                      if (!pickedVariant) {
                        setCartMsg({ type: "error", text: "Vui lòng chọn size và màu sắc" });
                        return;
                      }

                      if (!start || !end) {
                        setCartMsg({ type: "error", text: "Vui lòng chọn ngày bắt đầu và kết thúc thuê" });
                        return;
                      }

                      const validation = validateRentalDates(start, end);
                      if (!validation.isValid) {
                        setCartMsg({ type: "error", text: validation.error! });
                        return;
                      }

                      try {
                        setRentNowPending(true);
                        const updatedCart = await addToCart.mutateAsync({
                          productId: product._id,
                          rentalStart: toISODate(start),
                          rentalEnd: toISODate(end),
                          variant: {
                            size: (pickedVariant as any).size,
                            color: (pickedVariant as any).color,
                          },
                          quantity: qty,
                        });

                        // Find the newly added item by matching product + variant + dates
                        const newItem = updatedCart?.items?.find((it: any) => {
                          const sameProduct = it.productId === product._id || it.productId?._id === product._id;
                          const sameSize = it.variant?.size === (pickedVariant as any).size;
                          const sameColor = (it.variant?.color || "") === ((pickedVariant as any).color || "");
                          return sameProduct && sameSize && sameColor;
                        });

                        if (newItem?._id) {
                          sessionStorage.setItem("checkout_item_ids", JSON.stringify([newItem._id]));
                        } else {
                          sessionStorage.removeItem("checkout_item_ids");
                        }

                        navigate("/checkout");
                      } catch (error: any) {
                        setCartMsg({ type: "error", text: error.response?.data?.message || "Không thể xử lý. Vui lòng thử lại." });
                      } finally {
                        setRentNowPending(false);
                      }
                    }}
                  >
                    {rentNowPending ? "ĐANG XỬ LÝ..." : "THUÊ NGAY"}
                  </button>
                </div>

                {/* Inline cart feedback — ngay bên dưới nút */}
                {cartMsg && (
                  <div
                    className={`mt-3 flex items-center gap-2 rounded px-4 py-2.5 text-sm font-medium ${
                      cartMsg.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    <span>{cartMsg.type === "success" ? "✓" : "✕"}</span>
                    <span>{cartMsg.text}</span>
                  </div>
                )}
              </div>

              {/* wishlist */}
              <div className="mt-6 flex items-center gap-2 text-[13px]" style={{ color: "rgba(213,176,160,0.95)" }}>
                <span aria-hidden="true">♡</span>
                <button type="button" className="hover:underline">
                  Thêm vào yêu thích
                </button>
              </div>

              {/* helper */}
              <div className="mt-6 text-sm text-slate-500">
                {pickedVariant ? (
                  <span>
                    Đã chọn:{" "}
                    <span className="font-semibold text-slate-800">{(pickedVariant as any).size}</span>
                    {(pickedVariant as any).color ? (
                      <>
                        {" "}
                        / <span className="font-semibold text-slate-800">{(pickedVariant as any).color}</span>
                      </>
                    ) : null}
                  </span>
                ) : (
                  <span>Chọn size/màu để phù hợp với biến thể.</span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs section giống ảnh */}
          <ProductTabs
            description={product.description ?? product.notes}
          />
        </div>
      </Container>
    </div>
  );
}
