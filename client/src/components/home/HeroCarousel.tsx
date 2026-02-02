import { useEffect, useMemo, useState } from "react";

import { Button } from "../common/Button";
import hero1 from "@/assets/hero/hero-01.jpg";
import hero2 from "@/assets/hero/hero-02.jpg";
import hero3 from "@/assets/hero/hero-03.jpg";
import thumb1 from "@/assets/hero/thumb-01.jpg";
import thumb2 from "@/assets/hero/thumb-02.jpg";
import thumb3 from "@/assets/hero/thumb-03.jpg";

type Slide = {
  id: string;
  heroSrc: string;
  thumbSrc: string;
  kicker: string;
  title: string;
};

export function HeroCarousel({
  autoPlay = true,
  intervalMs = 6500,
}: {
  autoPlay?: boolean;
  intervalMs?: number;
}) {
  const slides: Slide[] = useMemo(
    () => [
      {
        id: "s1",
        heroSrc: hero1,
        thumbSrc: thumb1,
        kicker: "FOR ANY OCCASION",
        title: "Dresses For Rent",
      },
      {
        id: "s2",
        heroSrc: hero2,
        thumbSrc: thumb2,
        kicker: "NEW COLLECTION",
        title: "Rent Some Style",
      },
      {
        id: "s3",
        heroSrc: hero3,
        thumbSrc: thumb3,
        kicker: "STYLIST PICKS",
        title: "Occasion Ready",
      },
    ],
    []
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;
    const t = window.setInterval(() => {
      setActive((x) => (x + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [autoPlay, intervalMs, slides.length]);

  const slide = slides[active];

  return (
    <section className="relative w-full bg-white">
      <div className="relative w-full overflow-hidden">
        {/* Background image */}
        <div className="relative h-[520px] w-full sm:h-[640px] lg:h-[720px]">
          <img
            src={slide.heroSrc}
            alt={slide.title}
            className="h-full w-full object-cover"
            loading="eager"
          />

          {/* soft overlay */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* ✅ ĐÃ XÓA Left stylist rail (3 nút góc trái) */}

        {/* Centered text overlay + CTA */}
        <div className="absolute inset-0 z-10 grid place-items-center px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-white/70" />
              <span className="text-[12px] font-semibold tracking-[0.3em] text-white/90">
                {slide.kicker}
              </span>
              <span className="h-px w-12 bg-white/70" />
            </div>

            <h1 className="mt-5 font-serif text-[44px] leading-[1.05] tracking-tight text-white sm:text-[64px] lg:text-[84px]">
              {slide.title}
            </h1>

            {/* ✅ THÊM NÚT GIỮA MÀN HÌNH */}
            <div className="mt-10 flex justify-center">
              {/* dùng variant trong /common/Button.tsx */}
              <Button
                variant="hero"
                onClick={() => (window.location.href = "/find")}
              >
                FIND YOUR DRESS
              </Button>
            </div>
          </div>
        </div>

        {/* Thumbnails bottom-right */}
        <div className="absolute bottom-6 right-6 z-20 hidden sm:block">
          <div className="flex items-stretch gap-2 rounded-sm bg-white/20 p-2 backdrop-blur">
            {slides.map((s, idx) => {
              const isActive = idx === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={[
                    "relative h-20 w-28 overflow-hidden border transition",
                    isActive
                      ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.35)]"
                      : "border-white/40 hover:border-rose-300",
                  ].join(" ")}
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <img
                    src={s.thumbSrc}
                    alt={s.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {!isActive && <div className="absolute inset-0 bg-black/20" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
