import { HeroCarousel } from "../components/home/HeroCarousel";
import { CategoryTiles } from "../components/home/CategoryTiles";
import { ProductGrid } from "../components/home/ProductGrid";
import { PromoStrip } from "../components/home/PromoStrip";
import { Testimonials } from "../components/home/Testimonials";
import { Newsletter } from "../components/home/Newsletter";
import { Header } from "@/components/common/Header";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div>
      <Header activePath="/" cartCount={0} user={user} />
      <main className="bg-white">
        <HeroCarousel onPrimaryCta={() => (window.location.href = "/products")} />
        <CategoryTiles />
        <ProductGrid />
        <PromoStrip />
        <Testimonials />
        <Newsletter />
        <footer className="border-t border-slate-200 bg-white py-10">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">YourDress</p>
                <p className="mt-1 text-sm text-slate-600">
                  Dress rental service — đơn giản, tinh tế.
                </p>
              </div>
              <div className="flex gap-4 text-sm text-slate-600">
                <a className="hover:text-slate-900" href="/about">
                  About
                </a>
                <a className="hover:text-slate-900" href="/products">
                  Products
                </a>
                <a className="hover:text-slate-900" href="/contact">
                  Contact
                </a>
              </div>
            </div>
            <p className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} YourDress.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
