import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDb() {
  if (!env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(env.MONGODB_URI);
  logger.info("MongoDB connected");
}
