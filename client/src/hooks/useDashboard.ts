import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard.api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.overview(),
    refetchInterval: 60_000, // Refresh every 60 seconds
  });
}
