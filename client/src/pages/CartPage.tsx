import { Container } from "@/components/common/Container";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";

const ACCENT = "rgb(213, 176, 160)";

export default function CartPage() {
  const { data: cart, isLoading, isError, error } = useCart();
  const removeMut = useRemoveCartItem();
  const updateMut = useUpdateCartItem();
  const clearMut = useClearCart();

  const items = cart?.items ?? [];
  const totals = cart?.totals;

  // Check for items without rental dates
  const itemsWithoutDates = items.filter(
    (item: any) => !item.rental?.startDate || !item.rental?.endDate
  );

  if (isLoading) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32 text-sm text-slate-500">Loading...</div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32 text-sm text-rose-700">
          {String((error as any)?.message ?? "Load failed")}
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-white">
      <Container>
        {/* ✅ lùi nội dung xuống dưới header ngay trong page */}
        <div className="pt-24 pb-14 md:pt-28 lg:pt-32">
          {/* title */}
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                Shopping bag
              </div>
              <div className="mt-2 text-[26px] font-semibold" style={{ color: ACCENT }}>
                Your Cart
              </div>
            </div>

            <div className="hidden text-sm text-slate-500 md:block">
              {totals?.itemCount ? `${totals.itemCount} item(s)` : "—"}
            </div>
          </div>

          {/* empty */}
          {!items.length ? (
            <div className="mt-12 bg-[#f6f3ef] ring-1 ring-slate-200 p-10">
              <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                Cart is empty
              </div>
              <div className="mt-3 text-sm text-slate-600">
                Add products to your cart to see them here.
              </div>

              <button
                type="button"
                className="mt-6 h-12 px-10 text-[12px] font-semibold tracking-[0.22em] uppercase text-white"
                style={{ backgroundColor: ACCENT }}
                onClick={() => {
                  // bạn đổi sang navigate("/products") nếu có
                  window.location.href = "/";
                }}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
              {/* left: items */}
              <div className="space-y-6">
                {/* Warning for items without rental dates */}
                {itemsWithoutDates.length > 0 && (
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-600 text-xl">⚠️</span>
                      <div>
                        <div className="text-sm font-semibold text-amber-900">
                          Cần cập nhật ngày thuê
                        </div>
                        <div className="mt-1 text-sm text-amber-800">
                          {itemsWithoutDates.length} sản phẩm chưa có ngày thuê.
                          Vui lòng chọn ngày bắt đầu và kết thúc, sau đó nhấn "UPDATE" cho từng sản phẩm.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white ring-1 ring-slate-200">
                  <div className="px-7 pt-7">
                    <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                      Items
                    </div>
                  </div>

                  <div className="px-7">
                    {items.map((it: any) => (
                      <CartItemRow
                        key={it._id}
                        item={it}
                        updating={updateMut.isPending}
                        onRemove={(itemId) => removeMut.mutate({ itemId })}
                        onUpdate={(payload) => updateMut.mutate(payload)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* right: summary */}
              <div className="lg:sticky lg:top-24 h-fit">
                <CartSummary totals={totals} onClear={() => clearMut.mutate()} clearing={clearMut.isPending} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
