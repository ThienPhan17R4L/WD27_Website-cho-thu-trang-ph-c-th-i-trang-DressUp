import { Container } from "../common/Container";
import { Button } from "../common/Button";
import { ProductCard } from "../common/ProductCard";
import { useProducts } from "@/hooks/useProducts";

export function ProductGrid() {
  // Fetch 8 sản phẩm mới nhất, status active
  const { data, isLoading, isError } = useProducts({
    page: 1,
    limit: 8,
    sort: "-createdAt",
    status: "active",
  });

  const products = data?.items ?? [];

  return (
    <section className="bg-white py-14 sm:py-20">
      <Container>
        {/* Header row */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#e6c1b3]" />
              <span className="text-[12px] font-semibold tracking-[0.3em] text-[#e6c1b3] uppercase">
                FOR ANY OCCASION
              </span>
            </div>

            <h2 className="mt-6 font-serif text-[56px] leading-[0.95] tracking-tight text-slate-900 sm:text-[70px]">
              Find Gorgeous Dress
              <br />
              For Any Occasion
            </h2>
          </div>

          <div className="lg:pt-4">
            <Button
              variant="hero"
              onClick={() => (window.location.href = "/products")}
            >
              VIEW ALL DRESSES
            </Button>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="mt-14 py-20 text-center text-sm text-slate-500">
            Loading products...
          </div>
        ) : isError ? (
          <div className="mt-14 py-20 text-center text-sm text-rose-600">
            Failed to load products
          </div>
        ) : products.length === 0 ? (
          <div className="mt-14 py-20 text-center text-sm text-slate-500">
            No products available
          </div>
        ) : (
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
