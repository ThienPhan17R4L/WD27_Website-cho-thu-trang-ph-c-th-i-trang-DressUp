import { formatVND } from "@/utils/formatCurrency";

interface Props {
  subtotal: number;
  shippingFee: number;
  serviceFee: number;
  discount: number;
  couponDiscount: number;
  totalDeposit: number;
  total: number;
}

export function PricingSummary({
  subtotal,
  shippingFee,
  serviceFee,
  discount,
  couponDiscount,
  totalDeposit,
  total,
}: Props) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-500">Tạm tính</span>
        <span className="text-slate-700">{formatVND(subtotal)}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Phí vận chuyển</span>
        <span className="text-slate-700">
          {shippingFee > 0 ? formatVND(shippingFee) : "Miễn phí"}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Phí dịch vụ</span>
        <span className="text-slate-700">{formatVND(serviceFee)}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Giảm giá</span>
          <span>-{formatVND(discount)}</span>
        </div>
      )}

      {couponDiscount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Mã giảm giá</span>
          <span>-{formatVND(couponDiscount)}</span>
        </div>
      )}

      {totalDeposit > 0 && (
        <div className="flex justify-between text-amber-600">
          <span>Tiền đặt cọc</span>
          <span>{formatVND(totalDeposit)}</span>
        </div>
      )}

      <div className="border-t border-slate-200 pt-2">
        <div className="flex justify-between font-semibold">
          <span className="text-slate-900">Tổng cộng</span>
          <span className="text-lg text-rose-600">{formatVND(total)}</span>
        </div>
      </div>
    </div>
  );
}
