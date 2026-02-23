import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { ProductGrid } from "@/components/products/ProductGrid";
import { PaginationBar } from "@/components/common/PaginationBar";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

import { ProductTopBar } from "@/components/products/ProductTopBar";
import { OccasionsFilter } from "@/components/products/OccasionsFilter";
import { PriceFilter } from "@/components/products/PriceFilter";
import { InlineInputFilter } from "@/components/products/InlineInputFilter";
import { StatusFilter } from "@/components/products/StatusFilter";

const PRICE_MIN = 0;
const PRICE_MAX = 3_000_000; // VND

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read all filters from URL
  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "-createdAt";
  const q = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const tag = searchParams.get("tag") || "";
  const status = (searchParams.get("status") || "active") as "active" | "archived";
  const priceMin = Number(searchParams.get("priceMin")) || PRICE_MIN;
  const priceMax = Number(searchParams.get("priceMax")) || PRICE_MAX;

  // Resolve category slug → categoryId
  const { data: categories } = useCategories();
  const categoryId = useMemo(() => {
    if (!categorySlug || !categories) return undefined;
    const found = categories.find((c) => c.slug === categorySlug);
    return found?._id;
  }, [categorySlug, categories]);

  // Helper to update URL params (resets page to 1 unless updating page itself)
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        if (resetPage) p.delete("page");
        for (const [key, value] of Object.entries(updates)) {
          if (value && value !== defaultValue(key)) {
            p.set(key, value);
          } else {
            p.delete(key);
          }
        }
        return p;
      }, { replace: true });
    },
    [setSearchParams],
  );

  // Default values — don't show in URL if matching default
  function defaultValue(key: string): string {
    switch (key) {
      case "sort": return "-createdAt";
      case "status": return "active";
      case "page": return "1";
      case "priceMin": return String(PRICE_MIN);
      case "priceMax": return String(PRICE_MAX);
      default: return "";
    }
  }

  const params = useMemo(
    () => ({
      page,
      limit: 12,
      sort,
      status,
      q: q.trim() || undefined,
      categoryId: categoryId || undefined,
      brand: brand.trim() || undefined,
      tag: tag.trim() || undefined,
      priceMin,
      priceMax,
    }),
    [page, sort, status, q, categoryId, brand, tag, priceMin, priceMax]
  );

  const { data, isLoading, isError, error } = useProducts(params as any);

  return (
    <div className="bg-white">
      <Container>
        <div className="py-10">
          {/* TOP BAR: sort + search */}
          <ProductTopBar
            sort={sort}
            onSortChange={(v) => updateParams({ sort: v })}
            q={q}
            onSearchChange={(v) => updateParams({ q: v })}
            onClearSearch={() => updateParams({ q: undefined })}
          />

          <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
            {/* FILTER BOXES */}
            <div className="space-y-8">
              <OccasionsFilter
                categorySlug={categorySlug}
                onChange={(slug) => updateParams({ category: slug })}
              />

              <PriceFilter
                min={PRICE_MIN}
                max={PRICE_MAX}
                appliedMin={priceMin}
                appliedMax={priceMax}
                onApply={({ min, max }) =>
                  updateParams({ priceMin: String(min), priceMax: String(max) })
                }
                onClear={() =>
                  updateParams({ priceMin: undefined, priceMax: undefined })
                }
              />

              <InlineInputFilter
                title="Brand"
                value={brand}
                placeholder="Brand"
                onChange={(v) => updateParams({ brand: v })}
              />

              <InlineInputFilter
                title="Tag"
                value={tag}
                placeholder="Tag"
                onChange={(v) => updateParams({ tag: v })}
              />

              <StatusFilter
                value={status}
                onChange={(v) => updateParams({ status: v })}
              />

              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="h-12 w-full bg-[rgb(213,176,160)] text-white text-[12px] font-semibold tracking-[0.22em] uppercase"
              >
                Clear filters
              </button>
            </div>

            {/* PRODUCTS + PAGINATION */}
            <div>
              {isLoading && <div className="text-sm text-slate-500">Loading...</div>}

              {isError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {(error as any)?.response?.data?.message ?? "Load failed"}
                </div>
              )}

              {data && (
                <>
                  <ProductGrid items={data.items} />
                  <PaginationBar
                    page={data.page}
                    totalPages={data.totalPages}
                    onChange={(p) => updateParams({ page: String(p) }, false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
