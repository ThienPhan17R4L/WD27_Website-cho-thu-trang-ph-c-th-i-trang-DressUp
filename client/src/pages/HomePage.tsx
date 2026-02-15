import { HeroCarousel } from "../components/home/HeroCarousel";
import { CategoryTiles } from "../components/home/CategoryTiles";
import { ProductGrid } from "../components/home/ProductGrid";

export default function HomePage() {
  return (
    <main className="bg-white">
      <HeroCarousel />
      <CategoryTiles />
      <ProductGrid />
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">DressUp</p>
              <p className="mt-1 text-sm text-slate-600">
                Dịch vụ cho thuê trang phục — đơn giản, tinh tế.
              </p>
            </div>
            <div className="flex gap-4 text-sm text-slate-600">
              <a className="hover:text-slate-900" href="/products">
                Sản phẩm
              </a>
            </div>
          </div>
          <p className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} DressUp.</p>
        </div>
      </footer>
    </main>
  );
}
