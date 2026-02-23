import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { ordersApi } from "@/api/orders.api";
import { BRAND } from "@/pages/CategoriesPage";

/**
 * MoMo Return URL Handler
 *
 * This page handles the redirect from MoMo payment gateway after user completes payment.
 * MoMo will redirect to this page with query parameters containing payment result.
 *
 * Query params from MoMo:
 * - partnerCode: Partner code
 * - orderId: Order number
 * - requestId: Request ID
 * - amount: Payment amount
 * - orderInfo: Order description
 * - resultCode: Payment result (0 = success, others = failed)
 * - message: Result message
 * - payType: Payment type
 * - responseTime: Response timestamp
 * - extraData: Additional data
 * - signature: Security signature
 */

type PaymentStatus = "checking" | "success" | "failed" | "pending";

interface PaymentResult {
  status: PaymentStatus;
  orderId?: string;
  orderNumber?: string;
  message?: string;
  resultCode?: string;
}

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<PaymentResult>({ status: "checking" });

  useEffect(() => {
    handlePaymentReturn();
  }, [searchParams]);

  async function handlePaymentReturn() {
    try {
      // Get query params from MoMo
      const orderId = searchParams.get("orderId"); // This is orderNumber
      const resultCode = searchParams.get("resultCode");
      const message = searchParams.get("message");

      console.log("[PaymentReturn] MoMo redirect received:", {
        orderId,
        resultCode,
        message,
      });

      if (!orderId) {
        setResult({
          status: "failed",
          message: "Thiếu thông tin đơn hàng",
        });
        return;
      }

      // Wait a bit for IPN callback to process (MoMo sends IPN first, then redirects user)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Fetch all orders to find the one with matching orderNumber
      const ordersResponse = await ordersApi.getAll({ limit: 100 });
      const order = ordersResponse.items.find(
        (o) => o.orderNumber === orderId
      );

      if (!order) {
        setResult({
          status: "failed",
          message: "Không tìm thấy đơn hàng",
          orderNumber: orderId,
        });
        return;
      }

      // Check payment result
      const code = Number(resultCode);

      if (code === 0 || code === 9000) {
        // Success or Confirmed
        setResult({
          status: "success",
          orderId: order._id,
          orderNumber: orderId,
          message: message || "Thanh toán thành công!",
          resultCode: String(code),
        });

        // Redirect to order detail page after 2 seconds
        setTimeout(() => {
          navigate(`/orders/${order._id}`, { replace: true });
        }, 2000);
      } else if (code === 8000 || code === 1000 || code === 1001) {
        // Pending/Processing
        setResult({
          status: "pending",
          orderId: order._id,
          orderNumber: orderId,
          message: message || "Giao dịch đang được xử lý...",
          resultCode: String(code),
        });
      } else {
        // Failed
        setResult({
          status: "failed",
          orderId: order._id,
          orderNumber: orderId,
          message: message || "Thanh toán thất bại",
          resultCode: String(code),
        });
      }
    } catch (error: any) {
      console.error("[PaymentReturn] Error:", error);
      setResult({
        status: "failed",
        message: error.message || "Có lỗi xảy ra khi xử lý kết quả thanh toán",
      });
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32 max-w-2xl mx-auto">
          {result.status === "checking" && (
            <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-6"></div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Đang xử lý thanh toán...
              </h1>
              <p className="text-slate-600">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          )}

          {result.status === "success" && (
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{ backgroundColor: `${BRAND.blushRose}20` }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: BRAND.blushRose }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-slate-600 mb-2">
                {result.message}
              </p>
              {result.orderNumber && (
                <p className="text-sm text-slate-500 mb-6">
                  Mã đơn hàng: <span className="font-semibold">{result.orderNumber}</span>
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <div className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Đang chuyển đến trang chi tiết đơn hàng...</span>
              </div>
            </div>
          )}

          {result.status === "pending" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-full mb-6">
                <svg
                  className="w-10 h-10 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Giao dịch đang xử lý
              </h1>
              <p className="text-slate-600 mb-2">
                {result.message}
              </p>
              {result.orderNumber && (
                <p className="text-sm text-slate-500 mb-6">
                  Mã đơn hàng: <span className="font-semibold">{result.orderNumber}</span>
                </p>
              )}
              <p className="text-sm text-slate-500 mb-6">
                Giao dịch của bạn đang được xử lý. Vui lòng kiểm tra lại sau ít phút.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {result.orderId && (
                  <button
                    onClick={() => navigate(`/orders/${result.orderId}`)}
                    className="px-6 py-3 rounded-md text-white font-medium"
                    style={{ backgroundColor: BRAND.blushRose }}
                  >
                    Xem đơn hàng
                  </button>
                )}
                <button
                  onClick={() => navigate("/orders")}
                  className="px-6 py-3 rounded-md border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Danh sách đơn hàng
                </button>
              </div>
            </div>
          )}

          {result.status === "failed" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-slate-600 mb-2">
                {result.message}
              </p>
              {result.resultCode && result.resultCode !== "0" && (
                <p className="text-sm text-slate-500 mb-6">
                  Mã lỗi: {result.resultCode}
                </p>
              )}
              {result.orderNumber && (
                <p className="text-sm text-slate-500 mb-6">
                  Mã đơn hàng: <span className="font-semibold">{result.orderNumber}</span>
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {result.orderId && (
                  <button
                    onClick={() => navigate(`/orders/${result.orderId}`)}
                    className="px-6 py-3 rounded-md text-white font-medium"
                    style={{ backgroundColor: BRAND.blushRose }}
                  >
                    Xem đơn hàng
                  </button>
                )}
                <button
                  onClick={() => navigate("/cart")}
                  className="px-6 py-3 rounded-md border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Quay lại giỏ hàng
                </button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
