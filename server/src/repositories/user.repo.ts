import { UserModel } from "../models/User";

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email: email.toLowerCase() }).exec();
}

export async function updateLastLogin(userId: string) {
  return UserModel.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } }).exec();
}
