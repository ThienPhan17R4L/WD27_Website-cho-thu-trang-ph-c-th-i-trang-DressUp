import type { Product } from "@/types/product";
import { ProductCard } from "../common/ProductCard";

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
