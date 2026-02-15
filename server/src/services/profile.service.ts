import { UserModel } from "../models/User";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { hashPassword, verifyPassword } from "../utils/password";
import type { UpdateProfileInput, ChangePasswordInput } from "../schemas/profile.schema";

export const profileService = {
  async getProfile(userId: string) {
    const user = await UserModel.findById(userId).select("-passwordHash -__v");
    if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");
    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const update: Record<string, unknown> = {};
    if (data.fullName !== undefined) update.fullName = data.fullName;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.dob !== undefined) update.dob = new Date(data.dob);
    if (data.gender !== undefined) update.gender = data.gender;
    if (data.avatarUrl !== undefined) update.avatarUrl = data.avatarUrl;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-passwordHash -__v");

    if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");
    return user;
  },

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");

    const ok = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!ok) throw new BadRequestError("WRONG_PASSWORD", "Current password is incorrect");

    user.passwordHash = await hashPassword(data.newPassword);
    await user.save();
    return { ok: true };
  },
};
