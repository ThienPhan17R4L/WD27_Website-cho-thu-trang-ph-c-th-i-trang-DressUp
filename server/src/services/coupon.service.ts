import { CouponModel } from "../models/Coupon";
import { NotFoundError, BadRequestError } from "../utils/errors";

export const couponService = {
  async validate(code: string, orderSubtotal: number) {
    const coupon = await CouponModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() },
    });

    if (!coupon) {
      throw new NotFoundError("COUPON_NOT_FOUND", "Coupon not found or expired");
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestError("COUPON_EXHAUSTED", "Coupon usage limit reached");
    }

    if (coupon.minOrderValue && orderSubtotal < coupon.minOrderValue) {
      throw new BadRequestError(
        "MIN_ORDER_VALUE",
        `Minimum order value is ${coupon.minOrderValue} VND`
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.round(orderSubtotal * (coupon.value / 100));
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, orderSubtotal);

    return { coupon, discount };
  },

  async applyCoupon(code: string) {
    await CouponModel.updateOne(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
  },

  // Admin CRUD
  async list(filters: { page?: number; limit?: number; isActive?: boolean }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const [data, total] = await Promise.all([
      CouponModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CouponModel.countDocuments(query),
    ]);

    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  async create(data: Record<string, unknown>) {
    return CouponModel.create(data);
  },

  async update(id: string, data: Record<string, unknown>) {
    const coupon = await CouponModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!coupon) throw new NotFoundError("COUPON_NOT_FOUND", "Coupon not found");
    return coupon;
  },

  async remove(id: string) {
    const coupon = await CouponModel.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundError("COUPON_NOT_FOUND", "Coupon not found");
    return { ok: true };
  },
};
