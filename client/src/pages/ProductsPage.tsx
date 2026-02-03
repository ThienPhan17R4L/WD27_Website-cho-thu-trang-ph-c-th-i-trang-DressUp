import { useMemo, useState } from "react";
import { Container } from "@/components/common/Container";
import { ProductGrid } from "@/components/products/ProductGrid";
import { PaginationBar } from "@/components/common/PaginationBar";
import { useProducts } from "@/hooks/useProducts";

import { ProductTopBar } from "@/components/products/ProductTopBar";
import { OccasionsFilter } from "@/components/products/OccasionsFilter";
import { PriceFilter } from "@/components/products/PriceFilter";
import { InlineInputFilter } from "@/components/products/InlineInputFilter";
import { StatusFilter } from "@/components/products/StatusFilter";

const PRICE_MIN = 0;
const PRICE_MAX = 3_000_000; // VND

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");

  // search on top bar
  const [q, setQ] = useState("");

  // filters
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [brand, setBrand] = useState("");
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState<"active" | "archived">("active");

  // ✅ applied price (chỉ đổi khi bấm FILTER trong PriceFilter)
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);

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
            onSortChange={(v) => {
              setSort(v);
              setPage(1);
            }}
            q={q}
            onSearchChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            onClearSearch={() => {
              setQ("");
              setPage(1);
            }}
          />

          <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
            {/* FILTER BOXES */}
            <div className="space-y-8">
              <OccasionsFilter
                categoryId={categoryId}
                onChange={(id) => {
                  setCategoryId(id);
                  setPage(1);
                }}
              />

              {/* ✅ price filter: bấm FILTER mới apply */}
              <PriceFilter
                min={PRICE_MIN}
                max={PRICE_MAX}
                appliedMin={priceMin}
                appliedMax={priceMax}
                onApply={({ min, max }) => {
                  setPriceMin(min);
                  setPriceMax(max);
                  setPage(1);
                }}
                onClear={() => {
                  setPriceMin(PRICE_MIN);
                  setPriceMax(PRICE_MAX);
                  setPage(1);
                }}
              />

              <InlineInputFilter
                title="Brand"
                value={brand}
                placeholder="Brand"
                onChange={(v) => {
                  setBrand(v);
                  setPage(1);
                }}
              />

              <InlineInputFilter
                title="Tag"
                value={tag}
                placeholder="Tag"
                onChange={(v) => {
                  setTag(v);
                  setPage(1);
                }}
              />

              <StatusFilter
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setCategoryId(undefined);
                  setBrand("");
                  setTag("");
                  setStatus("active");
                  setSort("-createdAt");

                  // ✅ reset VND range
                  setPriceMin(PRICE_MIN);
                  setPriceMax(PRICE_MAX);

                  setPage(1);
                }}
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
                    onChange={(p) => setPage(p)}
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
