import { FilterSection } from "./FilterSection";

export function InlineInputFilter({
  title,
  value,
  placeholder,
  onChange,
}: {
  title: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <FilterSection title={title}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full bg-white px-4 text-[12px] tracking-[0.18em] ring-1 ring-slate-200 outline-none focus:ring-[rgba(213,176,160,0.6)]"
      />
    </FilterSection>
  );
}
