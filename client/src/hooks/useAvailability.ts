import { useQuery } from "@tanstack/react-query";
import { availabilityApi } from "@/api/availability.api";

export function useAvailabilityCheck(params: {
  productId: string;
  size: string;
  color?: string;
  startDate: string;
  endDate: string;
  quantity?: number;
}) {
  return useQuery({
    queryKey: ["availability", params],
    queryFn: () => availabilityApi.check(params),
    enabled: !!(params.productId && params.size && params.startDate && params.endDate),
  });
}

export function useAvailabilityCalendar(params: {
  productId: string;
  size: string;
  color?: string;
  year: number;
  month: number;
}) {
  return useQuery({
    queryKey: ["availability-calendar", params],
    queryFn: () => availabilityApi.calendar(params),
    enabled: !!(params.productId && params.size),
  });
}
