/**
 * Date validation utilities for rental dates
 */

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate rental dates with business rules:
 * - Start date must be today or future
 * - End date must be after start date
 * - Start date cannot be more than 30 days in advance
 */
export function validateRentalDates(
  start: string,
  end: string
): DateValidationResult {
  if (!start || !end) {
    return {
      isValid: false,
      error: "Vui lòng chọn ngày bắt đầu và kết thúc",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Rule 1: Start date must be today or future
  if (startDate < today) {
    return {
      isValid: false,
      error: "Ngày bắt đầu không thể là quá khứ",
    };
  }

  // Rule 2: End date must be after start date
  if (endDate <= startDate) {
    return {
      isValid: false,
      error: "Ngày kết thúc phải sau ngày bắt đầu",
    };
  }

  // Rule 3: Start date not more than 30 days in advance
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  if (startDate > maxDate) {
    return {
      isValid: false,
      error: "Không thể đặt trước quá 30 ngày",
    };
  }

  return { isValid: true };
}

/**
 * Calculate number of days between two dates
 */
export function calculateDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format date for display (Vietnamese locale)
 */
export function formatDateVN(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
