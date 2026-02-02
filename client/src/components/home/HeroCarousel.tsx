import { useEffect, useMemo, useState } from "react";
import { Container } from "../common/Container";
import { Button } from "../common/Button";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  imageUrl: string;
};

type Props = {
  onPrimaryCta?: () => void;
};

export function HeroCarousel({ onPrimaryCta }: Props) {
  const slides: Slide[] = useMemo(
    () => [
      {
        id: "s1",
        title: "Dresses for Rent",
        subtitle: "Thuê váy cao cấp cho mọi dịp — nhanh, gọn, đẹp.",
        ctaLabel: "Rent now",
        imageUrl:
          "https://images.unsplash.com/photo-1520975958225-79e5b1d97a3f?auto=format&fit=crop&w=2400&q=80",
      },
      {
        id: "s2",
        title: "Rent Some Style",
        subtitle: "Cập nhật bộ sưu tập mới mỗi tuần.",
        ctaLabel: "Browse collection",
        imageUrl:
          "https://images.unsplash.com/photo-1520975693411-6a3a62d3531a?auto=format&fit=crop&w=2400&q=80",
      },
      {
        id: "s3",
        title: "Accessories & More",
        subtitle: "Phụ kiện hoàn thiện outfit — thuê theo set.",
        ctaLabel: "Explore accessories",
        imageUrl:
          "https://images.unsplash.com/photo-1520975867597-0f85e7f4e5b1?auto=format&fit=crop&w=2400&q=80",
      },
    ],
    []
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setActive((x) => (x + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const slide = slides[active];

  return (
    <div className="relative overflow-hidden bg-slate-900">
      {/* background image */}
      <div className="absolute inset-0">
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="h-full w-full object-cover opacity-65"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/10" />
      </div>

      <Container className="relative">
        <div className="py-16 sm:py-24 lg:py-28">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-white/75">
              Dress rental service
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              {slide.title}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/80">
              {slide.subtitle}
            </p>

            <div className="mt-7 flex gap-3">
              <Button onClick={onPrimaryCta}>{slide.ctaLabel}</Button>
              <Button variant="ghost" className="text-white hover:bg-white/10 focus:ring-white/30">
                How it works
              </Button>
            </div>

            {/* thumbnails */}
            <div className="mt-10 flex items-center gap-3">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  className={`h-10 w-16 overflow-hidden rounded-md ring-2 transition ${
                    idx === active ? "ring-white" : "ring-white/20 hover:ring-white/40"
                  }`}
                  onClick={() => setActive(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    className="h-full w-full object-cover opacity-90"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
