import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { formatVND } from "@/utils/formatCurrency";
import { useNotification } from "@/contexts/NotificationContext";
import { useAddresses, useCreateAddress, useUpdateAddress } from "@/hooks/useAddresses";
import AddressModal from "@/components/checkout/AddressModal";
import { apiPost } from "@/lib/api";

const ACCENT = "rgb(213, 176, 160)";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const { showNotification } = useNotification();

  // Addresses
  const { data: addressesResponse } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const addresses = addressesResponse?.data || [];
  const defaultAddress = addresses.find((a) => a.isDefault);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [form, setForm] = useState({
    paymentMethod: "cod" as "cod" | "vnpay" | "momo" | "zalopay",
    notes: "",
  });

  // Auto-select default address
  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress._id);
    }
  }, [defaultAddress]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

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

  const handleCreateAddress = async (data: any) => {
    try {
      const newAddr = await createAddress.mutateAsync({
        ...data,
        isDefault: addresses.length === 0,
      });
      showNotification("success", "Địa chỉ đã được tạo");
      setSelectedAddressId(newAddr._id);
      setIsAddressModalOpen(false);
    } catch (error: any) {
      showNotification("error", error.response?.data?.message || "Không thể tạo địa chỉ");
      throw error;
    }
  };

  const handleUpdateAddress = async (id: string, data: any) => {
    try {
      await updateAddress.mutateAsync({ id, data });
      showNotification("success", "Địa chỉ đã được cập nhật");
      setIsAddressModalOpen(false);
    } catch (error: any) {
      showNotification("error", error.response?.data?.message || "Không thể cập nhật địa chỉ");
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate rental dates in cart items
    const itemsWithoutDates = cart?.items?.filter(
      (item: any) => !item.rental?.startDate || !item.rental?.endDate
    );

    if (itemsWithoutDates && itemsWithoutDates.length > 0) {
      showNotification(
        "error",
        "Vui lòng cập nhật ngày thuê cho tất cả sản phẩm trong giỏ hàng trước khi thanh toán"
      );
      navigate("/cart");
      return;
    }

    // Validate address selection
    if (!selectedAddress) {
      showNotification("error", "Vui lòng chọn địa chỉ giao hàng");
      setIsAddressModalOpen(true);
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
          receiverName: selectedAddress.receiverName,
          receiverPhone: selectedAddress.receiverPhone,
          line1: selectedAddress.line1,
          ward: selectedAddress.ward,
          district: selectedAddress.district,
          province: selectedAddress.province,
          country: selectedAddress.country || "VN",
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
      });

      // Handle MoMo payment (Real UAT)
      if (form.paymentMethod === "momo") {
        try {
          showNotification("info", "Đang chuyển đến cổng thanh toán MoMo...");

          // Call payment creation API
          const payment = await apiPost<{ payUrl: string; qrCodeUrl: string; deeplink: string }>(
            "/payment/momo/create",
            { orderId: order._id }
          );

          // Redirect to MoMo payment page
          console.log("[Checkout] Redirecting to MoMo:", payment.payUrl);
          window.location.href = payment.payUrl;
        } catch (paymentError: any) {
          showNotification("error", paymentError.message || "Không thể khởi tạo thanh toán MoMo. Vui lòng thử lại.");
          console.error("[Checkout] MoMo payment error:", paymentError);
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

  // Check for items without rental dates
  const itemsWithoutDates = cart?.items?.filter(
    (item: any) => !item.rental?.startDate || !item.rental?.endDate
  ) || [];

  return (
    <div className="bg-white">
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
            Checkout
          </div>

          {/* Warning for items without rental dates */}
          {itemsWithoutDates.length > 0 && (
            <div className="mt-6 p-5 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-3">
                <span className="text-red-600 text-xl">⚠️</span>
                <div>
                  <div className="text-sm font-semibold text-red-900">
                    Thiếu thông tin ngày thuê
                  </div>
                  <div className="mt-2 text-sm text-red-800">
                    {itemsWithoutDates.length} sản phẩm trong giỏ hàng chưa có ngày thuê.
                    Vui lòng{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/cart")}
                      className="underline font-semibold hover:text-red-900"
                    >
                      quay lại giỏ hàng
                    </button>{" "}
                    và cập nhật ngày thuê cho tất cả sản phẩm.
                  </div>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]"
          >
            {/* Left: Form */}
            <div>
              <div className="text-lg font-semibold text-slate-900">
                Shipping Information
              </div>

              {/* Address Section */}
              <div className="mt-6 p-5 bg-[#f6f3ef] border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-slate-700">
                    Địa chỉ giao hàng
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-sm font-medium hover:underline"
                    style={{ color: ACCENT }}
                  >
                    {selectedAddress ? "Thay đổi" : "Chọn địa chỉ"}
                  </button>
                </div>

                {selectedAddress ? (
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      {selectedAddress.isDefault && (
                        <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">
                          Mặc định
                        </span>
                      )}
                      {selectedAddress.label && (
                        <span className="font-medium">{selectedAddress.label}</span>
                      )}
                    </div>
                    <div className="font-medium text-slate-900">
                      {selectedAddress.receiverName} | {selectedAddress.receiverPhone}
                    </div>
                    <div className="text-slate-600">
                      {selectedAddress.line1}
                      <br />
                      {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">
                    Chưa chọn địa chỉ giao hàng
                  </div>
                )}
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
                    <span className="text-slate-900 font-semibold">
                      {form.paymentMethod === "cod" ? "Total (COD)" : "Total to Pay Now"}
                    </span>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: ACCENT }}
                    >
                      {form.paymentMethod === "cod"
                        ? formatVND(totals.grandTotal)
                        : formatVND(totals.grandTotal + totalDeposit)
                      }
                    </span>
                  </div>

                  {form.paymentMethod !== "cod" && totalDeposit > 0 && (
                    <div className="mt-2 text-xs text-slate-600">
                      * Online payment includes rental fee and deposit
                    </div>
                  )}
                </div>

                {/* Late fee warning */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  ℹ️ <strong>Late return fee:</strong> 1.5x daily rate per day overdue
                </div>

                <button
                  type="submit"
                  disabled={createOrder.isPending || itemsWithoutDates.length > 0 || !selectedAddress}
                  className="mt-7 h-12 w-full text-[12px] font-semibold tracking-[0.22em] uppercase text-white disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        selectedAddressId={selectedAddressId || "new"}
        onSelectAddress={setSelectedAddressId}
        onCreateAddress={handleCreateAddress}
        onUpdateAddress={handleUpdateAddress}
      />
    </div>
  );
}
