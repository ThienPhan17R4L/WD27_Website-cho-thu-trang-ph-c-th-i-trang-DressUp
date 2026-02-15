import { UserModel } from "../models/User";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/errors";
import { hashPassword } from "../utils/password";

interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const adminUserService = {
  async listUsers(query: ListUsersQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { fullName: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }
    if (query.role) {
      filter.roles = query.role;
    }
    if (query.status) {
      filter.status = query.status;
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select("-passwordHash -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    return {
      data: users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select("-passwordHash -__v").lean();
    if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");
    return user;
  },

  async createStaff(input: { email: string; password: string; fullName: string; phone?: string }) {
    const { email, password, fullName, phone } = input;

    const exists = await UserModel.findOne({ email }).lean();
    if (exists) throw new ConflictError("EMAIL_EXISTS", "Email đã tồn tại");

    const passwordHash = await hashPassword(password);

    const user = await new UserModel({
      email,
      passwordHash,
      fullName,
      phone: phone || undefined,
      roles: ["staff"],
      status: "active",
      isEmailVerified: true,
    }).save();

    const obj = user.toObject();
    const { passwordHash: _ph, __v, ...safe } = obj as any;
    return safe;
  },

  async updateRoles(userId: string, roles: string[]) {
    const validRoles = ["user", "admin", "staff"];
    for (const r of roles) {
      if (!validRoles.includes(r)) {
        throw new BadRequestError("INVALID_ROLE", `Invalid role: ${r}`);
      }
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { roles } },
      { new: true, runValidators: true }
    ).select("-passwordHash -__v");

    if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");
    return user;
  },

  async blockUser(userId: string, reason?: string) {
    const user = await UserModel.findById(userId).select("-passwordHash -__v");
    if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");

    const roles: string[] = (user as any).roles || [];
    const isStaff = roles.includes("staff");
    if (!isStaff && !reason) {
      throw new BadRequestError("REASON_REQUIRED", "Phải nhập lý do khi khoá tài khoản người dùng");
    }

    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { status: "blocked", blockReason: reason || undefined } },
      { new: true }
    ).select("-passwordHash -__v");

    return updated;
  },

  async unblockUser(userId: string) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { status: "active" }, $unset: { blockReason: 1 } },
      { new: true }
    ).select("-passwordHash -__v");
    if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");
    return user;
  },
};
