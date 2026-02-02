import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "ghost" | "hero" | "heroSolid" | "ctaSoft";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    fullWidth?: boolean;
  }
>;

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const width = fullWidth ? "w-full" : "";

  const variants: Record<Variant, string> = {
    primary:
      "rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:ring-rose-600",
    ghost:
      "rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:border-rose-300 hover:text-rose-300 focus:ring-slate-300",
    hero:
      "px-8 py-4 text-[12px] font-semibold tracking-[0.25em] uppercase border border-[#e6c1b3] text-white bg-[#e6c1b3] hover:bg-transparent hover:text-[#e6c1b3] focus:ring-[#e6c1b3]",
    heroSolid:
      "px-8 py-4 text-[12px] font-semibold tracking-[0.25em] uppercase bg-[#e6c1b3] text-white border border-[#e6c1b3] hover:bg-[#d5b0a0] hover:border-[#d5b0a0] focus:ring-[#e6c1b3]",
    ctaSoft:
      "px-10 py-5 text-[12px] font-semibold tracking-[0.25em] uppercase bg-[#e6c1b3] text-white hover:bg-[#d5b0a0] focus:ring-[#e6c1b3]",
  };

  return (
    <button className={`${base} ${variants[variant]} ${width} ${className}`} {...rest}>
      {children}
    </button>
  );
}
