import React from "react";

const ACCENT = "rgb(213, 176, 160)";

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full">
      {/* Header bar */}
      <div
        className="px-6 py-6 text-center"
        style={{ backgroundColor: "rgba(213, 176, 160, 0.75)" }}
      >
        <div className="flex items-center justify-center gap-6">
          <span className="h-px w-10 bg-white/70" />
          <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-white">
            {title}
          </div>
          <span className="h-px w-10 bg-white/70" />
        </div>
      </div>

      {/* Body panel */}
      <div className="bg-[#f6f3ef] px-6 py-6">{children}</div>
    </section>
  );
}

export function FilterItemButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full py-5 text-center",
        "text-[12px] font-semibold tracking-[0.22em] uppercase",
        active ? "text-slate-900" : "text-slate-400 hover:text-slate-700",
      ].join(" ")}
      style={active ? { color: ACCENT } : undefined}
    >
      {children}
    </button>
  );
}

export function FilterDivider() {
  return <div className="h-px w-full bg-slate-200/70" />;
}
