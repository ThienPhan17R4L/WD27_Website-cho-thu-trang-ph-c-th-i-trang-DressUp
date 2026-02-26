import { apiGet } from "@/lib/api";

export type RevenueDay = {
  date: string;
  revenue: number;
  count: number;
};

export type DashboardOverview = {
  ordersToday: number;
  activeRentals: number;
  overdueCount: number;
  pendingReturns: number;
  pendingPaymentCount: number;
  totalOrdersAllTime: number;
  revenue7Days: number;
  revenue7DaysFilled: RevenueDay[];
  revenueThisMonth: number;
  orderStatusBreakdown: Array<{ _id: string; count: number }>;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
  }>;
  newUsersToday: number;
  totalUsers: number;
};

export const dashboardApi = {
  overview: () => apiGet<DashboardOverview>("/admin/dashboard/overview"),
};
