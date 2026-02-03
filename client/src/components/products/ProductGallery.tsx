import { useMemo, useState } from "react";

export function ProductGallery({ images }: { images: string[] }) {
  const list = useMemo(() => (images?.length ? images : [""]), [images]);
  const [active, setActive] = useState(0);
  const main = list[active] ?? "";

  return (
    <div>
      <div className="relative bg-[#f6f3ef]">
        <div className="aspect-[4/5] w-full">
          {main ? (
            <img src={main} alt="" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}
        </div>

        {/* icon zoom (decor) */}
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow"
          aria-label="Zoom"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M16.6 16.6 21 21"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4">
        {list.slice(0, 8).map((src, idx) => (
          <button
            key={`${src}-${idx}`}
            type="button"
            onClick={() => setActive(idx)}
            className={[
              "aspect-square bg-[#f6f3ef] p-2",
              idx === active ? "ring-2 ring-[rgba(213,176,160,0.9)]" : "ring-1 ring-slate-200",
            ].join(" ")}
          >
            {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
