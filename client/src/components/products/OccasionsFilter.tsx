import { useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { FilterDivider, FilterItemButton, FilterSection } from "./FilterSection";

export function OccasionsFilter({
  categorySlug,
  onChange,
}: {
  categorySlug?: string;
  onChange: (slug?: string) => void;
}) {
  const { data } = useCategories();

  const cats = useMemo(() => {
    const list = (data ?? []).filter((c) => c.isActive);
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data]);

  return (
    <FilterSection title="Occasions">
      <FilterItemButton active={!categorySlug} onClick={() => onChange(undefined)}>
        All
      </FilterItemButton>

      <div className="mt-1">
        {cats.map((c, idx) => (
          <div key={c._id}>
            <FilterDivider />
            <FilterItemButton active={c.slug === categorySlug} onClick={() => onChange(c.slug)}>
              {c.name}
            </FilterItemButton>
            {idx === cats.length - 1 ? <FilterDivider /> : null}
          </div>
        ))}
      </div>
    </FilterSection>
  );
}
