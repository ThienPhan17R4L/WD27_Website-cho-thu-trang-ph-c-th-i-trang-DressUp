import { useNavigate } from "react-router-dom";
import { formatVND } from "@/utils/formatCurrency";

const ACCENT = "rgb(213, 176, 160)";

type SelectedItem = {
  _id: string;
  lineTotal?: number;
  deposit?: number;
  quantity: number;
};

export function CartSummary({
  totals,
  onClear,
  clearing,
  selectedItems,
}: {
  totals?: { subtotal?: number; discount?: number; shippingFee?: number; grandTotal?: number; itemCount?: number };
  onClear: () => void;
  clearing?: boolean;
  selectedItems?: SelectedItem[];
}) {
  const navigate = useNavigate();

  // If selectedItems is provided, compute partial totals from them
  const hasSelection = selectedItems !== undefined;
  const selectedSubtotal = hasSelection
    ? selectedItems.reduce((sum, it) => sum + (it.lineTotal ?? 0), 0)
    : (totals?.subtotal ?? 0);
  const selectedDiscount = hasSelection ? 0 : (totals?.discount ?? 0);
  const shippingFee = totals?.shippingFee ?? 0;
  const grandTotal = hasSelection
    ? Math.max(0, selectedSubtotal + shippingFee)
    : (totals?.grandTotal ?? Math.max(0, (totals?.subtotal ?? 0) - (totals?.discount ?? 0) + shippingFee));

  const selectedCount = hasSelection ? selectedItems.length : (totals?.itemCount ?? 0);

  function handleCheckout() {
    if (hasSelection && selectedItems.length > 0) {
      const ids = selectedItems.map((it) => it._id);
      sessionStorage.setItem("checkout_item_ids", JSON.stringify(ids));
    } else {
      sessionStorage.removeItem("checkout_item_ids");
    }
    navigate("/checkout");
  }

  return (
    <div className="bg-white ring-1 ring-slate-200">
      <div className="p-7">
        <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
          Tổng giỏ hàng
        </div>

        {hasSelection && (
          <div className="mt-3 text-xs text-slate-500">
            Đã chọn {selectedCount} sản phẩm
          </div>
        )}

        <div className="mt-6 space-y-4 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Tạm tính</span>
            <span className="font-semibold">{formatVND(selectedSubtotal)}</span>
          </div>

          {!hasSelection && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Giảm giá</span>
              <span className="font-semibold">-{formatVND(selectedDiscount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Vận chuyển</span>
            <span className="font-semibold">{formatVND(shippingFee)}</span>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-900 font-semibold">Tổng cộng</span>
            <span className="text-xl font-semibold" style={{ color: ACCENT }}>
              {formatVND(grandTotal)}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="mt-7 h-12 w-full text-[12px] font-semibold tracking-[0.22em] uppercase text-white disabled:opacity-60"
          style={{ backgroundColor: ACCENT }}
          disabled={hasSelection && selectedItems.length === 0}
          onClick={handleCheckout}
        >
          TIẾN HÀNH THANH TOÁN{hasSelection && selectedCount > 0 ? ` (${selectedCount})` : ""}
        </button>

        <button
          type="button"
          className="mt-3 h-12 w-full text-[12px] font-semibold tracking-[0.22em] uppercase ring-1 ring-slate-200 text-slate-700 hover:ring-[rgba(213,176,160,0.55)] disabled:opacity-60"
          disabled={clearing}
          onClick={onClear}
        >
          {clearing ? "ĐANG XÓA..." : "Xóa giỏ hàng"}
        </button>

        <div className="mt-6 text-xs leading-6 text-slate-500">
          Khi đặt hàng, bạn đồng ý với điều khoản và chính sách thuê của chúng tôi.
        </div>
      </div>
    </div>
  );
}
