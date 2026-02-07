import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { useNotification } from "@/contexts/NotificationContext";

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
  const { data: product, isLoading, isError } = useProduct(slug);

  const addToCart = useAddToCart();
  const { showNotification } = useNotification();

  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");

  const [start, setStart] = useState<string>(""); // YYYY-MM-DD
  const [end, setEnd] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");

  const [qty, setQty] = useState<number>(1);

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

  // Nếu bạn có field pricePerDay theo variant/tier, render "xxx / day" giống ảnh
  const pricePerDay = useMemo(() => {
    // ưu tiên variant nếu có
    const v: any = pickedVariant as any;
    if (v?.pricePerDay) return v.pricePerDay;
    // fallback lấy tier 1 ngày (nếu bạn có)
    const t = product?.rentalTiers?.find?.((x: any) => x.days === 1);
    return t?.price ?? null;
  }, [pickedVariant, product?.rentalTiers]);

  if (isLoading) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32 text-sm text-slate-500">Loading...</div>
      </Container>
    );
  }

  if (isError || !product) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32 text-sm text-rose-700">Load failed</div>
      </Container>
    );
  }

  return (
    <div className="bg-white">
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
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
                    <span className="font-semibold text-slate-800">BUST:</span>{" "}
                    Great for any cup size – comfortable room at bust
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">WAIST:</span>{" "}
                    Very Fitted – dress very fitted at natural waist
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">HIPS:</span> Fitted – stretchy fabric at hips
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">LENGTH:</span> Knee length – (on a 5'6" model)
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
                    <option value="">Choose an option</option>
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
                <div className="text-[13px] font-medium text-slate-700">Color</div>
                <div className="mt-3">
                  <ColorSwatches colors={colors} value={color} onChange={setColor} />
                </div>
              </div>

              {/* Rental Tier Suggestions */}
              {product.rentalTiers && product.rentalTiers.length > 0 && (
                <div className="mt-7">
                  <div className="text-[13px] font-medium text-slate-700">Quick Rental Options</div>
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
                <div className="text-[13px] font-medium text-slate-700 mb-3">Or choose custom dates</div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <div className="text-[13px] font-medium text-slate-700">Start</div>
                  <input
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="Start"
                    type="date"
                    className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-slate-700">End</div>
                  <input
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    placeholder="End"
                    type="date"
                    className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>
              </div>
              {dateError && (
                <div className="mt-2 text-xs text-red-600">
                  {dateError}
                </div>
              )}
              </div>

              {/* Rental Price Info */}
              {product.rentalTiers && product.rentalTiers.length > 0 && (
                <div className="mt-7 p-5 bg-[#f6f3ef] ring-1 ring-slate-100">
                  <div className="text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium">Rental from</span>
                      <span className="text-[24px] font-semibold" style={{ color: ACCENT }}>
                        {formatVND(product.minPrice || Math.min(...product.rentalTiers.map((t: RentalTier) => t.price)))}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Security Deposit</span>
                      <span className="font-semibold text-slate-700">
                        {formatVND(product.depositDefault || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Qty + Buy */}
              <div className="mt-6 flex items-center gap-4">
                <QuantityStepper value={qty} onChange={setQty} />

                <button
                  type="button"
                  className={[
                    "h-12 px-10 text-[12px] font-semibold tracking-[0.22em] uppercase",
                    "ring-1 ring-[rgba(213,176,160,0.45)]",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  ].join(" ")}
                  style={{ backgroundColor: "rgba(213,176,160,0.28)", color: "rgba(15,23,42,0.55)" }}
                  disabled={!pickedVariant || !start || !end || addToCart.isPending}
                  onClick={() => {
                    if (!pickedVariant) return;

                    // Validate dates before adding to cart
                    const validation = validateRentalDates(start, end);
                    if (!validation.isValid) {
                      showNotification("error", validation.error!);
                      return;
                    }

                    addToCart.mutate({
                      productId: product._id,
                      rentalStart: toISODate(start),
                      rentalEnd: toISODate(end),
                      variant: {
                        size: (pickedVariant as any).size,
                        color: (pickedVariant as any).color,
                      },
                      quantity: qty,
                    });
                  }}
                >
                  {addToCart.isPending ? "ADDING..." : "BUY NOW"}
                </button>
              </div>

              {/* wishlist giống ảnh */}
              <div className="mt-6 flex items-center gap-2 text-[13px]" style={{ color: "rgba(213,176,160,0.95)" }}>
                <span aria-hidden="true">♡</span>
                <button type="button" className="hover:underline">
                  Add to Wishlist
                </button>
              </div>

              {/* helper */}
              <div className="mt-6 text-sm text-slate-500">
                {pickedVariant ? (
                  <span>
                    Selected:{" "}
                    <span className="font-semibold text-slate-800">{(pickedVariant as any).size}</span>
                    {(pickedVariant as any).color ? (
                      <>
                        {" "}
                        / <span className="font-semibold text-slate-800">{(pickedVariant as any).color}</span>
                      </>
                    ) : null}
                  </span>
                ) : (
                  <span>Pick size/color to match a variant.</span>
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
