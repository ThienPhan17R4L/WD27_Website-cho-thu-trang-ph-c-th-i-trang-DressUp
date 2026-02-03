import { FilterSection } from "./FilterSection";

export function StatusFilter({
  value,
  onChange,
}: {
  value: "active" | "archived";
  onChange: (v: "active" | "archived") => void;
}) {
  return (
    <FilterSection title="Status">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as any)}
        className="h-12 w-full bg-white px-4 text-[12px] font-semibold tracking-[0.18em] uppercase ring-1 ring-slate-200 outline-none focus:ring-[rgba(213,176,160,0.6)]"
      >
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
    </FilterSection>
  );
}
