import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "ghost";

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
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  const styles =
    variant === "primary"
      ? "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600"
      : "bg-white/0 text-slate-900 hover:bg-slate-100 focus:ring-slate-300";

  const width = fullWidth ? "w-full" : "";

  return (
    <button className={`${base} ${styles} ${width} ${className}`} {...rest}>
      {children}
    </button>
  );
}
