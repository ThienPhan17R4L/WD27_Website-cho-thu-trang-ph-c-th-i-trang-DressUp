import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { useProduct } from "@/hooks/useProduct";
import { ProductGallery } from "@/components/products/ProductGallery";
import type { Variant } from "@/types/product";

const ACCENT = "rgb(213, 176, 160)";

function formatMoney(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function getPriceRange(prices: number[]) {
  if (!prices.length) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max)}`;
}

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export default function ProductDetailPage() {
  const { slug = "" } = useParams();
  const { data: product, isLoading, isError } = useProduct(slug);

  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");

  const sizes = useMemo(() => {
    if (!product?.variants?.length) return [];
    return unique(product.variants.map((v) => v.size)).filter(Boolean);
  }, [product?.variants]);

  const colors = useMemo(() => {
    if (!product?.variants?.length) return [];
    return unique(product.variants.map((v) => v.color).filter(Boolean) as string[]);
  }, [product?.variants]);

  const priceRange = useMemo(() => {
    if (!product?.rentalTiers?.length) return null;
    return getPriceRange(product.rentalTiers.map((t) => t.price));
  }, [product?.rentalTiers]);

  const pickedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants.find((v: Variant) => {
      const okSize = size ? v.size === size : true;
      const okColor = color ? v.color === color : true;
      return okSize && okColor;
    }) ?? null;
  }, [product?.variants, size, color]);

  if (isLoading) {
    return (
      <Container>
        <div className="py-10 text-sm text-slate-500">Loading...</div>
      </Container>
    );
  }

  if (isError || !product) {
    return (
      <Container>
        <div className="py-10 text-sm text-rose-700">Load failed</div>
      </Container>
    );
  }

  return (
    <div className="bg-white">
      <Container>
        <div className="py-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            {/* Left: gallery */}
            <ProductGallery images={product.images} />

            {/* Right: details */}
            <div>
              <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                {product.name}
              </div>

              <div className="mt-3 text-[26px] font-semibold" style={{ color: ACCENT }}>
                {priceRange ?? "—"}
              </div>

              <p className="mt-6 max-w-prose text-[14px] leading-7 text-slate-600">
                {product.notes ??
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. (Bạn có thể map field notes/care từ API vào đây)."}
              </p>

              {/* Size */}
              <div className="mt-8">
                <div className="text-[13px] font-medium text-slate-700">Size</div>
                <div className="mt-2">
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-[#f6f3ef] px-5 py-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
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
                <div className="mt-3 flex gap-3">
                  {colors.length ? (
                    colors.map((c) => {
                      const active = c === color;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={[
                            "h-10 w-10",
                            "ring-2",
                            active ? "ring-[rgba(213,176,160,0.95)]" : "ring-slate-200",
                          ].join(" ")}
                          title={c}
                          style={{
                            backgroundColor: c.toLowerCase(), // nếu c là "Black/White/Pink"
                          }}
                        />
                      );
                    })
                  ) : (
                    <div className="text-sm text-slate-500">No colors</div>
                  )}
                </div>
              </div>

              {/* Rent controls */}
              <div className="mt-8 flex items-center gap-4">
                <div className="w-28 bg-[#f6f3ef] ring-1 ring-slate-200">
                  <input
                    type="number"
                    min={1}
                    defaultValue={1}
                    className="h-12 w-full bg-transparent px-4 text-sm outline-none"
                  />
                </div>

                <button
                  type="button"
                  className="h-12 px-10 text-[12px] font-semibold tracking-[0.22em] uppercase text-white"
                  style={{ backgroundColor: ACCENT }}
                  onClick={() => {
                    // demo: khách chỉ xem, bạn có thể sau này hook sang order/cart
                    console.log("rent", {
                      productId: product._id,
                      slug: product.slug,
                      size,
                      color,
                      pickedVariant,
                    });
                  }}
                >
                  Buy now
                </button>
              </div>

              <div className="mt-6 text-sm text-slate-500">
                {pickedVariant ? (
                  <span>
                    Selected: <span className="font-semibold text-slate-800">{pickedVariant.size}</span>
                    {pickedVariant.color ? (
                      <>
                        {" "}
                        / <span className="font-semibold text-slate-800">{pickedVariant.color}</span>
                      </>
                    ) : null}
                    {pickedVariant.skuHint ? (
                      <>
                        {" "}
                        · <span className="font-semibold text-slate-800">{pickedVariant.skuHint}</span>
                      </>
                    ) : null}
                  </span>
                ) : (
                  <span>Pick size/color to match a variant.</span>
                )}
              </div>

              {/* Care */}
              {product.care ? (
                <div className="mt-10">
                  <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                    Care
                  </div>
                  <p className="mt-3 whitespace-pre-line text-[14px] leading-7 text-slate-600">
                    {product.care}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
