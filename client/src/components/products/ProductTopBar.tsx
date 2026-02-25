const ACCENT = "rgb(213, 176, 160)";

export function ProductTopBar({
  sort,
  onSortChange,
  q,
  onSearchChange,
  onClearSearch,
}: {
  sort: string;
  onSortChange: (v: string) => void;
  q: string;
  onSearchChange: (v: string) => void;
  onClearSearch?: () => void;
}) {
  return (
    <div className="mb-8 bg-[#f6f3ef] px-6 py-5">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_260px_320px]">
        <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-600">
          Khám phá trang phục
        </div>

        {/* SORT */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-11 bg-white px-4 text-[12px] font-semibold tracking-[0.18em] uppercase ring-1 ring-slate-200 outline-none focus:ring-[rgba(213,176,160,0.6)]"
        >
          <option value="-createdAt">Mới nhất</option>
          <option value="createdAt">Cũ nhất</option>
          <option value="name">Tên A–Z</option>
          <option value="-name">Tên Z–A</option>
          <option value="price">Giá tăng dần</option>
          <option value="-price">Giá giảm dần</option>
        </select>

        {/* SEARCH */}
        <div className="relative">
          <input
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm trang phục"
            className="h-11 w-full bg-white pl-12 pr-12 text-[12px] tracking-[0.18em] ring-1 ring-slate-200 outline-none focus:ring-[rgba(213,176,160,0.6)]"
          />
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
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
          </span>

          {q.trim().length > 0 && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: ACCENT }}
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
