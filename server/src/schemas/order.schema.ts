import { z } from "zod";

const shippingAddressSchema = z.object({
  receiverName: z.string().min(1, "Receiver name is required"),
  receiverPhone: z.string().regex(/^[0-9]{10,11}$/, "Invalid phone number"),
  line1: z.string().min(1, "Address is required"),
  ward: z.string().min(1, "Ward is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().default("VN"),
  postalCode: z.string().optional(),
});

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["cod", "vnpay", "momo", "zalopay"]),
  notes: z.string().optional(),
});
