import { useEffect, useMemo, useState } from "react";
import { FilterSection } from "./FilterSection";
import { PriceRangeSlider } from "./PriceRangeSlider";
import { formatVND } from "@/utils/money";

const ACCENT = "rgb(213, 176, 160)";

export function PriceFilter({
  min,
  max,
  appliedMin,
  appliedMax,
  onApply,
  onClear,
}: {
  min: number;
  max: number;
  appliedMin: number;
  appliedMax: number;
  onApply: (next: { min: number; max: number }) => void;
  onClear: () => void;
}) {
  // pending state: kéo slider không gọi API ngay
  const [pendingMin, setPendingMin] = useState(appliedMin);
  const [pendingMax, setPendingMax] = useState(appliedMax);

  // nếu applied thay đổi từ ngoài -> sync lại pending
  useEffect(() => {
    setPendingMin(appliedMin);
    setPendingMax(appliedMax);
  }, [appliedMin, appliedMax]);

  const dirty = useMemo(
    () => pendingMin !== appliedMin || pendingMax !== appliedMax,
    [pendingMin, pendingMax, appliedMin, appliedMax]
  );

  return (
    <FilterSection title="Price filter">
      <PriceRangeSlider
        min={min}
        max={max}
        valueMin={pendingMin}
        valueMax={pendingMax}
        onChange={({ min, max }) => {
          setPendingMin(min);
          setPendingMax(max);
        }}
      />

      <div className="mt-5 flex items-center justify-between">
        <div className="text-[12px] tracking-[0.18em] text-slate-500">
          {formatVND(pendingMin)} – {formatVND(pendingMax)}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPendingMin(min);
              setPendingMax(max);
              onClear();
            }}
            className="text-[12px] font-semibold tracking-[0.22em] uppercase"
            style={{ color: ACCENT }}
          >
            Clear
          </button>

          <button
            type="button"
            disabled={!dirty}
            onClick={() => onApply({ min: pendingMin, max: pendingMax })}
            className={[
              "h-10 px-6",
              "text-[12px] font-semibold tracking-[0.22em] uppercase text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
            style={{ backgroundColor: ACCENT }}
          >
            Filter
          </button>
        </div>
      </div>
    </FilterSection>
  );
}
