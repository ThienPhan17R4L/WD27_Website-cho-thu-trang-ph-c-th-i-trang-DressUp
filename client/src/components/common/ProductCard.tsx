import { Button } from "../common/Button";

export type ProductCardData = {
  id: string;
  name: string; // OCCASION DRESS
  imageSrc: string;
  fromPrice: number; // 120
  rating?: number; // 0..5
  href?: string;
};

function IconLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10.5 13.5 13.5 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 15a4 4 0 0 1 0-5.7l1.3-1.3a4 4 0 0 1 5.7 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 9a4 4 0 0 1 0 5.7l-1.3 1.3a4 4 0 0 1-5.7 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Stars({ value = 0 }: { value?: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(value));
  return (
    <div className="flex items-center justify-center gap-0.5">
      {stars.map((on, idx) => (
        <span
          key={idx}
          className={[
            "inline-block h-3 w-3",
            on ? "text-[#e6c1b3]" : "text-slate-200",
          ].join(" ")}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      <span className="sr-only">{value} stars</span>
    </div>
  );
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const goDetail = () => {
    if (product.href) window.location.href = product.href;
  };

  return (
    <div className="group">
      {/* Image box */}
      <div className="relative overflow-hidden bg-[#fbf7f4] border border-slate-100">
        <div className="aspect-[3/5] w-full">
          <img
            src={product.imageSrc}
            alt={product.name}
            className="h-full w-full object-contain p-8"
            loading="lazy"
          />
        </div>

        {/* CTA bar overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center">
          <div className="pointer-events-auto inline-flex items-stretch shadow-[0_12px_28px_rgba(15,23,42,0.12)] opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <button
              type="button"
              onClick={goDetail}
              aria-label="Open product"
              className="grid h-12 w-12 place-items-center bg-[#e6c1b3] text-white transition-colors hover:bg-[#d5b0a0] focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#fbf7f4]"
            >
              <IconLink className="h-5 w-5" />
            </button>

            <Button
              variant="heroSolid"
              className="h-12 rounded-none px-7"
              onClick={() => (window.location.href = "/rent")}
            >
              RENT A DRESS
            </Button>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="pt-6 text-center">
        <div className="text-[12px] font-semibold tracking-[0.18em] text-slate-800 uppercase">
          {product.name}
        </div>

        {typeof product.rating === "number" ? (
          <div className="mt-2">
            <Stars value={product.rating} />
          </div>
        ) : (
          <div className="mt-2 h-3" />
        )}

        <div className="mt-3 text-[12px] tracking-[0.12em] text-[#e6c1b3]">
          from{" "}
          <span className="font-serif text-[30px] leading-none tracking-tight">
            ${product.fromPrice}
          </span>
        </div>
      </div>
    </div>
  );
}
