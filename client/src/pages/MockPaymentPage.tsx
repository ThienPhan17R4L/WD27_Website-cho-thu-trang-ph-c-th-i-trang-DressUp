import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { paymentApi } from "@/api/payment.api";
import { useNotification } from "@/contexts/NotificationContext";
import { formatVND } from "@/utils/formatCurrency";

export default function MockPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const { data: order, isLoading } = useQuery({
    queryKey: ["mock-payment", orderId],
    queryFn: () => paymentApi.getMockPayment(orderId!),
    enabled: !!orderId,
  });

  const completeMutation = useMutation({
    mutationFn: () => paymentApi.completeMockPayment(orderId!),
    onSuccess: () => {
      showNotification("success", "Thanh toán thành công!");
      navigate(`/orders`);
    },
    onError: () => {
      showNotification("error", "Có lỗi xảy ra khi thanh toán");
    },
  });

  const failMutation = useMutation({
    mutationFn: () => paymentApi.failMockPayment(orderId!),
    onSuccess: () => {
      showNotification("error", "Thanh toán thất bại. Đơn hàng đã bị hủy.");
      navigate("/orders");
    },
    onError: () => {
      showNotification("error", "Có lỗi xảy ra");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Đang tải...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const totalAmount = order.total + order.totalDeposit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-light text-slate-900 text-center mb-2">Mock Payment</h1>
        <p className="text-sm text-slate-500 text-center mb-6">Order #{order.orderNumber}</p>

        <div className="border-t border-b border-slate-200 py-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Tiền thuê:</span>
            <span className="font-medium">{formatVND(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Tiền cọc:</span>
            <span className="font-medium">{formatVND(order.totalDeposit)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold mt-3 pt-3 border-t border-slate-100">
            <span>Tổng cộng:</span>
            <span className="text-rose-600">{formatVND(totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {completeMutation.isPending ? "Đang xử lý..." : "✓ Thanh toán thành công"}
          </button>
          <button
            onClick={() => failMutation.mutate()}
            disabled={failMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {failMutation.isPending ? "Đang xử lý..." : "✗ Thanh toán thất bại"}
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          Đây là trang thanh toán giả lập chỉ để kiểm thử
        </p>
      </div>
    </div>
  );
}
