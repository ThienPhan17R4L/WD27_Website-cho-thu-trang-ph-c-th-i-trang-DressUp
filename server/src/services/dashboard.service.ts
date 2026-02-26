import { OrderModel } from "../models/Order";
import { ReturnModel } from "../models/Return";

export const dashboardService = {
  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      ordersToday,
      activeRentals,
      overdueCount,
      pendingReturns,
      revenue7Days,
      recentOrders,
    ] = await Promise.all([
      OrderModel.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      }),
      OrderModel.countDocuments({
        status: { $in: ["active_rental", "delivered", "renting"] },
      }),
      OrderModel.countDocuments({
        status: "overdue",
      }),
      ReturnModel.countDocuments({
        status: "pending_inspection",
      }),
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber status total paymentStatus createdAt")
        .lean(),
    ]);

    return {
      ordersToday,
      activeRentals,
      overdueCount,
      pendingReturns,
      revenue7Days,
      recentOrders,
    };
  },
};
