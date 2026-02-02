import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { EmailVerificationTokenModel } from "../models/EmailVerificationToken";
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError
} from "../utils/errors";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAccessToken, verifyAccessToken } from "../utils/jwt";
import { sendEmail } from "../utils/email";
import bcrypt from "bcrypt";

function minutesFromNow(min: number) {
  return new Date(Date.now() + min * 60_000);
}

// Hash verify token (store hashed token in DB)
async function hashToken(raw: string) {
  return bcrypt.hash(raw, 10);
}
async function verifyTokenHash(raw: string, hash: string) {
  return bcrypt.compare(raw, hash);
}

export const authService = {
  async register(input: { email: string; password: string; fullName: string; phone?: string }) {
    const { email, password, fullName, phone } = input;

    // Fast path (still rely on unique index for race condition)
    const exists = await UserModel.findOne({ email }).lean();
    if (exists) throw new ConflictError("EMAIL_EXISTS", "Email already registered");

    const passwordHash = await hashPassword(password);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const created = await new UserModel({
        email,
        passwordHash,
        fullName,
        phone: phone || undefined,
        isEmailVerified: env.REQUIRE_EMAIL_VERIFICATION ? false : true
      }).save({ session });


      let verifyLink: string | null = null;

      if (env.REQUIRE_EMAIL_VERIFICATION) {
        const rawToken = nanoid(48);
        const tokenHash = await hashToken(rawToken);

        await EmailVerificationTokenModel.create(
          [
            {
              userId: created._id,
              tokenHash,
              expiresAt: minutesFromNow(env.EMAIL_VERIFY_TOKEN_TTL_MINUTES)
            }
          ],
          { session }
        );

        verifyLink = `${env.API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
      }

      await session.commitTransaction();
      session.endSession();

      // Send email outside transaction
      if (env.REQUIRE_EMAIL_VERIFICATION && verifyLink) {
        await sendEmail({
          to: email,
          subject: "Verify your email",
          html: `
            <p>Hi ${fullName},</p>
            <p>Please verify your email by clicking the link below:</p>
            <p><a href="${verifyLink}">Verify Email</a></p>
            <p>This link expires in ${env.EMAIL_VERIFY_TOKEN_TTL_MINUTES} minutes.</p>
          `
        });
      }

      // If verification required: do not issue token
      if (env.REQUIRE_EMAIL_VERIFICATION) {
        return {
          user: this.sanitizeUser(created),
          requiresEmailVerification: true
        };
      }

      // If verification not required: issue access token
      const accessToken = signAccessToken(String(created._id));
      return {
        user: this.sanitizeUser(created),
        accessToken,
        requiresEmailVerification: false
      };
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  },

  async verifyEmail(rawToken: string) {
    if (!rawToken) throw new BadRequestError("TOKEN_REQUIRED", "Token is required");

    // Find candidates that are valid (token is hashed so must compare)
    const candidates = await EmailVerificationTokenModel.find({
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    for (const doc of candidates) {
      const ok = await verifyTokenHash(rawToken, doc.tokenHash);
      if (!ok) continue;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        await EmailVerificationTokenModel.updateOne(
          { _id: doc._id },
          { $set: { usedAt: new Date() } },
          { session }
        );

        await UserModel.updateOne(
          { _id: doc.userId },
          { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } },
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        return { ok: true };
      } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw e;
      }
    }

    throw new BadRequestError("INVALID_OR_EXPIRED_TOKEN", "Token is invalid or expired");
  },

  async login(input: { email: string; password: string }) {
    const { email, password } = input;

    const user = await UserModel.findOne({ email });
    if (!user) throw new UnauthorizedError("INVALID_CREDENTIALS", "Invalid email or password");

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedError("INVALID_CREDENTIALS", "Invalid email or password");

    if (env.REQUIRE_EMAIL_VERIFICATION && !user.isEmailVerified) {
      throw new ForbiddenError("EMAIL_NOT_VERIFIED", "Email is not verified");
    }

    const accessToken = signAccessToken(String(user._id));
    return {
      user: this.sanitizeUser(user),
      accessToken
    };
  },

  async me(accessToken: string) {
    const payload = verifyAccessToken(accessToken);
    if (payload.type !== "access") throw new UnauthorizedError("INVALID_TOKEN", "Invalid token");

    const user = await UserModel.findById(payload.sub);
    if (!user) throw new UnauthorizedError("USER_NOT_FOUND", "User not found");

    return { user: this.sanitizeUser(user) };
  },

  sanitizeUser(user: any) {
    return {
      id: String(user._id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? null,
      role: user.role,
      isEmailVerified: Boolean(user.isEmailVerified),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
};
