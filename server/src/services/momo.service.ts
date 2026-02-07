/**
 * MoMo Payment Service (MOCK)
 * This is a mock implementation for testing purposes.
 * Real implementation requires Partner Code, Access Key, and Secret Key from MoMo.
 *
 * For production, register at: https://business.momo.vn
 * API Endpoint: https://test-payment.momo.vn/v2/gateway/api/create
 */

export interface MoMoCreatePaymentRequest {
  orderId: string; // Order ID from your system
  amount: number; // Total amount in VND
  orderInfo: string; // Order description
  returnUrl: string; // URL to redirect after payment
  notifyUrl: string; // URL for IPN callback
}

export interface MoMoCreatePaymentResponse {
  payUrl: string; // URL to redirect user for payment
  qrCodeUrl: string; // QR code image URL
  deeplink: string; // Deep link for MoMo app
}

export interface MoMoCallbackData {
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: string;
  resultCode: number; // 0 = success, other = failed
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

export const MoMoService = {
  /**
   * Create MoMo payment (MOCK - no real API call)
   */
  async createPayment(request: MoMoCreatePaymentRequest): Promise<MoMoCreatePaymentResponse> {
    // MOCK: Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // MOCK: Generate fake payment URL
    const mockPayUrl = `https://test-payment.momo.vn/gw_payment/payment/qr?partnerCode=MOCK&orderId=${encodeURIComponent(
      request.orderId
    )}&amount=${request.amount}`;

    // MOCK: Generate fake QR code URL
    const mockQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      mockPayUrl
    )}`;

    // MOCK: Generate fake deeplink
    const mockDeeplink = `momo://app?action=payWithApp&orderId=${encodeURIComponent(
      request.orderId
    )}&amount=${request.amount}`;

    console.log("[MOMO] Mock payment created:", {
      orderId: request.orderId,
      amount: request.amount,
      payUrl: mockPayUrl,
    });

    return {
      payUrl: mockPayUrl,
      qrCodeUrl: mockQrCode,
      deeplink: mockDeeplink,
    };
  },

  /**
   * Verify MoMo signature (MOCK - always returns true)
   * Real implementation uses HMAC-SHA256 with Secret Key
   */
  verifySignature(data: MoMoCallbackData, signature: string): boolean {
    // MOCK: For testing, always return true
    // Real implementation:
    // const rawSignature = `accessKey=${accessKey}&amount=${data.amount}&...`;
    // const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    // return signature === expectedSignature;

    console.log("[MOMO] Mock signature verification (always true)");
    return true;
  },

  /**
   * Handle MoMo IPN callback
   */
  async handleCallback(data: MoMoCallbackData): Promise<{
    success: boolean;
    orderId: string;
    transId?: string;
    message?: string;
  }> {
    const { orderId, resultCode, message, transId } = data;

    if (resultCode === 0) {
      console.log(`[MOMO] Payment successful for order ${orderId}, transId: ${transId}`);
      return {
        success: true,
        orderId,
        transId,
      };
    } else {
      console.log(`[MOMO] Payment failed for order ${orderId}: ${message}`);
      return {
        success: false,
        orderId,
        message,
      };
    }
  },

  /**
   * For testing: simulate a successful payment callback
   */
  mockSuccessCallback(orderId: string): MoMoCallbackData {
    return {
      orderId,
      requestId: `MOCK_REQ_${Date.now()}`,
      amount: 100000,
      orderInfo: `Mock payment for ${orderId}`,
      orderType: "momo_wallet",
      transId: `MOCK_TRANS_${Date.now()}`,
      resultCode: 0,
      message: "Successful.",
      payType: "qr",
      responseTime: Date.now(),
      extraData: "",
      signature: "mock_signature",
    };
  },
};
