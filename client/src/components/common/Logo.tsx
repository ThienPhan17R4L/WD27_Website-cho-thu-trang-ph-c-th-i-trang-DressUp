type LogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "primary";
  className?: string;
};

export function Logo({ size = "md", variant = "light", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: { top: "text-[20px]", bottom: "text-[8px]", line: "w-5", gap: "gap-1.5" },
    md: { top: "text-[28px]", bottom: "text-[10px]", line: "w-6", gap: "gap-2" },
    lg: { top: "text-[40px]", bottom: "text-[14px]", line: "w-8", gap: "gap-2.5" },
  };

  const colors = {
    light: { top: "#ffffff", accent: "rgba(255,255,255,0.9)" },
    dark: { top: "#1e293b", accent: "rgb(213, 176, 160)" },
    primary: { top: "rgb(213, 176, 160)", accent: "rgb(213, 176, 160)" },
  };

  const s = sizeClasses[size];
  const c = colors[variant];

  return (
    <div className={`inline-flex flex-col leading-none ${className}`}>
      <div className={`${s.top} font-serif tracking-tight`} style={{ color: c.top }}>
        your
      </div>
      <div className={`-mt-1 flex items-center ${s.gap}`}>
        <span className={`h-px ${s.line}`} style={{ backgroundColor: c.accent }} />
        <span className={`${s.bottom} tracking-[0.25em] uppercase`} style={{ color: c.accent }}>
          DRESS
        </span>
      </div>
    </div>
  );
}
