import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { StringValue } from "ms";

export type AccessTokenPayload = {
  sub: string; // userId
  type: "access";
};

export function signAccessToken(userId: string) {
  const payload: AccessTokenPayload = { sub: userId, type: "access" };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}
