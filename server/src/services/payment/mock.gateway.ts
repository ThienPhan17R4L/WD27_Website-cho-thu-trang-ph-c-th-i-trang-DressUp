import type { PaymentGateway, CreatePaymentParams, PaymentResult, CallbackResult } from "./payment.gateway";
import { env } from "../../config/env";
import { nanoid } from "nanoid";

const mockPayments = new Map<string, { paid: boolean; transactionId: string }>();

export class MockGateway implements PaymentGateway {
  name = "mock";

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const transactionId = `MOCK_${nanoid(12)}`;
    mockPayments.set(params.orderId, { paid: false, transactionId });

    // In mock mode, auto-confirm the payment via returnUrl
    const payUrl = `${env.APP_ORIGIN}/orders?mockPayment=success&orderId=${params.orderId}&transactionId=${transactionId}`;

    return {
      success: true,
      payUrl,
      transactionId,
      message: "Mock payment created",
    };
  }

  async verifyCallback(data: any): Promise<CallbackResult> {
    const { orderId, transactionId } = data;
    const payment = mockPayments.get(orderId);

    if (payment) {
      payment.paid = true;
    }

    return {
      success: true,
      orderId,
      transactionId: transactionId || payment?.transactionId,
    };
  }

  async checkStatus(orderId: string) {
    const payment = mockPayments.get(orderId);
    return {
      paid: payment?.paid ?? false,
      transactionId: payment?.transactionId,
    };
  }
}
