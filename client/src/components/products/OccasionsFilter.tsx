import { useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { FilterDivider, FilterItemButton, FilterSection } from "./FilterSection";

export function OccasionsFilter({
  categoryId,
  onChange,
}: {
  categoryId?: string;
  onChange: (categoryId?: string) => void;
}) {
  const { data } = useCategories();

  const cats = useMemo(() => {
    const list = (data ?? []).filter((c) => c.isActive);
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data]);

  return (
    <FilterSection title="Occasions">
      <FilterItemButton active={!categoryId} onClick={() => onChange(undefined)}>
        All
      </FilterItemButton>

      <div className="mt-1">
        {cats.map((c, idx) => (
          <div key={c._id}>
            <FilterDivider />
            <FilterItemButton active={c._id === categoryId} onClick={() => onChange(c._id)}>
              {c.name}
            </FilterItemButton>
            {idx === cats.length - 1 ? <FilterDivider /> : null}
          </div>
        ))}
      </div>
    </FilterSection>
  );
}
