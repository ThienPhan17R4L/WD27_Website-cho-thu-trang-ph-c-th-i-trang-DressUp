import { apiGet } from "@/lib/api";

export type AvailabilityResult = {
  available: boolean;
  totalStock: number;
  reserved: number;
};

export type CalendarDay = {
  date: string;
  totalStock: number;
  reserved: number;
  available: number;
};

export const availabilityApi = {
  check: (params: {
    productId: string;
    size: string;
    color?: string;
    startDate: string;
    endDate: string;
    quantity?: number;
  }) => apiGet<AvailabilityResult>("/availability/check", params),

  calendar: (params: {
    productId: string;
    size: string;
    color?: string;
    year: number;
    month: number;
  }) => apiGet<CalendarDay[]>("/availability/calendar", params),
};
