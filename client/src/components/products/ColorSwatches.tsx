const ACCENT_RING = "ring-[rgba(213,176,160,0.95)]";

// map tên màu -> màu hiển thị
function colorToCss(c: string) {
  const s = c.trim().toLowerCase();
  if (["black", "đen", "den"].includes(s)) return "#111";
  if (["white", "trắng", "trang"].includes(s)) return "#f7f2ee";
  if (["pink", "hồng", "hong"].includes(s)) return "#f29bb2";
  if (["beige", "kem"].includes(s)) return "#e9dbc9";
  if (["nude"].includes(s)) return "#e6c1b3";
  // fallback: nếu API trả "#ff00aa" hoặc "rgb(...)"
  return c;
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
  if (!colors?.length) return <div className="text-sm text-slate-500">No colors</div>;

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((c) => {
        const active = c === value;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={[
              "h-10 w-10",
              "ring-2",
              active ? ACCENT_RING : "ring-slate-200",
              "transition",
            ].join(" ")}
            title={c}
            aria-label={c}
            style={{ backgroundColor: colorToCss(c) }}
          />
        );
      })}
    </div>
  );
}
