const ACCENT_RING = "ring-[rgba(213,176,160,0.95)]";

// Map màu tên tiếng Việt/tiếng Anh → CSS color, trả về null nếu không nhận ra
function colorToCss(c: string): string | null {
  const s = c.trim().toLowerCase();
  if (["black", "đen", "den"].includes(s)) return "#111111";
  if (["white", "trắng", "trang", "trăng"].includes(s)) return "#f5f1ed";
  if (["pink", "hồng", "hong"].includes(s)) return "#f29bb2";
  if (["hot pink", "hồng đậm"].includes(s)) return "#e0609a";
  if (["beige", "kem"].includes(s)) return "#e9dbc9";
  if (["nude"].includes(s)) return "#e6c1b3";
  if (["red", "đỏ", "do"].includes(s)) return "#e05050";
  if (["dark red", "đỏ đô"].includes(s)) return "#8b1a1a";
  if (["blue", "xanh dương", "xanh da trời"].includes(s)) return "#4a7db5";
  if (["navy", "xanh navy", "navy blue"].includes(s)) return "#1c3557";
  if (["light blue", "xanh nhạt"].includes(s)) return "#8ab8e0";
  if (["green", "xanh lá", "xanh la", "xanh"].includes(s)) return "#5a9b6a";
  if (["dark green", "xanh lá đậm"].includes(s)) return "#2d6a3f";
  if (["yellow", "vàng", "vang"].includes(s)) return "#e8c84a";
  if (["mustard", "vàng mustard"].includes(s)) return "#c9a227";
  if (["purple", "tím", "tim"].includes(s)) return "#9c6bb5";
  if (["lavender", "tím lavender"].includes(s)) return "#c8a8d8";
  if (["brown", "nâu", "nau"].includes(s)) return "#8b5e3c";
  if (["caramel", "nâu caramel"].includes(s)) return "#c68642";
  if (["gray", "grey", "xám", "xam"].includes(s)) return "#8b8b8b";
  if (["light gray", "xám nhạt"].includes(s)) return "#c0c0c0";
  if (["charcoal", "xám than"].includes(s)) return "#404040";
  if (["orange", "cam"].includes(s)) return "#e8844a";
  if (["coral"].includes(s)) return "#ff6b6b";
  if (["cream"].includes(s)) return "#f5f0e8";
  if (["mint", "xanh mint"].includes(s)) return "#98d8c8";
  if (["silver", "bạc", "bac"].includes(s)) return "#c0c0c0";
  if (["gold", "vàng gold"].includes(s)) return "#d4af37";
  if (["rose gold", "vàng hồng"].includes(s)) return "#e8b4a0";
  if (["burgundy", "đỏ rượu"].includes(s)) return "#722f37";
  if (["olive", "xanh olive"].includes(s)) return "#808000";
  if (["teal", "xanh mòng két"].includes(s)) return "#2a9d8f";
  if (["ivory", "ngà"].includes(s)) return "#fffff0";
  if (["champagne"].includes(s)) return "#f7e7ce";
  // Nếu đã là mã hex hoặc rgb thì dùng trực tiếp
  if (/^#[0-9a-fA-F]{3,8}$/.test(c) || /^rgba?\(/.test(c)) return c;
  // Không nhận ra → dùng text badge
  return null;
}

// Kiểm tra màu sáng hay tối để chọn màu checkmark phù hợp
function isLightColor(hex: string): boolean {
  if (!hex.startsWith("#")) return true;
  const h = hex.replace("#", "");
  const rgb =
    h.length === 3
      ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminance > 0.6;
}

export function ColorSwatches({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  if (!colors?.length) return <div className="text-sm text-slate-500">Không có màu</div>;

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((c) => {
        const active = c === value;
        const css = colorToCss(c);

        if (css) {
          // Màu hợp lệ → hiển thị ô màu vuông có checkmark khi được chọn
          const light = isLightColor(css);
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              title={c}
              aria-label={c}
              className={[
                "h-10 w-10 ring-2 transition-all flex items-center justify-center",
                active ? ACCENT_RING : "ring-slate-200 hover:ring-slate-300",
              ].join(" ")}
              style={{ backgroundColor: css, outline: "none" }}
            >
              {active && (
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M4 10l4 4 8-8"
                    stroke={light ? "#5a4038" : "#fff"}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        }

        // Màu không nhận ra → hiển thị text badge
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            title={c}
            aria-label={c}
            className={[
              "h-10 px-3 text-[11px] font-medium ring-2 transition-all",
              active
                ? `bg-[rgba(213,176,160,0.15)] text-[rgb(90,64,56)] ${ACCENT_RING}`
                : "bg-[#f7f3ef] text-slate-700 ring-slate-200 hover:ring-slate-300",
            ].join(" ")}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
