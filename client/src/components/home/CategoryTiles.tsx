import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Section } from "../common/Section";
import { useCategoryTree } from "@/hooks/useCategories";
import type { CategoryWithChildren } from "@/types/category";
import { BRAND } from "@/pages/CategoriesPage";

const GRAD = [
  "linear-gradient(145deg, #e2cfc8 0%, #f0e4e0 100%)",
  "linear-gradient(145deg, #d8d0c8 0%, #ece6e0 100%)",
  "linear-gradient(145deg, #dccec8 0%, #ede4e0 100%)",
  "linear-gradient(145deg, #c8d0d4 0%, #e0e8ec 100%)",
];

function HomeCategoryCard({
  cat,
  gradIdx,
}: {
  cat: CategoryWithChildren;
  gradIdx: number;
}) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/products?category=${encodeURIComponent(cat.slug)}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/products?category=${encodeURIComponent(cat.slug)}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", outline: "none", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Image top */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3" }}>
        {cat.image ? (
          <img
            src={cat.image}
            alt={cat.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: GRAD[gradIdx % GRAD.length],
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          />
        )}
        {/* Warm overlay on hover */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(90,64,56,0.35)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        />
        {/* Bottom name label on image (fades out on hover) */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            padding: "24px 16px 12px",
            background: "linear-gradient(to top, rgba(90,64,56,0.5) 0%, transparent 100%)",
            opacity: hovered ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          <p style={{ color: "#fff", fontSize: 14, fontWeight: 500, margin: 0 }}>{cat.name}</p>
        </div>
      </div>

      {/* Text section */}
      <div
        style={{
          background: hovered ? BRAND.blushRose : BRAND.cream,
          transition: "background 0.4s ease",
          padding: "16px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: hovered ? "#fff" : BRAND.warmBrown,
            transition: "color 0.4s ease",
            margin: 0,
          }}
        >
          {cat.name}
        </h3>
        {cat.description && (
          <p
            style={{
              fontSize: 12,
              color: hovered ? "rgba(255,255,255,0.75)" : BRAND.mutedText,
              transition: "color 0.4s ease",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {cat.description}
          </p>
        )}
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: hovered ? "#fff" : BRAND.blushRoseDark,
            transition: "color 0.4s ease",
            marginTop: 4,
          }}
        >
          LEARN MORE →
        </span>
      </div>
    </div>
  );
}

export function CategoryTiles() {
  const { data, isLoading } = useCategoryTree();
  const roots = Array.isArray(data) ? data.filter((c) => c.isActive).slice(0, 4) : [];

  return (
    <Section
      title="Welcome to Dress Rental Service"
      subtitle="Chọn outfit phù hợp, đặt lịch thuê, nhận đồ tận nơi."
      align="center"
      className="bg-[#f7f3ef]"
    >
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                background: "#e8ddd8",
                aspectRatio: "3/4",
                borderRadius: 2,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : roots.length === 0 ? (
        <p style={{ textAlign: "center", color: BRAND.mutedText, fontSize: 14 }}>
          Chưa có danh mục nào.
        </p>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {roots.map((cat, idx) => (
              <HomeCategoryCard key={cat._id} cat={cat} gradIdx={idx} />
            ))}
          </div>

          {/* Explore More button */}
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link
              to="/categories"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 32px",
                border: `1px solid ${BRAND.blushRose}`,
                color: BRAND.blushRoseDark,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textDecoration: "none",
                background: "transparent",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = BRAND.blushRose;
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = BRAND.blushRoseDark;
              }}
            >
              EXPLORE MORE CATEGORIES →
            </Link>
          </div>
        </div>
      )}
    </Section>
  );
}
