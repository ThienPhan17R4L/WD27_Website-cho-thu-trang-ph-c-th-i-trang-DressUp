export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate rental dates
 * Rules:
 * - Start date must be today or in the future
 * - End date must be after start date
 * - Start date cannot be more than 30 days from today
 */
export function validateRentalDates(
  start: string,
  end: string
): DateValidationResult {
  if (!start || !end) {
    return { isValid: false, error: "Please select both dates" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Rule 1: Start >= today
  if (startDate < today) {
    return { isValid: false, error: "Start date cannot be in the past" };
  }

  // Rule 2: End > Start
  if (endDate <= startDate) {
    return { isValid: false, error: "End date must be after start date" };
  }

  // Rule 3: Start not more than 30 days
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);
  if (startDate > maxDate) {
    return { isValid: false, error: "Cannot book more than 30 days in advance" };
  }

  return { isValid: true };
}
