import { Link } from "react-router-dom";
import type { Product } from "@/types/product";

const ACCENT = "rgb(213, 176, 160)";

function formatMoney(v: number) {
  // bạn có thể đổi sang VND nếu muốn
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function getFromPrice(p: Product) {
  if (!p.rentalTiers?.length) return null;
  return Math.min(...p.rentalTiers.map((t) => t.price));
}

export function ProductCard({ product }: { product: Product }) {
  const cover = product.images?.[0] ?? "";
  const from = getFromPrice(product);

  return (
    <div className="group">
      <div
        className={[
          "relative overflow-hidden",
          "bg-[#f6f3ef]", // nền be giống ảnh
          "aspect-[4/5]",
          "flex items-center justify-center",
        ].join(" ")}
      >
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
        <div
          className={[
            "pointer-events-none absolute inset-0",
            "flex items-center justify-center",
            "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          ].join(" ")}
        >
          <div className="pointer-events-auto inline-flex items-center">
            <span
              className="inline-flex h-12 w-12 items-center justify-center"
              style={{ backgroundColor: ACCENT }}
            >
              {/* link icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="h-5 w-5 text-white"
              >
                <path
                  d="M10 13a5 5 0 0 0 7.1 0l1.9-1.9a5 5 0 0 0-7.1-7.1L10.9 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M14 11a5 5 0 0 0-7.1 0L5 12.9A5 5 0 1 0 12.1 20L13 19.1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <Link
              to={`/products/${product.slug}`}
              className={[
                "h-12 px-6",
                "inline-flex items-center justify-center",
                "text-[12px] font-semibold tracking-[0.22em] uppercase",
                "text-white",
              ].join(" ")}
              style={{ backgroundColor: ACCENT }}
            >
              Rent a dress
            </Link>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="pt-5 text-center">
        <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
          {product.name}
        </div>

        <div className="mt-2 text-[12px] tracking-[0.1em] text-slate-400">
          from{" "}
          <span className="text-[22px] font-semibold" style={{ color: ACCENT }}>
            {from != null ? formatMoney(from) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
