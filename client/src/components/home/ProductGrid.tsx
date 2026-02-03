import { useMemo } from "react";
import { Container } from "../common/Container";
import { Button } from "../common/Button";
import { ProductCard } from "../common/ProductCard";

import p1 from "@/assets/hero/hero-01.jpg";
import p2 from "@/assets/hero/hero-02.jpg";
import p3 from "@/assets/hero/hero-03.jpg";
import p4 from "@/assets/hero/hero-01.jpg";
import { Product } from "@/types/product";

export function ProductGrid() {
  const products: Product[] = [];

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
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
