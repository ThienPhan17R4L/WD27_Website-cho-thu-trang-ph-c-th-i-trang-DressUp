/**
 * Format number to Vietnamese Dong currency
 * @param amount - Amount in VND
 * @returns Formatted string like "500.000 ₫"
 */
export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Custom VND format without currency symbol
 * @param amount - Amount in VND
 * @returns Formatted string like "1.200.000₫"
 */
export function formatVNDCustom(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫";
}
