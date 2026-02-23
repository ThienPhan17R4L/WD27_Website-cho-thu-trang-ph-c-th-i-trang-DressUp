/**
 * MoMo Payment Service (UAT - Test Environment)
 *
 * Tài liệu: https://developers.momo.vn
 * Environment: UAT (Test)
 * Endpoint: https://test-payment.momo.vn/v2/gateway/api/create
 *
 * Flow:
 * 1. Client tạo đơn hàng
 * 2. Server gọi MoMo API để tạo payment URL
 * 3. Client redirect đến payment URL
 * 4. User thanh toán trên MoMo
 * 5. MoMo gọi callback (IPN) về server
 * 6. Server xác thực signature và cập nhật trạng thái đơn hàng
 */

import crypto from "crypto";
import { env } from "../config/env";

export interface MoMoCreatePaymentRequest {
  orderId: string; // Order ID from your system
  amount: number; // Total amount in VND
  orderInfo: string; // Order description
  returnUrl?: string; // URL to redirect after payment (optional, will use env default)
  notifyUrl?: string; // URL for IPN callback (optional, will use env default)
  extraData?: string; // Additional data (optional)
}

export interface MoMoCreatePaymentResponse {
  payUrl: string; // URL to redirect user for payment
  qrCodeUrl: string; // QR code image URL
  deeplink: string; // Deep link for MoMo app
  deeplinkMiniApp?: string; // Deep link for MoMo Mini App
  requestId: string; // Request ID for tracking and querying transaction status
}

export interface MoMoCallbackData {
  partnerCode: string;
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

/**
 * Generate HMAC-SHA256 signature
 */
function generateSignature(data: string, secretKey: string): string {
  return crypto.createHmac("sha256", secretKey).update(data).digest("hex");
}

/**
 * Generate request ID (unique per request)
 */
function generateRequestId(): string {
  return `${env.MOMO_PARTNER_CODE}_${Date.now()}`;
}

export const MoMoService = {
  /**
   * Create MoMo payment (Real UAT API call)
   */
  async createPayment(request: MoMoCreatePaymentRequest): Promise<MoMoCreatePaymentResponse> {
    const partnerCode = env.MOMO_PARTNER_CODE;
    const accessKey = env.MOMO_ACCESS_KEY;
    const secretKey = env.MOMO_SECRET_KEY;

    if (!partnerCode || !accessKey || !secretKey) {
      throw new Error("MoMo credentials not configured. Please set MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, and MOMO_SECRET_KEY in .env");
    }

    const requestId = generateRequestId();
    const orderId = request.orderId;
    const orderInfo = request.orderInfo;
    const redirectUrl = request.returnUrl || env.MOMO_RETURN_URL;
    const ipnUrl = request.notifyUrl || env.MOMO_NOTIFY_URL;
    const amount = request.amount.toString();
    const extraData = request.extraData || "";
    const requestType = "payWithMethod"; // captureWallet, payWithMethod
    const lang = "vi";

    // Create raw signature string (按字母順序排列)
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // Generate signature
    const signature = generateSignature(rawSignature, secretKey);

    // Request body
    const requestBody = {
      partnerCode,
      partnerName: "DressUp",
      storeId: "DressUpStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    console.log("[MOMO] Creating payment:", {
      orderId,
      amount,
      requestId,
    });

    try {
      // Call MoMo API
      const response = await fetch(env.MOMO_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log("[MOMO] API Response:", {
        resultCode: data.resultCode,
        message: data.message,
      });

      // Check result code
      if (data.resultCode !== 0) {
        throw new Error(`MoMo API Error: ${data.message} (Code: ${data.resultCode})`);
      }

      // Return payment URLs and requestId
      return {
        payUrl: data.payUrl,
        qrCodeUrl: data.qrCodeUrl || "",
        deeplink: data.deeplink || "",
        deeplinkMiniApp: data.deeplinkMiniApp,
        requestId: requestId, // Return requestId for tracking
      };
    } catch (error: any) {
      console.error("[MOMO] Payment creation failed:", error.message);
      throw new Error(`Failed to create MoMo payment: ${error.message}`);
    }
  },

  /**
   * Verify MoMo signature from callback
   */
  verifySignature(data: MoMoCallbackData): boolean {
    const secretKey = env.MOMO_SECRET_KEY;

    if (!secretKey) {
      console.error("[MOMO] Secret key not configured");
      return false;
    }

    // Create raw signature string (theo thứ tự alphabet)
    const rawSignature = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;

    // Generate expected signature
    const expectedSignature = generateSignature(rawSignature, secretKey);

    // Compare signatures
    const isValid = data.signature === expectedSignature;

    if (!isValid) {
      console.error("[MOMO] Signature verification failed:", {
        received: data.signature,
        expected: expectedSignature,
      });
    }

    return isValid;
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
      console.log(`[MOMO] Payment failed for order ${orderId}: ${message} (Code: ${resultCode})`);
      return {
        success: false,
        orderId,
        message: `${message} (Code: ${resultCode})`,
      };
    }
  },

  /**
   * Check transaction status (Query)
   */
  async checkTransactionStatus(orderId: string, requestId: string): Promise<any> {
    const partnerCode = env.MOMO_PARTNER_CODE;
    const accessKey = env.MOMO_ACCESS_KEY;
    const secretKey = env.MOMO_SECRET_KEY;

    // Create raw signature for query
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
    const signature = generateSignature(rawSignature, secretKey);

    const requestBody = {
      partnerCode,
      requestId,
      orderId,
      signature,
      lang: "vi",
    };

    const queryEndpoint = "https://test-payment.momo.vn/v2/gateway/api/query";

    try {
      const response = await fetch(queryEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("[MOMO] Query failed:", error.message);
      throw new Error(`Failed to query MoMo transaction: ${error.message}`);
    }
  },
};
