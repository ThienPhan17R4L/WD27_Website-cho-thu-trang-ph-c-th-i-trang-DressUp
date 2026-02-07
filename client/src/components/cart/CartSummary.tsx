import { useNavigate } from "react-router-dom";
import { formatVND } from "@/utils/formatCurrency";

const ACCENT = "rgb(213, 176, 160)";

export function CartSummary({
  totals,
  onClear,
  clearing,
}: {
  totals?: { subtotal?: number; discount?: number; shippingFee?: number; grandTotal?: number; itemCount?: number };
  onClear: () => void;
  clearing?: boolean;
}) {
  const navigate = useNavigate();
  const subtotal = totals?.subtotal ?? 0;
  const discount = totals?.discount ?? 0;
  const shippingFee = totals?.shippingFee ?? 0;
  const grandTotal = totals?.grandTotal ?? Math.max(0, subtotal - discount + shippingFee);

  return (
    <div className="bg-white ring-1 ring-slate-200">
      <div className="p-7">
        <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
          Cart totals
        </div>

        <div className="mt-6 space-y-4 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold">{formatVND(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Discount</span>
            <span className="font-semibold">-{formatVND(discount)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Shipping</span>
            <span className="font-semibold">{formatVND(shippingFee)}</span>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-900 font-semibold">Total</span>
            <span className="text-xl font-semibold" style={{ color: ACCENT }}>
              {formatVND(grandTotal)}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="mt-7 h-12 w-full text-[12px] font-semibold tracking-[0.22em] uppercase text-white disabled:opacity-60"
          style={{ backgroundColor: ACCENT }}
          onClick={() => navigate("/checkout")}
        >
          Proceed to checkout
        </button>

        <button
          type="button"
          className="mt-3 h-12 w-full text-[12px] font-semibold tracking-[0.22em] uppercase ring-1 ring-slate-200 text-slate-700 hover:ring-[rgba(213,176,160,0.55)] disabled:opacity-60"
          disabled={clearing}
          onClick={onClear}
        >
          {clearing ? "CLEARING..." : "Clear cart"}
        </button>

        <div className="mt-6 text-xs leading-6 text-slate-500">
          By placing your order, you agree to our terms and rental policy.
        </div>
      </div>
    </div>
  );
}
