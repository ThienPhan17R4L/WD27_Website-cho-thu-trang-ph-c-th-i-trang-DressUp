import { useState } from "react";
import { useValidateCoupon } from "@/hooks/useCoupons";
import { formatVND } from "@/utils/formatCurrency";

interface Props {
  subtotal: number;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  appliedCode?: string;
  appliedDiscount?: number;
}

export function CouponInput({ subtotal, onApply, onRemove, appliedCode, appliedDiscount }: Props) {
  const [code, setCode] = useState("");
  const validateMutation = useValidateCoupon();

  const handleApply = async () => {
    if (!code.trim()) return;
    try {
      const result = await validateMutation.mutateAsync({
        code: code.trim(),
        orderSubtotal: subtotal,
      });
      onApply(code.trim().toUpperCase(), result.discount);
      setCode("");
    } catch {
      // Error handled by mutation
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2">
        <div>
          <span className="text-sm font-medium text-green-700">{appliedCode}</span>
          <span className="ml-2 text-xs text-green-600">
            -{formatVND(appliedDiscount || 0)}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-xs text-red-500 hover:underline"
        >
          Xoá
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Nhập mã giảm giá"
        className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm uppercase focus:border-rose-400 focus:outline-none"
      />
      <button
        onClick={handleApply}
        disabled={!code.trim() || validateMutation.isPending}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900 disabled:opacity-50"
      >
        {validateMutation.isPending ? "..." : "Áp dụng"}
      </button>
      {validateMutation.isError && (
        <p className="mt-1 text-xs text-red-500">
          {(validateMutation.error as Error)?.message || "Mã không hợp lệ"}
        </p>
      )}
    </div>
  );
}
