import { Container } from "@/components/common/Container";
import { useOrders } from "@/hooks/useOrders";
import { formatVND } from "@/utils/formatCurrency";
import type { Order } from "@/api/orders.api";

const ACCENT = "rgb(213, 176, 160)";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="border border-slate-200 rounded-lg p-6 bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-slate-900">Order #{order.orderNumber}</div>
          <div className="mt-1 text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            statusColors[order.status] || "bg-gray-100 text-gray-800 border-gray-200"
          }`}
        >
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      {/* Items */}
      <div className="mt-5 space-y-3">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="flex gap-4">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                {item.name}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {item.variant?.size && <span>Size: {item.variant.size}</span>}
                {item.variant?.color && <span> • Color: {item.variant.color}</span>}
                <span> • Qty: {item.quantity}</span>
              </div>
              {item.rental && (
                <div className="mt-1 text-xs text-slate-500">
                  Rental: {new Date(item.rental.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(item.rental.endDate).toLocaleDateString("vi-VN")} ({item.rental.days}{" "}
                  days)
                </div>
              )}
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {formatVND(item.lineTotal)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-5 pt-5 border-t border-slate-200">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">{formatVND(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Discount</span>
              <span className="font-medium text-green-600">-{formatVND(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Shipping</span>
            <span className="font-medium">{formatVND(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-semibold text-lg" style={{ color: ACCENT }}>
              {formatVND(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment & Shipping Info */}
      <div className="mt-5 pt-5 border-t border-slate-200 grid gap-4 sm:grid-cols-2 text-xs">
        <div>
          <div className="font-medium text-slate-700">Payment Method</div>
          <div className="mt-1 text-slate-600 uppercase">{order.paymentMethod}</div>
          <div className="mt-1 text-slate-500">
            Status: <span className="capitalize">{order.paymentStatus}</span>
          </div>
        </div>
        <div>
          <div className="font-medium text-slate-700">Shipping Address</div>
          <div className="mt-1 text-slate-600">
            {order.shippingAddress?.receiverName}
            <br />
            {order.shippingAddress?.receiverPhone}
            <br />
            {order.shippingAddress?.line1}, {order.shippingAddress?.ward},{" "}
            {order.shippingAddress?.district}, {order.shippingAddress?.province}
          </div>
        </div>
      </div>

      {/* COD Pickup Deadline (placeholder for Phase 4) */}
      {order.paymentMethod === "cod" && (order as any).pickupDeadline && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
          ⏰ Please pickup by:{" "}
          {new Date((order as any).pickupDeadline).toLocaleString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-600">
          <span className="font-medium text-slate-700">Notes:</span> {order.notes}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📦</div>
      <div className="text-lg font-medium text-slate-700">No orders yet</div>
      <div className="mt-2 text-sm text-slate-500">
        Your order history will appear here once you place your first order.
      </div>
      <a
        href="/products"
        className="mt-6 inline-block px-6 py-3 text-sm font-semibold text-white rounded"
        style={{ backgroundColor: ACCENT }}
      >
        Start Shopping
      </a>
    </div>
  );
}

export default function OrdersPage() {
  const { data, isLoading, isError } = useOrders({ page: 1, limit: 20 });

  if (isLoading) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          <div className="text-sm text-slate-500">Loading your orders...</div>
        </div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          <div className="text-sm text-red-600">Failed to load orders. Please try again later.</div>
        </div>
      </Container>
    );
  }

  const orders = data?.items ?? [];

  return (
    <div className="bg-white">
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
            My Orders
          </div>

          {orders.length === 0 ? (
            <div className="mt-10">
              <EmptyState />
            </div>
          ) : (
            <div className="mt-10 space-y-6">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}

          {/* Pagination info */}
          {data && data.total > 0 && (
            <div className="mt-8 text-center text-xs text-slate-500">
              Showing {orders.length} of {data.total} order{data.total !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
