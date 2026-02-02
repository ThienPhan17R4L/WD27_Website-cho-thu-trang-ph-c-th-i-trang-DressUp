import type { Product } from "../../types/Product";
import { Section } from "../common/Section";
import { Button } from "../common/Button";

type Props = {
  products?: Product[];
};

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export function ProductGrid({ products }: Props) {
  const mock: Product[] = products ?? [
    {
      id: "p1",
      name: "Pearl White Midi Dress",
      brand: "Studio",
      pricePerDay: 150000,
      tag: "New",
      imageUrl:
        "https://images.unsplash.com/photo-1520975867597-0f85e7f4e5b1?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "p2",
      name: "Black Evening Dress",
      brand: "Noir",
      pricePerDay: 180000,
      tag: "Top",
      imageUrl:
        "https://images.unsplash.com/photo-1520975958225-79e5b1d97a3f?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "p3",
      name: "Lace Party Dress",
      brand: "Aura",
      pricePerDay: 160000,
      imageUrl:
        "https://images.unsplash.com/photo-1520975693411-6a3a62d3531a?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "p4",
      name: "Classic Cocktail Dress",
      brand: "Eve",
      pricePerDay: 170000,
      imageUrl:
        "https://images.unsplash.com/photo-1520975919290-35bfe97b2b52?auto=format&fit=crop&w=1400&q=80",
    },
  ];

  return (
    <Section title="Featured dresses" subtitle="Gợi ý nổi bật hôm nay">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mock.map((p) => (
          <div
            key={p.id}
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              {p.tag && (
                <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-medium text-white">
                  {p.tag}
                </span>
              )}
            </div>

            <div className="p-4">
              {p.brand && <p className="text-xs text-slate-500">{p.brand}</p>}
              <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                {p.name}
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  {formatVnd(p.pricePerDay)} <span className="text-xs text-slate-500">/ngày</span>
                </p>
                <Button className="px-3 py-1.5 text-xs">Rent</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="ghost" className="border border-slate-200">
          View all products
        </Button>
      </div>
    </Section>
  );
}
