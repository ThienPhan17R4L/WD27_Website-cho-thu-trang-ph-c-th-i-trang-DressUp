import { useMemo, useState } from "react";

const ACCENT_RING = "ring-[rgba(213,176,160,0.95)]";

export function ProductGallery({ images }: { images: string[] }) {
  const list = useMemo(() => (images?.length ? images : [""]), [images]);
  const [active, setActive] = useState(0);
  const main = list[active] ?? "";

  return (
    <div className="w-full">
      <div className="relative overflow-hidden bg-[#f6f3ef]">
        <div className="aspect-[4/5] w-full">
          {main ? (
            <img
              src={main}
              alt=""
              className="h-full w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}
        </div>

        {/* zoom icon (decor) */}
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm ring-1 ring-black/5"
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

      {/* thumbs giống ảnh: 3-4 thumb dưới */}
      <div className="mt-6 grid grid-cols-3 gap-5 sm:grid-cols-4">
        {list.slice(0, 8).map((src, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              className={[
                "relative aspect-[1/1] overflow-hidden bg-[#f6f3ef]",
                "ring-1 ring-slate-200",
                isActive ? `ring-2 ${ACCENT_RING}` : "",
              ].join(" ")}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
