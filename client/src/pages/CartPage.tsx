import { useState, useEffect } from "react";
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

  // Selection state — default: all selected
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // When cart items change, preserve existing selections; auto-select new items
  useEffect(() => {
    const allIds = new Set(items.map((it: any) => it._id as string));
    setSelectedIds((prev) => {
      // Keep previously selected IDs that still exist + auto-select any new items
      const kept = new Set([...prev].filter((id) => allIds.has(id)));
      if (kept.size === 0) return allIds; // first load or all removed → select all
      allIds.forEach((id) => { if (!prev.has(id)) kept.add(id); }); // new items auto-selected
      return kept;
    });
  }, [cart]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  function toggleItem(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    if (checked) setSelectedIds(new Set(items.map((it: any) => it._id)));
    else setSelectedIds(new Set());
  }

  const selectedItems = items.filter((it: any) => selectedIds.has(it._id));

  // Check for items without rental dates
  const itemsWithoutDates = items.filter(
    (item: any) => !item.rental?.startDate || !item.rental?.endDate
  );

  if (isLoading) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32 text-sm text-slate-500">Đang tải...</div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <div className="pt-24 pb-10 md:pt-28 lg:pt-32 text-sm text-rose-700">
          {String((error as any)?.message ?? "Tải thất bại")}
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-white">
      <Container>
        <div className="pt-24 pb-14 md:pt-28 lg:pt-32">
          {/* title */}
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                Túi mua sắm
              </div>
              <div className="mt-2 text-[26px] font-semibold" style={{ color: ACCENT }}>
                Giỏ hàng của bạn
              </div>
            </div>

            <div className="hidden text-sm text-slate-500 md:block">
              {totals?.itemCount ? `${totals.itemCount} sản phẩm` : "—"}
            </div>
          </div>

          {/* empty */}
          {!items.length ? (
            <div className="mt-12 bg-[#f6f3ef] ring-1 ring-slate-200 p-10">
              <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                Giỏ hàng trống
              </div>
              <div className="mt-3 text-sm text-slate-600">
                Thêm sản phẩm vào giỏ hàng để xem ở đây.
              </div>

              <button
                type="button"
                className="mt-6 h-12 px-10 text-[12px] font-semibold tracking-[0.22em] uppercase text-white"
                style={{ backgroundColor: ACCENT }}
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Tiếp tục mua sắm
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
                          Vui lòng chọn ngày bắt đầu và kết thúc, sau đó nhấn "CẬP NHẬT" cho từng sản phẩm.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white ring-1 ring-slate-200">
                  <div className="px-7 pt-7">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[rgb(213,176,160)]"
                      />
                      <div className="text-[12px] font-semibold tracking-[0.22em] uppercase text-slate-900">
                        Sản phẩm
                        {items.length > 0 && (
                          <span className="ml-2 font-normal text-slate-400">
                            ({selectedIds.size}/{items.length} đã chọn)
                          </span>
                        )}
                      </div>
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
                        checked={selectedIds.has(it._id)}
                        onCheckedChange={toggleItem}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* right: summary */}
              <div className="lg:sticky lg:top-24 h-fit">
                <CartSummary
                  totals={totals}
                  onClear={() => clearMut.mutate()}
                  clearing={clearMut.isPending}
                  selectedItems={selectedItems}
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
