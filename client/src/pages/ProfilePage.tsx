import { useState } from "react";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/useProfile";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useRemoveAddress,
  useSetDefaultAddress,
} from "@/hooks/useAddresses";
import { useNotification } from "@/contexts/NotificationContext";
import type { CreateAddressPayload } from "@/types/address";

const emptyAddress: CreateAddressPayload = {
  label: "",
  receiverName: "",
  receiverPhone: "",
  line1: "",
  ward: "",
  district: "",
  province: "",
};

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const { data: addresses, isLoading: addrLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const removeAddress = useRemoveAddress();
  const setDefault = useSetDefaultAddress();
  const { showNotification } = useNotification();

  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileInit, setProfileInit] = useState(false);

  if (profile && !profileInit) {
    setFullName(profile.fullName || "");
    setPhone(profile.phone || "");
    setProfileInit(true);
  }

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Address form
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<CreateAddressPayload>(emptyAddress);

  const handleProfileSave = async () => {
    try {
      await updateProfile.mutateAsync({ fullName, phone });
      showNotification("success", "Cập nhật hồ sơ thành công");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      showNotification("success", "Đổi mật khẩu thành công");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const openAddressForm = (addr?: any) => {
    if (addr) {
      setEditingAddrId(addr._id);
      setAddrForm({
        label: addr.label,
        receiverName: addr.receiverName,
        receiverPhone: addr.receiverPhone,
        line1: addr.line1,
        ward: addr.ward,
        district: addr.district,
        province: addr.province,
        postalCode: addr.postalCode,
      });
    } else {
      setEditingAddrId(null);
      setAddrForm(emptyAddress);
    }
    setShowAddrForm(true);
  };

  const handleAddrSave = async () => {
    try {
      if (editingAddrId) {
        await updateAddress.mutateAsync({ id: editingAddrId, data: addrForm });
        showNotification("success", "Cập nhật địa chỉ thành công");
      } else {
        await createAddress.mutateAsync(addrForm);
        showNotification("success", "Thêm địa chỉ thành công");
      }
      setShowAddrForm(false);
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const handleAddrDelete = async (id: string) => {
    if (!confirm("Xoá địa chỉ này?")) return;
    try {
      await removeAddress.mutateAsync(id);
      showNotification("success", "Đã xoá địa chỉ");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  if (profileLoading) {
    return <div className="py-12 text-center text-sm text-slate-400">Đang tải...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold text-slate-900">Hồ sơ cá nhân</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">Thông tin cá nhân</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Email</label>
                <input
                  value={profile?.email || ""}
                  disabled
                  className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Họ tên</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Số điện thoại</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                />
              </div>
              <button
                onClick={handleProfileSave}
                disabled={updateProfile.isPending}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">Đổi mật khẩu</h2>
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
              >
                {changePassword.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>

        {/* Addresses */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Địa chỉ giao hàng</h2>
            <button
              onClick={() => openAddressForm()}
              className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
            >
              + Thêm
            </button>
          </div>

          {addrLoading ? (
            <div className="mt-4 text-sm text-slate-400">Đang tải...</div>
          ) : !addresses || addresses.length === 0 ? (
            <div className="mt-4 rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
              Chưa có địa chỉ nào
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="rounded-md border border-slate-200 p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-slate-600">
                    {addr.receiverName} - {addr.receiverPhone}
                  </div>
                  <div className="text-slate-500">
                    {addr.line1}, {addr.ward}, {addr.district}, {addr.province}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => openAddressForm(addr)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Sửa
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefault.mutate(addr._id)}
                        className="text-xs text-slate-500 hover:underline"
                      >
                        Đặt mặc định
                      </button>
                    )}
                    <button
                      onClick={() => handleAddrDelete(addr._id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddrForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingAddrId ? "Sửa địa chỉ" : "Thêm địa chỉ"}
              </h3>
              <button onClick={() => setShowAddrForm(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {([
                ["label", "Nhãn (VD: Nhà, Công ty)"],
                ["receiverName", "Tên người nhận"],
                ["receiverPhone", "Số điện thoại"],
                ["line1", "Địa chỉ chi tiết"],
                ["ward", "Phường/Xã"],
                ["district", "Quận/Huyện"],
                ["province", "Tỉnh/Thành phố"],
              ] as const).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-slate-600">{label}</label>
                  <input
                    value={(addrForm as any)[field] || ""}
                    onChange={(e) => setAddrForm({ ...addrForm, [field]: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddrForm(false)}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleAddrSave}
                  disabled={createAddress.isPending || updateAddress.isPending}
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
