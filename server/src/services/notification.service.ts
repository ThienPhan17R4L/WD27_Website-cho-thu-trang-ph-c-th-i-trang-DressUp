import { sendEmail } from "../utils/email";
import { UserModel } from "../models/User";
import { logger } from "../utils/logger";

export type NotificationType =
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "RENTAL_STARTING"
  | "RENTAL_OVERDUE"
  | "RETURN_APPROVED"
  | "REFUND_PROCESSED";

const TEMPLATES: Record<NotificationType, { subject: string; getMessage: (data: any) => string }> = {
  ORDER_CONFIRMED: {
    subject: "Đơn hàng đã được xác nhận - DressUp",
    getMessage: (d) => `Đơn hàng #${d.orderNumber} đã được xác nhận. Chúng tôi đang chuẩn bị đơn hàng cho bạn.`,
  },
  ORDER_SHIPPED: {
    subject: "Đơn hàng đang vận chuyển - DressUp",
    getMessage: (d) => `Đơn hàng #${d.orderNumber} đang trên đường giao đến bạn.`,
  },
  RENTAL_STARTING: {
    subject: "Thời gian thuê bắt đầu - DressUp",
    getMessage: (d) => `Thời gian thuê cho đơn hàng #${d.orderNumber} đã bắt đầu.`,
  },
  RENTAL_OVERDUE: {
    subject: "Đơn hàng quá hạn trả - DressUp",
    getMessage: (d) => `Đơn hàng #${d.orderNumber} đã quá hạn trả. Vui lòng trả đồ sớm để tránh phí phạt.`,
  },
  RETURN_APPROVED: {
    subject: "Kiểm tra hàng hoàn tất - DressUp",
    getMessage: (d) => {
      let msg = `Đồ trả cho đơn hàng #${d.orderNumber} đã được kiểm tra xong.\n`;
      if ((d.lateFee as number) > 0)
        msg += `• Phí trễ hạn: ${(d.lateFee as number).toLocaleString("vi-VN")} VND\n`;
      if ((d.totalDamageFee as number) > 0)
        msg += `• Phí hư hại: ${(d.totalDamageFee as number).toLocaleString("vi-VN")} VND\n`;
      msg += `• Hoàn cọc: ${(d.depositRefundAmount as number).toLocaleString("vi-VN")} VND`;
      return msg;
    },
  },
  REFUND_PROCESSED: {
    subject: "Hoàn tiền đặt cọc - DressUp",
    getMessage: (d) => `Đặt cọc ${d.amount?.toLocaleString()} VND cho đơn hàng #${d.orderNumber} đã được hoàn.`,
  },
};

export const notificationService = {
  async notify(userId: string, type: NotificationType, data: Record<string, unknown>) {
    const template = TEMPLATES[type];
    const message = template.getMessage(data);

    // Always log the notification
    logger.info(`[NOTIFICATION] ${type} -> user:${userId}: ${message}`, data);

    // Optionally send email
    try {
      const user = await UserModel.findById(userId).select("email fullName").lean();
      if (user) {
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: `<p>Hi ${user.fullName},</p><p>${message}</p>`,
        });
      }
    } catch (err) {
      logger.warn("Failed to send notification email", { userId, type, error: String(err) });
    }
  },
};
