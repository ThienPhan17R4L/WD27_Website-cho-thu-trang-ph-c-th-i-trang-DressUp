import { useState } from "react";
import { Container } from "@/components/common/Container";
import { useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/hooks/useCoupons";
import { useNotification } from "@/contexts/NotificationContext";
import { PaginationBar } from "@/components/common/PaginationBar";
import { formatVND } from "@/utils/formatCurrency";

const emptyCoupon = {
  code: "",
  type: "percentage" as const,
  value: 0,
  minOrderValue: 0,
  maxDiscount: 0,
  usageLimit: 0,
  perUserLimit: 0,
  validFrom: "",
  validTo: "",
  isActive: true,
};

export default function CouponsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminCoupons({ page, limit: 20 });
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const { showNotification } = useNotification();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);

  const items = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyCoupon);
    setShowForm(true);
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      perUserLimit: coupon.perUserLimit || 0,
      validFrom: coupon.validFrom?.slice(0, 10) || "",
      validTo: coupon.validTo?.slice(0, 10) || "",
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
        validTo: form.validTo ? new Date(form.validTo).toISOString() : undefined,
      };
      if (editingId) {
        await updateCoupon.mutateAsync({ id: editingId, data: payload });
        showNotification("success", "Cập nhật mã giảm giá thành công");
      } else {
        await createCoupon.mutateAsync(payload);
        showNotification("success", "Tạo mã giảm giá thành công");
      }
      setShowForm(false);
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá mã giảm giá này?")) return;
    try {
      await deleteCoupon.mutateAsync(id);
      showNotification("success", "Đã xoá mã giảm giá");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <h1 className="text-xl font-semibold text-slate-900">Quản lý mã giảm giá</h1>
            <button
              onClick={openCreate}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              + Thêm mã
            </button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Chưa có mã giảm giá nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Loại</th>
                    <th className="px-4 py-3">Giá trị</th>
                    <th className="px-4 py-3">Đã dùng</th>
                    <th className="px-4 py-3">Thời hạn</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((c: any) => (
                    <tr key={c._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">{c.code}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.type === "percentage" ? "Phần trăm" : "Cố định"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {c.type === "percentage" ? `${c.value}%` : formatVND(c.value)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {c.validFrom && new Date(c.validFrom).toLocaleDateString("vi-VN")}
                        {" - "}
                        {c.validTo && new Date(c.validTo).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {c.isActive ? "Hoạt động" : "Ngưng"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="text-xs text-blue-600 hover:underline">
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(c._id)} className="text-xs text-red-500 hover:underline">
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </Container>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingId ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">Mã code</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm uppercase focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Loại</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Cố định (VND)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Giá trị {form.type === "percentage" ? "(%)" : "(VND)"}
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Giới hạn sử dụng</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={form.validTo}
                    onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-slate-600">Hoạt động</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleSave}
                  disabled={createCoupon.isPending || updateCoupon.isPending}
                  className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
