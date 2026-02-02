type Props = {
  href?: string;
  className?: string;
};

export function BrandLogo({ href = "/", className = "" }: Props) {
  return (
    <a href={href} className={`inline-flex items-center ${className}`}>
      <div className="leading-none">
        <div className="text-[34px] font-serif tracking-tight text-slate-900">
          your
        </div>
        <div className="-mt-1 flex items-center gap-2">
          <span className="h-px w-7 bg-rose-300" />
          <span className="text-[12px] tracking-[0.25em] text-rose-300">
            DRESS
          </span>
        </div>
      </div>
    </a>
  );
}
