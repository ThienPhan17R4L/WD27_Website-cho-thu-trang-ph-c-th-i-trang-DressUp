import * as Slider from "@radix-ui/react-slider";
import { useMemo } from "react";

type Props = {
  min?: number;
  max?: number;
  step?: number;

  valueMin: number;
  valueMax: number;

  defaultValue?: { min: number; max: number };
  onChange: (next: { min: number; max: number }) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function PriceRangeSlider({
  min = 0,
  max = 254,
  step = 1,
  valueMin,
  valueMax,
  defaultValue,
  onChange,
}: Props) {
  const value = useMemo<[number, number]>(() => {
    const a = clamp(valueMin, min, max);
    const b = clamp(valueMax, min, max);
    return a <= b ? [a, b] : [b, a];
  }, [valueMin, valueMax, min, max]);

  const clearTo = defaultValue ?? { min, max };

  const canClear = useMemo(
    () => value[0] !== clearTo.min || value[1] !== clearTo.max,
    [value, clearTo.min, clearTo.max]
  );

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <Slider.Root
          className="relative flex w-full touch-none select-none items-center"
          min={min}
          max={max}
          step={step}
          value={value}
          onValueChange={(v) => onChange({ min: v[0], max: v[1] })}
        >
          <Slider.Track className="relative h-[3px] w-full grow rounded-full bg-slate-200">
            <Slider.Range className="absolute h-full rounded-full bg-[#d5b0a0]" />
          </Slider.Track>

          <Slider.Thumb
            className="block h-4 w-4 rounded-full border border-[#d5b0a0] bg-white shadow-sm
                       outline-none ring-offset-2 transition
                       focus-visible:ring-2 focus-visible:ring-[#d5b0a0]"
            aria-label="Minimum price"
          />
          <Slider.Thumb
            className="block h-4 w-4 rounded-full border border-[#d5b0a0] bg-white shadow-sm
                       outline-none ring-offset-2 transition
                       focus-visible:ring-2 focus-visible:ring-[#d5b0a0]"
            aria-label="Maximum price"
          />
        </Slider.Root>

        <button
          type="button"
          disabled={!canClear}
          onClick={() => onChange(clearTo)}
          className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#d5b0a0] disabled:opacity-40"
        >
          CLEAR
        </button>
      </div>

      <div className="mt-2 text-[12px] text-slate-700">
        {value[0]} - {value[1]}
      </div>
    </div>
  );
}
