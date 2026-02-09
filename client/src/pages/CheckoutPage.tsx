import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { formatVND } from "@/utils/formatCurrency";
import { useNotification } from "@/contexts/NotificationContext";
import { apiPost } from "@/lib/api";

const ACCENT = "rgb(213, 176, 160)";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    line1: "",
    ward: "",
    district: "",
    province: "",
    paymentMethod: "cod" as "cod" | "vnpay" | "momo" | "zalopay",
    notes: "",
  });

  const totals = cart?.totals || {
    subtotal: 0,
    discount: 0,
    shippingFee: 0,
    grandTotal: 0,
  };

  // Calculate total deposit from cart items
  const totalDeposit = cart?.items?.reduce(
    (sum: number, item: any) =>
      sum + (item.deposit || 0) * (item.quantity || 1),
    0
  ) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (
      !form.receiverName ||
      !form.receiverPhone ||
      !form.line1 ||
      !form.ward ||
      !form.district ||
      !form.province
    ) {
      showNotification("error", "Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    // Validate phone format (Vietnam phone numbers)
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(form.receiverPhone.trim())) {
      showNotification("error", "Số điện thoại không hợp lệ (VD: 0912345678)");
      return;
    }

    // Validate payment method
    if (!form.paymentMethod) {
      showNotification("error", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        shippingAddress: {
          receiverName: form.receiverName.trim(),
          receiverPhone: form.receiverPhone.trim(),
          line1: form.line1.trim(),
          ward: form.ward.trim(),
          district: form.district.trim(),
          province: form.province.trim(),
          country: "VN",
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
      });

      // Handle MoMo payment
      if (form.paymentMethod === "momo") {
        try {
          showNotification("info", "Redirecting to MoMo payment...");

          // Call payment creation API
          const payment = await apiPost<{ payUrl: string; qrCodeUrl: string; deeplink: string }>(
            "/payment/momo/create",
            { orderId: order._id }
          );

          // Redirect to MoMo payment page
          window.location.href = payment.payUrl;
        } catch (paymentError: any) {
          showNotification("error", "Failed to initialize MoMo payment. Please try again.");
          console.error("MoMo payment error:", paymentError);
        }
        return;
      }

      // For COD and other payment methods
      showNotification("success", `Order created successfully! Order #${order.orderNumber}`);
      navigate("/orders");
    } catch (error: any) {
      showNotification("error", error.response?.data?.message || "Failed to create order");
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="pt-24 pb-10 text-sm text-slate-500">Loading...</div>
      </Container>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <Container>
        <div className="pt-24 pb-10">
          <div className="text-center text-slate-500">
            <p>Your cart is empty</p>
            <button
              onClick={() => navigate("/products")}
              className="mt-4 text-sm underline"
              style={{ color: ACCENT }}
            >
              Continue shopping
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-white">
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
            Checkout
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]"
          >
            {/* Left: Form */}
            <div>
              <div className="text-lg font-semibold text-slate-900">
                Shipping Information
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-[13px] font-medium text-slate-700">
                    Receiver Name *
                  </label>
                  <input
                    required
                    value={form.receiverName}
                    onChange={(e) =>
                      setForm({ ...form, receiverName: e.target.value })
                    }
                    className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700">
                    Phone Number *
                  </label>
                  <input
                    required
                    value={form.receiverPhone}
                    onChange={(e) =>
                      setForm({ ...form, receiverPhone: e.target.value })
                    }
                    placeholder="0912345678"
                    className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700">
                    Address *
                  </label>
                  <input
                    required
                    value={form.line1}
                    onChange={(e) =>
                      setForm({ ...form, line1: e.target.value })
                    }
                    placeholder="123 Đường ABC"
                    className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Ward *
                    </label>
                    <input
                      required
                      value={form.ward}
                      onChange={(e) =>
                        setForm({ ...form, ward: e.target.value })
                      }
                      className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      District *
                    </label>
                    <input
                      required
                      value={form.district}
                      onChange={(e) =>
                        setForm({ ...form, district: e.target.value })
                      }
                      className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Province *
                    </label>
                    <input
                      required
                      value={form.province}
                      onChange={(e) =>
                        setForm({ ...form, province: e.target.value })
                      }
                      className="mt-2 h-14 w-full bg-[#f6f3ef] px-5 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <div className="text-lg font-semibold text-slate-900">
                  Payment Method
                </div>

                <div className="mt-6 space-y-3">
                  {["cod", "vnpay", "momo", "zalopay"].map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={form.paymentMethod === method}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            paymentMethod: e.target.value as any,
                          })
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-slate-700">
                        {method === "cod"
                          ? "Cash on Delivery (COD)"
                          : method.toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <label className="text-[13px] font-medium text-slate-700">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="mt-2 w-full bg-[#f6f3ef] px-5 py-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                />
              </div>
            </div>

            {/* Right: Summary */}
            <div>
              <div className="bg-[#f6f3ef] p-7 ring-1 ring-slate-200">
                <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                  Order Summary
                </div>

                <div className="mt-6 space-y-4 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold">
                      {formatVND(totals.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-semibold">
                      -{formatVND(totals.discount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-semibold">
                      {formatVND(totals.shippingFee)}
                    </span>
                  </div>

                  {totalDeposit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-orange-600 font-medium">
                        Deposit (Refundable)
                      </span>
                      <span className="text-orange-600 font-medium">
                        {formatVND(totalDeposit)}
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-300 flex items-center justify-between">
                    <span className="text-slate-900 font-semibold">Total</span>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: ACCENT }}
                    >
                      {formatVND(totals.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Late fee warning */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  ℹ️ <strong>Late return fee:</strong> 1.5x daily rate per day overdue
                </div>

                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="mt-7 h-12 w-full text-[12px] font-semibold tracking-[0.22em] uppercase text-white disabled:opacity-60"
                  style={{ backgroundColor: ACCENT }}
                >
                  {createOrder.isPending ? "PLACING ORDER..." : "PLACE ORDER"}
                </button>

                <div className="mt-6 text-xs leading-6 text-slate-500">
                  By placing your order, you agree to our terms and rental
                  policy.
                </div>
              </div>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
