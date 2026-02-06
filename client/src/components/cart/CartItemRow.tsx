import { useMemo, useState } from "react";
import { QuantityStepper } from "@/components/products/QuantityStepper";
import { formatVND } from "@/utils/formatCurrency";

const ACCENT = "rgb(213, 176, 160)";

function toDateInputValue(d: string | Date | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  // yyyy-mm-dd
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type CartItem = {
  _id: string;
  productId: string;
  name: string;
  image?: string;
  deposit?: number;
  quantity: number;

  rental?: {
    startDate?: string | Date;
    endDate?: string | Date;
  };

  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };

  // optional nếu backend bạn có
  lineTotal?: number;
  pricePerDay?: number;
};

export function CartItemRow({
  item,
  onRemove,
  onUpdate,
  updating,
}: {
  item: CartItem;
  onRemove: (itemId: string) => void;
  onUpdate: (payload: { itemId: string; quantity?: number; rentalStart?: string; rentalEnd?: string; variant?: any }) => void;
  updating?: boolean;
}) {
  const [qty, setQty] = useState(item.quantity ?? 1);
  const [start, setStart] = useState(toDateInputValue(item.rental?.startDate));
  const [end, setEnd] = useState(toDateInputValue(item.rental?.endDate));

  const meta = useMemo(() => {
    const parts: string[] = [];
    if (item.variant?.size) parts.push(item.variant.size);
    if (item.variant?.color) parts.push(item.variant.color);
    if (item.variant?.sku) parts.push(item.variant.sku);
    return parts.join(" / ");
  }, [item.variant]);

  return (
    <div className="grid grid-cols-1 gap-6 border-b border-slate-200 pb-8 pt-8 md:grid-cols-[120px_1fr]">
      {/* image */}
      <div className="bg-[#f6f3ef] ring-1 ring-slate-200">
        <div className="aspect-[4/5] w-full">
          {item.image ? (
            <img src={item.image} alt="" className="h-full w-full object-contain" draggable={false} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
          )}
        </div>
      </div>

      {/* content */}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
              {item.name}
            </div>

            {meta ? (
              <div className="mt-2 text-sm text-slate-500">{meta}</div>
            ) : (
              <div className="mt-2 text-sm text-slate-500">—</div>
            )}

            {/* dates */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-[12px] font-medium text-slate-700">Start</div>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-2 h-12 w-full bg-[#f6f3ef] px-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                />
              </div>
              <div>
                <div className="text-[12px] font-medium text-slate-700">End</div>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-2 h-12 w-full bg-[#f6f3ef] px-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                />
              </div>
            </div>

            {/* qty + update */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <QuantityStepper value={qty} onChange={setQty} />

              <button
                type="button"
                className="h-12 px-8 text-[12px] font-semibold tracking-[0.22em] uppercase ring-1 ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-[rgba(213,176,160,0.55)] disabled:opacity-60"
                disabled={updating}
                onClick={() =>
                  onUpdate({
                    itemId: item._id,
                    quantity: qty,
                    rentalStart: start,
                    rentalEnd: end,
                    variant: item.variant,
                  })
                }
              >
                {updating ? "UPDATING..." : "UPDATE"}
              </button>

              <button
                type="button"
                className="h-12 px-8 text-[12px] font-semibold tracking-[0.22em] uppercase text-white disabled:opacity-60"
                style={{ backgroundColor: ACCENT }}
                disabled={updating}
                onClick={() => onRemove(item._id)}
              >
                REMOVE
              </button>
            </div>
          </div>

          {/* price */}
          <div className="hidden shrink-0 text-right md:block">
            <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-400">
              Total
            </div>
            <div className="mt-2 text-lg font-semibold" style={{ color: ACCENT }}>
              {typeof item.lineTotal === "number" ? formatVND(item.lineTotal) : "—"}
            </div>
            {typeof item.deposit === "number" ? (
              <div className="mt-2 text-sm text-slate-500">Deposit: {formatVND(item.deposit)}</div>
            ) : null}
          </div>
        </div>

        {/* mobile price */}
        <div className="mt-6 flex items-center justify-between md:hidden">
          <div className="text-sm text-slate-500">Item total</div>
          <div className="text-lg font-semibold" style={{ color: ACCENT }}>
            {typeof item.lineTotal === "number" ? formatVND(item.lineTotal) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
