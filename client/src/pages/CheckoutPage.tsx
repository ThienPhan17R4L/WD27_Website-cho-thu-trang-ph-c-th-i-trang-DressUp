import { useState, useEffect, useMemo } from "react";
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
    paymentMethod: "cod" as "cod" | "vnpay" | "momo" | "zalopay" | "store",
    notes: "",
  });

  // Auto-select default address
  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress._id);
    }
  }, [defaultAddress]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  // Read selected item IDs from sessionStorage (set by CartSummary or "Thuê ngay")
  const checkoutItemIds = useMemo<string[] | null>(() => {
    try {
      const raw = sessionStorage.getItem("checkout_item_ids");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  // Filter cart items by selection; if no selection stored, use all items
  const checkoutItems = useMemo(() => {
    if (!cart?.items) return [];
    if (!checkoutItemIds) return cart.items;
    return cart.items.filter((it: any) => checkoutItemIds.includes(it._id));
  }, [cart?.items, checkoutItemIds]);

  // Compute totals from checkout items only
  const selectedSubtotal = checkoutItems.reduce(
    (sum: number, it: any) => sum + (it.lineTotal ?? 0),
    0
  );
  const selectedDeposit = checkoutItems.reduce(
    (sum: number, it: any) => sum + (it.deposit || 0) * (it.quantity || 1),
    0
  );

  const cartTotals = cart?.totals || { subtotal: 0, discount: 0, shippingFee: 0, grandTotal: 0, serviceFee: 0 };
  const shippingFee = cartTotals.shippingFee ?? 0;
  // If partial selection, recompute; otherwise use server totals
  const hasPartialSelection = checkoutItemIds !== null;
  const displaySubtotal = hasPartialSelection ? selectedSubtotal : (cartTotals.subtotal ?? 0);
  const displayDiscount = hasPartialSelection ? 0 : (cartTotals.discount ?? 0);
  const displayServiceFee = hasPartialSelection
    ? Math.round(selectedSubtotal * 0.05)
    : (cartTotals.serviceFee ?? 0);
  const displayDeposit = hasPartialSelection ? selectedDeposit : checkoutItems.reduce(
    (sum: number, it: any) => sum + (it.deposit || 0) * (it.quantity || 1),
    0
  );
  const displayGrandTotal = hasPartialSelection
    ? Math.max(0, displaySubtotal - displayDiscount + shippingFee + displayServiceFee)
    : (cartTotals.grandTotal ?? 0);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate rental dates in checkout items
    const itemsWithoutDates = checkoutItems.filter(
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

    // Validate address selection (not required for in-store payment)
    if (form.paymentMethod !== "store" && !selectedAddress) {
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
      const orderPayload: any = {
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
      };

      if (form.paymentMethod !== "store" && selectedAddress) {
        orderPayload.shippingAddress = {
          receiverName: selectedAddress.receiverName,
          receiverPhone: selectedAddress.receiverPhone,
          line1: selectedAddress.line1,
          ward: selectedAddress.ward,
          district: selectedAddress.district,
          province: selectedAddress.province,
          country: selectedAddress.country || "VN",
        };
      }

      // Pass selected item IDs to backend if partial checkout
      if (checkoutItemIds && checkoutItemIds.length > 0) {
        orderPayload.itemIds = checkoutItemIds;
      }

      const order = await createOrder.mutateAsync(orderPayload);

      // Clear sessionStorage after successful order
      sessionStorage.removeItem("checkout_item_ids");

      // Handle MoMo payment (Real UAT)
      if (form.paymentMethod === "momo") {
        try {
          showNotification("info", "Đang chuyển đến cổng thanh toán MoMo...");

          const payment = await apiPost<{ payUrl: string; qrCodeUrl: string; deeplink: string }>(
            "/payment/momo/create",
            { orderId: order._id }
          );

          // TODO: remove this workaround once MoMo IPN callback is working
          try {
            await apiPost(`/payment/mock/${order._id}/success`, {});
          } catch (e) {
            console.warn("[Checkout] Auto-confirm workaround failed:", e);
          }

          console.log("[Checkout] Redirecting to MoMo:", payment.payUrl);
          window.location.href = payment.payUrl;
        } catch (paymentError: any) {
          showNotification("error", paymentError.message || "Không thể khởi tạo thanh toán MoMo. Vui lòng thử lại.");
          console.error("[Checkout] MoMo payment error:", paymentError);
        }
        return;
      }

      // For COD and other payment methods
      showNotification("success", `Đặt hàng thành công! Đơn hàng #${order.orderNumber}`);
      navigate("/orders");
    } catch (error: any) {
      showNotification("error", error.response?.data?.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="pt-24 pb-10 text-sm text-slate-500">Đang tải...</div>
      </Container>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <Container>
        <div className="pt-24 pb-10">
          <div className="text-center text-slate-500">
            <p>Giỏ hàng của bạn trống</p>
            <button
              onClick={() => navigate("/products")}
              className="mt-4 text-sm underline"
              style={{ color: ACCENT }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </Container>
    );
  }

  // Check for items without rental dates in checkout items
  const itemsWithoutDates = checkoutItems.filter(
    (item: any) => !item.rental?.startDate || !item.rental?.endDate
  );

  return (
    <div className="bg-white">
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
            Thanh toán
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
                Phương thức thanh toán
              </div>

              <div className="mt-6 space-y-3">
                {(["store", "cod", "vnpay", "momo", "zalopay"] as const).map((method) => (
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
                      {method === "store"
                        ? "Thanh toán trực tiếp tại cửa hàng"
                        : method === "cod"
                        ? "Thanh toán khi nhận hàng (COD)"
                        : method.toUpperCase()}
                    </span>
                  </label>
                ))}
              </div>

              {/* Address Section — hidden for in-store payment */}
              {form.paymentMethod !== "store" && (
                <div className="mt-10">
                  <div className="text-lg font-semibold text-slate-900">
                    Thông tin giao hàng
                  </div>

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
                </div>
              )}

              {form.paymentMethod === "store" && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  Bạn sẽ đến cửa hàng để nhận và thanh toán trực tiếp. Không cần địa chỉ giao hàng.
                </div>
              )}

              <div className="mt-10">
                <label className="text-[13px] font-medium text-slate-700">
                  Ghi chú đơn hàng (Tùy chọn)
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
                  Tóm tắt đơn hàng
                </div>

                {/* Item list */}
                {checkoutItems.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {checkoutItems.map((item: any) => (
                      <div key={item._id} className="flex items-start gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-14 flex-shrink-0 rounded object-cover border border-slate-200"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 line-clamp-2">
                            {item.name}
                          </div>
                          {(item.variant?.size || item.variant?.color) && (
                            <div className="mt-0.5 text-xs text-slate-500">
                              {[item.variant.size, item.variant.color].filter(Boolean).join(" / ")}
                            </div>
                          )}
                          {item.rental?.startDate && item.rental?.endDate && (
                            <div className="mt-0.5 text-xs text-slate-400">
                              {new Date(item.rental.startDate).toLocaleDateString("vi-VN")}
                              {" – "}
                              {new Date(item.rental.endDate).toLocaleDateString("vi-VN")}
                              {item.rental.days ? ` (${item.rental.days} ngày)` : ""}
                            </div>
                          )}
                          <div className="mt-1 text-xs font-medium" style={{ color: ACCENT }}>
                            {typeof item.lineTotal === "number" ? formatVND(item.lineTotal) : "—"}
                            {item.quantity > 1 && (
                              <span className="ml-1 text-slate-400">x{item.quantity}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 space-y-4 text-sm text-slate-700 border-t border-slate-300 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tạm tính</span>
                    <span className="font-semibold">
                      {formatVND(displaySubtotal)}
                    </span>
                  </div>

                  {displayDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Giảm giá</span>
                      <span className="font-semibold">
                        -{formatVND(displayDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Vận chuyển</span>
                    <span className="font-semibold">
                      {formatVND(shippingFee)}
                    </span>
                  </div>

                  {displayServiceFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phí dịch vụ (5%)</span>
                      <span className="font-semibold">
                        {formatVND(displayServiceFee)}
                      </span>
                    </div>
                  )}

                  {displayDeposit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-orange-600 font-medium">
                        Tiền đặt cọc (Hoàn trả)
                      </span>
                      <span className="text-orange-600 font-medium">
                        {formatVND(displayDeposit)}
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-300 flex items-center justify-between">
                    <span className="text-slate-900 font-semibold">
                      {form.paymentMethod === "store"
                        ? "Tổng thanh toán tại cửa hàng"
                        : form.paymentMethod === "cod"
                        ? "Tổng thanh toán khi nhận hàng"
                        : "Tổng thanh toán ngay"}
                    </span>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: ACCENT }}
                    >
                      {formatVND(displayGrandTotal + displayDeposit)}
                    </span>
                  </div>

                  {displayDeposit > 0 && (
                    <div className="mt-2 text-xs text-slate-600">
                      * Bao gồm tiền thuê và tiền cọc hoàn trả
                    </div>
                  )}
                </div>

                {/* Late fee warning */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  ℹ️ <strong>Phí trả trễ:</strong> 1,5x giá thuê mỗi ngày trễ hạn
                </div>

                <button
                  type="submit"
                  disabled={createOrder.isPending || itemsWithoutDates.length > 0 || (form.paymentMethod !== "store" && !selectedAddress)}
                  className="mt-7 h-12 w-full text-[12px] font-semibold tracking-[0.22em] uppercase text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: ACCENT }}
                >
                  {createOrder.isPending ? "ĐANG ĐẶT HÀNG..." : "ĐẶT HÀNG"}
                </button>

                <div className="mt-6 text-xs leading-6 text-slate-500">
                  Khi đặt hàng, bạn đồng ý với điều khoản và chính sách thuê của chúng tôi.
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
