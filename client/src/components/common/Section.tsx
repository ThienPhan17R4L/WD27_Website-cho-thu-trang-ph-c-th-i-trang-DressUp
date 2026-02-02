import type { PropsWithChildren, ReactNode } from "react";
import { Container } from "./Container";

type Props = PropsWithChildren<{
  title?: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
}>;

export function Section({
  title,
  subtitle,
  align = "left",
  className = "",
  children,
}: Props) {
  const isCenter = align === "center";

  return (
    <section className={`py-10 sm:py-14 ${className}`}>
      <Container>
        {(title || subtitle) && (
          <div className={`${isCenter ? "text-center" : "text-left"} mb-8`}>
            {title && (
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </Container>
    </section>
  );
}
