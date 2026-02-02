import { Section } from "../common/Section";

type Tile = {
  title: string;
  desc: string;
  imageUrl: string;
  href?: string;
};

export function CategoryTiles() {
  const tiles: Tile[] = [
    {
      title: "Dresses",
      desc: "Váy dự tiệc, cưới, dạ hội",
      imageUrl:
        "https://images.unsplash.com/photo-1520975919290-35bfe97b2b52?auto=format&fit=crop&w=1400&q=80",
      href: "/products?category=dresses",
    },
    {
      title: "Accessories",
      desc: "Túi, khuyên tai, vòng cổ",
      imageUrl:
        "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1400&q=80",
      href: "/products?category=accessories",
    },
    {
      title: "Designer Clothing",
      desc: "Set theo thương hiệu, xu hướng",
      imageUrl:
        "https://images.unsplash.com/photo-1520975777876-69f2f2e0b3a5?auto=format&fit=crop&w=1400&q=80",
      href: "/products?category=designer",
    },
  ];

  return (
    <Section
      title="Welcome to Dress Rental Service"
      subtitle="Chọn outfit phù hợp, đặt lịch thuê, nhận đồ tận nơi."
      align="center"
      className="bg-white"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {tiles.map((t) => (
          <a
            key={t.title}
            href={t.href ?? "#"}
            className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={t.imageUrl}
                alt={t.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{t.title}</h3>
                <span className="text-sm text-rose-600">Explore →</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
