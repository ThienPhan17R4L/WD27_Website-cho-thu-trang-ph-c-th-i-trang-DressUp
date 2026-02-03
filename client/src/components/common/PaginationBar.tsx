import React from "react";

const ACCENT = "rgb(213, 176, 160)";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

function rangePages(page: number, total: number) {
  // Hiển thị tối đa 5 nút: [1] ... [p-1][p][p+1] ... [total]
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  if (page <= 3) return [1, 2, 3, 4, 5];
  if (page >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];

  return [page - 2, page - 1, page, page + 1, page + 2];
}

export function PaginationBar({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = rangePages(page, totalPages);
  const canNext = page < totalPages;

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      {pages.map((p) => {
        const active = p === page;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={[
              "h-10 w-10",
              "text-[12px] font-semibold tracking-[0.18em] uppercase",
              "ring-1 ring-slate-200",
              "transition",
            ].join(" ")}
            style={
              active
                ? { backgroundColor: ACCENT, color: "white", borderColor: "transparent" }
                : { backgroundColor: "#f6f3ef", color: "#7a7a7a" }
            }
          >
            {p}
          </button>
        );
      })}

      {/* Arrow next giống ảnh */}
      <button
        type="button"
        disabled={!canNext}
        onClick={() => onChange(page + 1)}
        className={[
          "h-10 w-10",
          "ring-1 ring-slate-200",
          "bg-[#f6f3ef]",
          "flex items-center justify-center",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "transition",
        ].join(" ")}
        aria-label="Next page"
      >
        <span className="text-slate-500">→</span>
      </button>
    </div>
  );
}
