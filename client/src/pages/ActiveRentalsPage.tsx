import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/common/Container";
import { ordersApi, type Order } from "@/api/orders.api";
import { formatVND } from "@/utils/formatCurrency";

export default function ActiveRentalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["active-rentals"],
    queryFn: () => ordersApi.getActiveRentals(),
  });

  const rentals = data?.items || [];

  if (isLoading) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32">
          <div className="text-sm text-slate-500">Đang tải...</div>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-slate-200">
        <Container>
          <div className="py-8">
            <h1 className="text-2xl font-bold text-slate-900">Đang thuê</h1>
            <p className="mt-1 text-sm text-slate-600">
              Các đơn hàng hiện tại đang được bạn thuê
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {rentals.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-lg font-medium text-slate-700 mb-2">
                Không có đơn hàng đang thuê
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Bạn chưa có đơn hàng nào đang được thuê
              </p>
              <a
                href="/products"
                className="inline-block rounded-md bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Xem sản phẩm
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rentals.map((rental) => (
                <RentalCard key={rental._id} rental={rental} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

interface RentalCardProps {
  rental: Order;
}

function RentalCard({ rental }: RentalCardProps) {
  // Calculate days left for the first item (assuming all items have same rental period)
  const firstItem = rental.items[0];
  const endDate = firstItem?.rental?.endDate
    ? new Date(firstItem.rental.endDate)
    : null;

  const daysLeft = endDate
    ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            Đơn #{rental.orderNumber}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Đã nhận ngày{" "}
            {rental.deliveredAt
              ? new Date(rental.deliveredAt).toLocaleDateString("vi-VN")
              : "—"}
          </p>
        </div>

        {daysLeft !== null && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isOverdue
                ? "bg-red-50 text-red-700 border border-red-200"
                : daysLeft <= 3
                ? "bg-orange-50 text-orange-700 border border-orange-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {isOverdue
              ? `Quá hạn ${Math.abs(daysLeft)} ngày`
              : `Còn ${daysLeft} ngày`}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {rental.items?.map((item: any, idx) => (
          <div key={idx} className="flex gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 rounded object-cover border border-slate-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {item.name}
              </p>
              {item.rental && (
                <p className="text-xs text-slate-600 mt-1">
                  Trả trước:{" "}
                  {new Date(item.rental.endDate).toLocaleDateString("vi-VN")}
                </p>
              )}
              {item.variant && (
                <p className="text-xs text-slate-500">
                  {item.variant.size && `Size ${item.variant.size}`}
                  {item.variant.color && ` • ${item.variant.color}`}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">x{item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Return info */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Tiền thuê</span>
          <span className="font-medium text-slate-900">
            {formatVND(rental.total)}
          </span>
        </div>

        {(rental as any).totalDeposit && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-orange-600">Tiền cọc</span>
            <span className="font-medium text-orange-600">
              {formatVND((rental as any).totalDeposit)}
            </span>
          </div>
        )}

        {isOverdue && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            ⚠️ <strong>Lưu ý:</strong> Đơn hàng đã quá hạn trả. Phí phạt trả
            muộn là <strong>1.5x</strong> giá thuê mỗi ngày.
          </div>
        )}
      </div>
    </div>
  );
}
