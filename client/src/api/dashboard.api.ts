import { apiGet } from "@/lib/api";

export type DashboardOverview = {
  ordersToday: number;
  activeRentals: number;
  overdueCount: number;
  pendingReturns: number;
  revenue7Days: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
};

export const dashboardApi = {
  overview: () => apiGet<DashboardOverview>("/admin/dashboard/overview"),
};
