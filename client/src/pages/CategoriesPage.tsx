import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCategoryTree } from "@/hooks/useCategories";
import type { CategoryWithChildren } from "@/types/category";

// DressUp brand palette — shared across editorial pages
export const BRAND = {
  cream: "#f7f3ef",
  creamDark: "#f0e6de",
  blushRose: "rgb(213, 176, 160)",
  blushRoseDark: "rgb(190, 148, 130)",
  warmBrown: "#5a4038",
  mutedText: "#9b8f8a",
  lightBorder: "rgba(155, 143, 138, 0.25)",
  darkNavy: "#1c2b3a", // kept for other pages
};

const GRAD = [
  "linear-gradient(145deg, #e2cfc8 0%, #f0e4e0 100%)",
  "linear-gradient(145deg, #d8d0c8 0%, #ece6e0 100%)",
  "linear-gradient(145deg, #dccec8 0%, #ede4e0 100%)",
  "linear-gradient(145deg, #c8d0d4 0%, #e0e8ec 100%)",
  "linear-gradient(145deg, #d4c8d4 0%, #ece0ec 100%)",
  "linear-gradient(145deg, #d0d4c8 0%, #e8ece0 100%)",
];

// ── Shared sub-sections (identical design for both card orientations) ──────────

function ImageSection({
  cat,
  isHovered,
  gradIdx,
  style,
}: {
  cat: CategoryWithChildren;
  isHovered: boolean;
  gradIdx: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "relative", overflow: "hidden", minWidth: 0, minHeight: 0, ...style }}>
      {cat.image ? (
        <img
          src={cat.image}
          alt={cat.name}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: isHovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: GRAD[gradIdx % GRAD.length],
            transform: isHovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        />
      )}
      {/* Warm overlay on hover — no text, just darkening + zoom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(90, 64, 56, 0.38)",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      />
      {/* Bottom name label (fades out on hover) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "28px 20px 16px",
          background: "linear-gradient(to top, rgba(90,64,56,0.55) 0%, transparent 100%)",
          opacity: isHovered ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        <p
          style={{
            fontSize: "clamp(13px, 1.3vw, 16px)",
            color: "#fff",
            margin: 0,
            letterSpacing: "0.02em",
            fontWeight: 500,
          }}
        >
          {cat.name}
        </p>
      </div>
    </div>
  );
}

function TextSection({
  cat,
  isHovered,
  style,
}: {
  cat: CategoryWithChildren;
  isHovered: boolean;
  style?: React.CSSProperties;
}) {
  const subCount = (cat.children || []).length;
  return (
    <div
      style={{
        background: isHovered ? BRAND.blushRose : BRAND.cream,
        transition: "background 0.4s ease",
        display: "flex",
        flexDirection: "column",
        // main content centered, LEARN MORE anchored at bottom
        justifyContent: "space-between",
        alignItems: "center",
        textAlign: "center",
        padding: "clamp(18px, 3.5%, 36px) clamp(16px, 4%, 32px)",
        boxSizing: "border-box",
        minWidth: 0,
        minHeight: 0,
        ...style,
      }}
    >
      {/* Top spacer — empty div to push middle content to center */}
      <div style={{ flex: 1 }} />

      {/* Center: sub-count, heading, description */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {subCount > 0 && (
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: isHovered ? "rgba(255,255,255,0.6)" : BRAND.mutedText,
              transition: "color 0.4s ease",
              margin: 0,
            }}
          >
            {subCount} phong cách
          </p>
        )}

        <h2
          style={{
            fontSize: "clamp(17px, 1.8vw, 26px)",
            fontWeight: 600,
            color: isHovered ? "#fff" : BRAND.warmBrown,
            lineHeight: 1.25,
            margin: 0,
            transition: "color 0.4s ease",
            letterSpacing: "-0.01em",
          }}
        >
          {cat.name}
        </h2>

        {cat.description && (
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.65,
              color: isHovered ? "rgba(255,255,255,0.78)" : BRAND.mutedText,
              transition: "color 0.4s ease",
              margin: 0,
              maxWidth: 240,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {cat.description}
          </p>
        )}
      </div>

      {/* Bottom spacer — same as top, to balance centering */}
      <div style={{ flex: 1 }} />

      {/* LEARN MORE — anchored at bottom, always aligned across both cards in row */}
      <span
        style={{
          display: "inline-block",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: isHovered ? "#fff" : BRAND.blushRoseDark,
          transition: "color 0.4s ease",
          // no underline
        }}
      >
        LEARN MORE →
      </span>
    </div>
  );
}

// ── Card orientations ─────────────────────────────────────────────────────────

type CardProps = {
  cat: CategoryWithChildren;
  gradIdx: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
};

/**
 * dọc: image top (3/5) + text bottom (2/5).
 * Height = 50% of the row (NangCard's full height), vertically centered.
 */
function DocCard({ cat, gradIdx, isHovered, onMouseEnter, onMouseLeave, onClick }: CardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        flex: 1,             // 1/3 of row width
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        outline: "none",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <ImageSection cat={cat} isHovered={isHovered} gradIdx={gradIdx} style={{ flex: 3 }} />
      <TextSection cat={cat} isHovered={isHovered} style={{ flex: 2 }} />
    </div>
  );
}

/**
 * ngang: text + image side by side.
 * textFirst=true  → [TEXT | IMAGE]  (use when NangCard is on the RIGHT, so text is inward)
 * textFirst=false → [IMAGE | TEXT]  (use when NangCard is on the LEFT, so text is inward)
 */
function NangCard({
  cat,
  gradIdx,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  textFirst,
}: CardProps & { textFirst: boolean }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        flex: 2,             // 2/3 of row width (double DocCard)
        display: "flex",
        flexDirection: "row",
        cursor: "pointer",
        outline: "none",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {textFirst ? (
        <>
          <TextSection cat={cat} isHovered={isHovered} style={{ flex: 1 }} />
          <ImageSection cat={cat} isHovered={isHovered} gradIdx={gradIdx} style={{ flex: 1 }} />
        </>
      ) : (
        <>
          <ImageSection cat={cat} isHovered={isHovered} gradIdx={gradIdx} style={{ flex: 1 }} />
          <TextSection cat={cat} isHovered={isHovered} style={{ flex: 1 }} />
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading } = useCategoryTree();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const roots: CategoryWithChildren[] = Array.isArray(data) ? data : [];

  const filtered = roots
    .filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        (r.children || []).some((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "vi");
      if (sort === "nameDesc") return b.name.localeCompare(a.name, "vi");
      return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "vi");
    });

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    setSearchParams(p, { replace: true });
  }

  function goProducts(cat: CategoryWithChildren) {
    navigate(`/products?category=${encodeURIComponent(cat.slug)}`);
  }

  // Pattern: idx%4 ∈ {0,3} → doc, {1,2} → ngang
  // Row 1: doc | ngang
  // Row 2: ngang | doc
  // Row 3: doc | ngang …
  function orientationOf(idx: number): "doc" | "ngang" {
    const pos = idx % 4;
    return pos === 0 || pos === 3 ? "doc" : "ngang";
  }

  type Row =
    | { kind: "pair"; left: CategoryWithChildren; right: CategoryWithChildren; leftIdx: number }
    | { kind: "solo"; cat: CategoryWithChildren; idx: number };

  const rows: Row[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length) {
      rows.push({ kind: "pair", left: filtered[i], right: filtered[i + 1], leftIdx: i });
      i += 2;
    } else {
      rows.push({ kind: "solo", cat: filtered[i], idx: i });
      i++;
    }
  }

  const GAP = 32;
  const PAD = "clamp(60px, 12vw, 200px)";
  const ROW_H = "clamp(340px, 38vw, 500px)";
  const SOLO_H = "200px";

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>

      {/* ── Masthead ── */}
      <div
        style={{
          background: BRAND.creamDark,
          borderBottom: `1px solid ${BRAND.lightBorder}`,
          padding: "48px 0 36px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", padding: `0 ${PAD}` }}>
          <p
            style={{
              color: BRAND.blushRoseDark,
              letterSpacing: "0.3em",
              fontSize: 10,
              marginBottom: 14,
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            DressUp Collection
          </p>
          <h1
            style={{
              fontSize: "clamp(24px, 3.5vw, 48px)",
              color: BRAND.warmBrown,
              fontWeight: 300,
              lineHeight: 1.2,
              marginBottom: 28,
              letterSpacing: "-0.02em",
            }}
          >
            Trang phục cho mọi{" "}
            <em style={{ fontStyle: "italic", fontWeight: 400, color: BRAND.blushRoseDark }}>
              dịp đặc biệt
            </em>
          </h1>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              value={q}
              onChange={(e) => updateParam("q", e.target.value)}
              placeholder="Tìm danh mục..."
              style={{
                width: 200,
                background: "#fff",
                border: `1px solid ${BRAND.lightBorder}`,
                borderRadius: 2,
                padding: "8px 14px",
                color: BRAND.warmBrown,
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              className="cat-search-input"
            />
            <select
              value={sort || "default"}
              onChange={(e) =>
                updateParam("sort", e.target.value === "default" ? "" : e.target.value)
              }
              style={{
                background: "#fff",
                border: `1px solid ${BRAND.lightBorder}`,
                borderRadius: 2,
                padding: "8px 32px 8px 14px",
                color: BRAND.warmBrown,
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%239b8f8a' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              <option value="default">Mặc định</option>
              <option value="name">Tên A → Z</option>
              <option value="nameDesc">Tên Z → A</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Category rows ── */}
      {isLoading ? (
        <div style={{ padding: `${GAP}px ${PAD}`, display: "flex", flexDirection: "column", gap: GAP }}>
          {[0, 1].map((n) => (
            <div key={n} style={{ display: "flex", height: ROW_H, gap: GAP }}>
              <div style={{ flex: 1, background: "#e8ddd8" }} />
              <div style={{ flex: 1, background: BRAND.creamDark }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: "80px 24px",
            textAlign: "center",
            color: BRAND.mutedText,
            fontSize: 16,
          }}
        >
          Không tìm thấy danh mục nào
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: GAP,
            padding: `${GAP * 1.5}px ${PAD} ${GAP * 2}px`,
          }}
        >
          {rows.map((row, rIdx) => {
            if (row.kind === "solo") {
              const isH = hoveredId === row.cat._id;
              return (
                <div key={rIdx} style={{ height: SOLO_H, display: "flex" }}>
                  <NangCard
                    cat={row.cat}
                    gradIdx={row.idx}
                    isHovered={isH}
                    onMouseEnter={() => setHoveredId(row.cat._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => goProducts(row.cat)}
                    textFirst={false}
                  />
                </div>
              );
            }

            const leftOrientation = orientationOf(row.leftIdx);
            const rightOrientation = orientationOf(row.leftIdx + 1);
            const isHL = hoveredId === `${row.left._id}-L`;
            const isHR = hoveredId === `${row.right._id}-R`;

            // Text positioning for NangCards:
            // Row A = [DocCard(left) | NangCard(right)] → NangCard text on LEFT (textFirst=true)
            // Row B = [NangCard(left) | DocCard(right)] → NangCard text on RIGHT (textFirst=false)
            const leftIsNang = leftOrientation === "ngang";
            const rightIsNang = rightOrientation === "ngang";

            return (
              <div key={rIdx} style={{ display: "flex", height: ROW_H, gap: GAP }}>
                {leftIsNang ? (
                  <NangCard
                    cat={row.left}
                    gradIdx={row.leftIdx}
                    isHovered={isHL}
                    onMouseEnter={() => setHoveredId(`${row.left._id}-L`)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => goProducts(row.left)}
                    textFirst={false}
                  />
                ) : (
                  <DocCard
                    cat={row.left}
                    gradIdx={row.leftIdx}
                    isHovered={isHL}
                    onMouseEnter={() => setHoveredId(`${row.left._id}-L`)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => goProducts(row.left)}
                  />
                )}
                {rightIsNang ? (
                  <NangCard
                    cat={row.right}
                    gradIdx={row.leftIdx + 1}
                    isHovered={isHR}
                    onMouseEnter={() => setHoveredId(`${row.right._id}-R`)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => goProducts(row.right)}
                    textFirst={true}
                  />
                ) : (
                  <DocCard
                    cat={row.right}
                    gradIdx={row.leftIdx + 1}
                    isHovered={isHR}
                    onMouseEnter={() => setHoveredId(`${row.right._id}-R`)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => goProducts(row.right)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .cat-search-input::placeholder { color: ${BRAND.mutedText}; }
        .cat-search-input:focus { border-color: ${BRAND.blushRose} !important; }
      `}</style>
    </div>
  );
}
