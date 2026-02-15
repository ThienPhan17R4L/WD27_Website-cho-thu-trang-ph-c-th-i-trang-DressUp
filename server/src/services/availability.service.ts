import { RentalReservationModel } from "../models/RentalReservation";
import { InventoryModel } from "../models/Inventory";
import { env } from "../config/env";
import { BadRequestError } from "../utils/errors";
import { Types } from "mongoose";

function minutesFromNow(min: number) {
  return new Date(Date.now() + min * 60_000);
}

export const availabilityService = {
  /**
   * Check if a variant is available for a given date range
   */
  async checkAvailability(
    productId: string,
    size: string,
    color: string | undefined,
    startDate: Date,
    endDate: Date,
    quantity: number = 1
  ): Promise<{ available: boolean; totalStock: number; reserved: number }> {
    // Get total stock
    const colorFilter = color ? { "variantKey.color": color } : {};
    const inventory = await InventoryModel.findOne({
      productId,
      "variantKey.size": size,
      ...colorFilter,
    });

    if (!inventory) {
      return { available: false, totalStock: 0, reserved: 0 };
    }

    // Count overlapping active reservations
    const reserved = await this.countOverlappingReservations(
      productId, size, color, startDate, endDate
    );

    const available = inventory.qtyTotal - reserved >= quantity;
    return { available, totalStock: inventory.qtyTotal, reserved };
  },

  /**
   * Count overlapping reservations for a variant in a date range
   */
  async countOverlappingReservations(
    productId: string,
    size: string,
    color: string | undefined,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const colorFilter = color ? { "variantKey.color": color } : {};
    const reservations = await RentalReservationModel.aggregate([
      {
        $match: {
          productId: new Types.ObjectId(productId),
          "variantKey.size": size,
          ...colorFilter,
          status: { $in: ["hold", "confirmed"] },
          startDate: { $lt: endDate },
          endDate: { $gt: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalQty: { $sum: "$quantity" },
        },
      },
    ]);

    return reservations.length > 0 ? reservations[0].totalQty : 0;
  },

  /**
   * Create a hold reservation (with TTL)
   */
  async createHold(
    userId: string,
    productId: string,
    size: string,
    color: string | undefined,
    startDate: Date,
    endDate: Date,
    quantity: number = 1
  ) {
    // First check availability
    const { available } = await this.checkAvailability(
      productId, size, color, startDate, endDate, quantity
    );
    if (!available) {
      throw new BadRequestError("NOT_AVAILABLE", "This variant is not available for the selected dates");
    }

    return RentalReservationModel.create({
      productId,
      variantKey: { size, color },
      userId,
      startDate,
      endDate,
      quantity,
      status: "hold",
      expiresAt: minutesFromNow(env.RESERVATION_TTL_MINUTES),
    } as any);
  },

  /**
   * Confirm a hold reservation (remove TTL, link to order)
   */
  async confirmReservation(reservationId: string, orderId: string) {
    await RentalReservationModel.updateOne(
      { _id: reservationId, status: "hold" },
      {
        $set: { status: "confirmed", orderId },
        $unset: { expiresAt: 1 },
      }
    );
  },

  /**
   * Release a reservation
   */
  async releaseReservation(reservationId: string) {
    await RentalReservationModel.updateOne(
      { _id: reservationId },
      { $set: { status: "released" } }
    );
  },

  /**
   * Release all reservations for an order
   */
  async releaseByOrder(orderId: string) {
    await RentalReservationModel.updateMany(
      { orderId, status: { $in: ["hold", "confirmed"] } },
      { $set: { status: "released" } }
    );
  },

  /**
   * Get availability calendar for a month
   */
  async getCalendar(
    productId: string,
    size: string,
    color: string | undefined,
    year: number,
    month: number
  ) {
    const colorFilter = color ? { "variantKey.color": color } : {};
    const inventory = await InventoryModel.findOne({
      productId,
      "variantKey.size": size,
      ...colorFilter,
    });

    if (!inventory) return [];

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const reservations = await RentalReservationModel.find({
      productId: new Types.ObjectId(productId),
      "variantKey.size": size,
      ...colorFilter,
      status: { $in: ["hold", "confirmed"] },
      startDate: { $lte: endOfMonth },
      endDate: { $gte: startOfMonth },
    });

    const daysInMonth = endOfMonth.getDate();
    const calendar = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const nextDay = new Date(year, month - 1, day + 1);

      let reserved = 0;
      for (const r of reservations) {
        if (r.startDate < nextDay && r.endDate > date) {
          reserved += r.quantity;
        }
      }

      calendar.push({
        date: date.toISOString().split("T")[0],
        totalStock: inventory.qtyTotal,
        reserved,
        available: inventory.qtyTotal - reserved,
      });
    }

    return calendar;
  },
};
