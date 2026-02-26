import { OrderModel } from "../models/Order";
import { ReturnModel } from "../models/Return";
import { UserModel } from "../models/User";

export const dashboardService = {
  async getOverview() {
    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      ordersToday,
      activeRentals,
      overdueCount,
      pendingReturns,
      pendingPaymentCount,
      totalOrdersAllTime,
      revenueByDay,
      revenueThisMonthAgg,
      orderStatusBreakdown,
      recentOrders,
      newUsersToday,
      totalUsers,
    ] = await Promise.all([
      // Đơn hàng hôm nay
      OrderModel.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),

      // Đang cho thuê (đã giao + đang thuê)
      OrderModel.countDocuments({
        status: { $in: ["active_rental", "delivered", "renting"] },
      }),

      // Quá hạn trả
      OrderModel.countDocuments({ status: "overdue" }),

      // Chờ kiểm tra trả hàng
      ReturnModel.countDocuments({ status: "pending_inspection" }),

      // Chờ thanh toán
      OrderModel.countDocuments({ status: "pending_payment" }),

      // Tổng đơn hàng tất cả thời gian
      OrderModel.countDocuments(),

      // Doanh thu theo ngày 7 ngày gần nhất (đơn đã thanh toán)
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Doanh thu tháng này (đơn đã thanh toán)
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: firstOfMonth },
            paymentStatus: "paid",
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // Phân tích số đơn theo trạng thái
      OrderModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Đơn hàng gần đây
      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("orderNumber status total paymentStatus paymentMethod createdAt")
        .lean(),

      // Người dùng mới hôm nay
      UserModel.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),

      // Tổng khách hàng (role = user)
      UserModel.countDocuments({ roles: "user" }),
    ]);

    // Fill missing days in 7-day range with 0
    const revenueMap: Record<string, { revenue: number; count: number }> = {};
    for (const row of revenueByDay) {
      revenueMap[row._id] = { revenue: row.revenue, count: row.count };
    }
    const revenue7DaysFilled: Array<{ date: string; revenue: number; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]!;
      revenue7DaysFilled.push({
        date: key,
        revenue: revenueMap[key]?.revenue ?? 0,
        count: revenueMap[key]?.count ?? 0,
      });
    }

    const revenue7Days = revenue7DaysFilled.reduce((s, r) => s + r.revenue, 0);

    return {
      ordersToday,
      activeRentals,
      overdueCount,
      pendingReturns,
      pendingPaymentCount,
      totalOrdersAllTime,
      revenue7Days,
      revenue7DaysFilled,
      revenueThisMonth: revenueThisMonthAgg[0]?.total ?? 0,
      orderStatusBreakdown: orderStatusBreakdown as Array<{ _id: string; count: number }>,
      recentOrders,
      newUsersToday,
      totalUsers,
    };
  },
};
