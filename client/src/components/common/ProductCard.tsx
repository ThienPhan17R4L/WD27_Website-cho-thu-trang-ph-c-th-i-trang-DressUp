import { Link } from "react-router-dom";
import type { Product } from "@/types/product";
import { formatVND } from "@/utils/formatCurrency";

const ACCENT = "rgb(213, 176, 160)";

const CONDITION_LABELS: Record<string, string> = {
  new: "Mới",
  "like-new": "Như mới",
  good: "Tốt",
};

// Map color name → CSS color
function colorToCss(c: string): string | null {
  const s = c.trim().toLowerCase();
  if (["black", "đen", "den"].includes(s)) return "#111";
  if (["white", "trắng", "trang"].includes(s)) return "#f0ece8";
  if (["pink", "hồng", "hong"].includes(s)) return "#f29bb2";
  if (["beige", "kem"].includes(s)) return "#e9dbc9";
  if (["nude"].includes(s)) return "#e6c1b3";
  if (["red", "đỏ", "do"].includes(s)) return "#e05050";
  if (["blue", "xanh dương", "xanh da trời", "navy"].includes(s)) return "#4a7db5";
  if (["green", "xanh lá", "xanh la", "xanh"].includes(s)) return "#5a9b6a";
  if (["yellow", "vàng", "vang"].includes(s)) return "#e8c84a";
  if (["purple", "tím", "tim"].includes(s)) return "#9c6bb5";
  if (["brown", "nâu", "nau"].includes(s)) return "#8b5e3c";
  if (["gray", "grey", "xám", "xam"].includes(s)) return "#8b8b8b";
  if (["orange", "cam"].includes(s)) return "#e8844a";
  if (["cream"].includes(s)) return "#f5f0e8";
  if (["coral"].includes(s)) return "#ff6b6b";
  if (["lavender"].includes(s)) return "#c8a8d8";
  if (["mint"].includes(s)) return "#98d8c8";
  if (["silver", "bạc", "bac"].includes(s)) return "#c0c0c0";
  if (["gold", "vàng gold"].includes(s)) return "#d4af37";
  if (/^#[0-9a-fA-F]{3,8}$/.test(c) || /^rgb\(/.test(c)) return c;
  return null;
}

function getFromPrice(p: Product): number | null {
  if (p.minPrice !== undefined && p.minPrice !== null) return p.minPrice;
  if (!p.rentalTiers?.length) return null;
  return Math.min(...p.rentalTiers.map((t) => t.price));
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function ProductCard({ product }: { product: Product }) {
  const cover = product.images?.[0] ?? "";
  const from = getFromPrice(product);
  const sizes = unique(product.variants?.map((v) => v.size).filter(Boolean) ?? []);
  const colors = unique(product.variants?.map((v) => v.color).filter(Boolean) as string[] ?? []);

  return (
    <div className="group">
      {/* Image */}
      <div className="relative overflow-hidden bg-[#f6f3ef] aspect-[4/5] flex items-center justify-center">
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            className="h-[92%] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="text-sm text-slate-400">No image</div>
        )}

        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="pointer-events-auto inline-flex items-center">
            <span
              className="inline-flex h-12 w-12 items-center justify-center"
              style={{ backgroundColor: ACCENT }}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-white">
                <path d="M10 13a5 5 0 0 0 7.1 0l1.9-1.9a5 5 0 0 0-7.1-7.1L10.9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 11a5 5 0 0 0-7.1 0L5 12.9A5 5 0 1 0 12.1 20L13 19.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <Link
              to={`/products/${product.slug}`}
              className="h-12 px-6 inline-flex items-center justify-center text-[12px] font-semibold tracking-[0.22em] uppercase text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Rent a dress
            </Link>
          </div>
        </div>

        {/* Condition badge */}
        {product.condition && (
          <div className="absolute top-2 left-2">
            <span
              className="rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wide"
              style={{ background: "rgba(247,243,239,0.92)", color: "rgb(90,64,56)" }}
            >
              {CONDITION_LABELS[product.condition] ?? product.condition}
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="pt-4 text-center">
        {/* Brand */}
        {product.brand && (
          <div className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: ACCENT }}>
            {product.brand}
          </div>
        )}

        <div className="text-[12px] font-semibold tracking-[0.18em] uppercase text-slate-900">
          {product.name}
        </div>

        {/* Color dots */}
        {colors.length > 0 && (
          <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
            {colors.slice(0, 6).map((c) => {
              const css = colorToCss(c);
              return css ? (
                <span
                  key={c}
                  title={c}
                  className="h-3 w-3 rounded-full border border-slate-200 inline-block shrink-0"
                  style={{ backgroundColor: css }}
                />
              ) : (
                <span key={c} className="text-[9px] rounded px-1 border border-slate-200 text-slate-500">
                  {c}
                </span>
              );
            })}
            {colors.length > 6 && (
              <span className="text-[10px] text-slate-400">+{colors.length - 6}</span>
            )}
          </div>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="mt-1.5 flex items-center justify-center gap-1 flex-wrap">
            {sizes.slice(0, 5).map((s) => (
              <span key={s} className="text-[10px] rounded-sm px-1 border border-slate-200 text-slate-500">
                {s}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className="text-[10px] text-slate-400">+{sizes.length - 5}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-2 text-[12px] tracking-[0.1em] text-slate-400">
          from{" "}
          <span className="text-[20px] font-semibold" style={{ color: ACCENT }}>
            {from != null ? formatVND(from) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
