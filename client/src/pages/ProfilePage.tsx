import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { uploadImage } from "@/api/upload.api";

const ACCENT = "rgb(213, 176, 160)";
const ACCENT_DARK = "rgb(190, 148, 130)";
const WARM_BROWN = "#5a4038";
const MUTED = "#9b8f8a";

const TABS = [
  { key: "info", label: "Thông tin cá nhân" },
  { key: "password", label: "Đổi mật khẩu" },
  { key: "addresses", label: "Địa chỉ giao hàng" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabKey) || "info";
  const setActiveTab = (tab: TabKey) =>
    setSearchParams(tab === "info" ? {} : { tab }, { replace: true });

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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Initialize profile form when data loads
  useEffect(() => {
    if (profile?.data) {
      setFullName(profile.data.fullName || "");
      setPhone(profile.data.phone || "");
      setAvatarUrl(profile.data.avatarUrl || "");
      setDob(profile.data.dob ? profile.data.dob.split("T")[0] : "");
      setGender(profile.data.gender || "");
    }
  }, [profile]);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Password validation
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Address form
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<CreateAddressPayload>(emptyAddress);

  const isProfileDirty =
    fullName !== (profile?.data?.fullName || "") ||
    phone !== (profile?.data?.phone || "") ||
    avatarUrl !== (profile?.data?.avatarUrl || "") ||
    dob !== (profile?.data?.dob?.split("T")[0] || "") ||
    gender !== (profile?.data?.gender || "");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("error", "Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "Kích thước ảnh tối đa 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const result = await uploadImage(file);
      setAvatarUrl(result.url);
      showNotification("success", "Tải ảnh lên thành công");
    } catch (err: any) {
      showNotification("error", err.message || "Không thể tải ảnh lên");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile.mutateAsync({
        fullName,
        phone,
        avatarUrl: avatarUrl || undefined,
        dob: dob || undefined,
        gender: gender || undefined,
      });
      showNotification("success", "Cập nhật hồ sơ thành công");
    } catch (err: any) {
      showNotification("error", err.message || "Có lỗi xảy ra");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification("error", "Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm" style={{ color: MUTED }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b" style={{ borderColor: "rgba(155,143,138,0.2)" }}>
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p
            className="text-[10px] font-medium uppercase tracking-[0.3em]"
            style={{ color: ACCENT_DARK }}
          >
            My Account
          </p>
          <h1
            className="mt-3 text-3xl font-light tracking-tight"
            style={{ color: WARM_BROWN }}
          >
            Hồ sơ cá nhân
          </h1>
          <p className="mt-2 text-sm" style={{ color: MUTED }}>
            {profile?.data?.email}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: "rgba(155,143,138,0.2)" }}>
        <div className="mx-auto flex max-w-3xl justify-center gap-1 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors"
              style={{
                color: activeTab === tab.key ? WARM_BROWN : MUTED,
              }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: ACCENT }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-xl px-4 py-10">
        {/* Tab: Thông tin cá nhân */}
        {activeTab === "info" && (
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Email
              </label>
              <input
                value={profile?.data?.email || ""}
                disabled
                className="mt-2 w-full border-b bg-transparent pb-2 text-sm"
                style={{ borderColor: "rgba(155,143,138,0.2)", color: MUTED }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Họ tên
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full border-b bg-transparent pb-2 text-sm outline-none transition-colors focus:border-b-2"
                style={{ borderColor: "rgba(155,143,138,0.3)", color: WARM_BROWN }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Số điện thoại
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border-b bg-transparent pb-2 text-sm outline-none transition-colors focus:border-b-2"
                style={{ borderColor: "rgba(155,143,138,0.3)", color: WARM_BROWN }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Ảnh đại diện
              </label>
              <div className="mt-2 flex items-center gap-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border"
                    style={{ borderColor: "rgba(155,143,138,0.2)" }}
                  />
                ) : (
                  <div
                    className="h-20 w-20 rounded-full border flex items-center justify-center text-2xl font-serif"
                    style={{ borderColor: "rgba(155,143,138,0.2)", color: MUTED }}
                  >
                    {profile?.data?.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    id="avatar-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
                    style={{
                      background: uploadingAvatar ? MUTED : ACCENT,
                      color: "white",
                      borderRadius: "2px",
                    }}
                  >
                    {uploadingAvatar ? "Đang tải..." : "Chọn ảnh"}
                  </label>
                  <p className="mt-1 text-[10px]" style={{ color: MUTED }}>
                    JPG, PNG hoặc GIF. Tối đa 5MB.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Ngày sinh
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-2 w-full border-b bg-transparent pb-2 text-sm outline-none transition-colors focus:border-b-2"
                style={{ borderColor: "rgba(155,143,138,0.3)", color: WARM_BROWN }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="mt-2 w-full border-b bg-transparent pb-2 text-sm outline-none transition-colors focus:border-b-2"
                style={{ borderColor: "rgba(155,143,138,0.3)", color: WARM_BROWN }}
              >
                <option value="">-- Chọn --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="pt-4">
              <button
                onClick={handleProfileSave}
                disabled={updateProfile.isPending || !isProfileDirty}
                className="h-11 w-full text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-opacity disabled:opacity-50"
                style={{ background: ACCENT }}
              >
                {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        )}

        {/* Tab: Đổi mật khẩu */}
        {activeTab === "password" && (
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Mật khẩu hiện tại
              </label>
              <div className="relative mt-2">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full border-b bg-transparent pb-2 pr-8 text-sm outline-none transition-colors focus:border-b-2"
                  style={{ borderColor: "rgba(155,143,138,0.3)", color: WARM_BROWN }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-0 bottom-2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPw ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Mật khẩu mới
              </label>
              <div className="relative mt-2">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border-b bg-transparent pb-2 pr-8 text-sm outline-none transition-colors focus:border-b-2"
                  style={{ borderColor: "rgba(155,143,138,0.3)", color: WARM_BROWN }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-0 bottom-2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPw ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Xác nhận mật khẩu mới
              </label>
              <div className="relative mt-2">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border-b bg-transparent pb-2 pr-8 text-sm outline-none transition-colors focus:border-b-2"
                  style={{ borderColor: "rgba(155,143,138,0.3)", color: WARM_BROWN }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-0 bottom-2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPw ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`mt-1 text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                  {passwordsMatch ? (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mật khẩu khớp
                    </>
                  ) : (
                    "Mật khẩu không khớp"
                  )}
                </p>
              )}
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="h-11 w-full text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-opacity disabled:opacity-50"
                style={{ background: WARM_BROWN }}
              >
                {changePassword.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        )}

        {/* Tab: Địa chỉ giao hàng */}
        {activeTab === "addresses" && (
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                Danh sách địa chỉ
              </p>
              <button
                onClick={() => openAddressForm()}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors hover:opacity-80"
                style={{ color: ACCENT_DARK }}
              >
                + Thêm mới
              </button>
            </div>

            {addrLoading ? (
              <p className="mt-6 text-center text-sm" style={{ color: MUTED }}>Đang tải...</p>
            ) : !addresses?.data || addresses.data.length === 0 ? (
              <div
                className="mt-6 border border-dashed p-8 text-center text-sm"
                style={{ borderColor: "rgba(155,143,138,0.3)", color: MUTED }}
              >
                Chưa có địa chỉ nào
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.data.map((addr) => (
                  <div
                    key={addr._id}
                    className="border p-4"
                    style={{ borderColor: "rgba(155,143,138,0.2)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: WARM_BROWN }}>
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span
                          className="rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                          style={{ background: ACCENT }}
                        >
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm" style={{ color: WARM_BROWN }}>
                      {addr.receiverName} — {addr.receiverPhone}
                    </p>
                    <p className="text-sm" style={{ color: MUTED }}>
                      {addr.line1}, {addr.ward}, {addr.district}, {addr.province}
                    </p>
                    <div className="mt-3 flex gap-4">
                      <button
                        onClick={() => openAddressForm(addr)}
                        className="text-[11px] font-semibold uppercase tracking-[0.15em] hover:opacity-70"
                        style={{ color: ACCENT_DARK }}
                      >
                        Sửa
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefault.mutate(addr._id)}
                          className="text-[11px] font-semibold uppercase tracking-[0.15em] hover:opacity-70"
                          style={{ color: MUTED }}
                        >
                          Đặt mặc định
                        </button>
                      )}
                      <button
                        onClick={() => handleAddrDelete(addr._id)}
                        className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400 hover:opacity-70"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {showAddrForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md bg-white p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <h3
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: WARM_BROWN }}
              >
                {editingAddrId ? "Sửa địa chỉ" : "Thêm địa chỉ"}
              </h3>
              <button
                onClick={() => setShowAddrForm(false)}
                className="text-lg hover:opacity-60"
                style={{ color: MUTED }}
              >
                ✕
              </button>
            </div>
            <div className="mt-6 space-y-4">
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
                  <label
                    className="block text-[10px] font-semibold uppercase tracking-[0.15em]"
                    style={{ color: MUTED }}
                  >
                    {label}
                  </label>
                  <input
                    value={(addrForm as any)[field] || ""}
                    onChange={(e) => setAddrForm({ ...addrForm, [field]: e.target.value })}
                    className="mt-1.5 w-full border-b bg-transparent pb-2 text-sm outline-none focus:border-b-2"
                    style={{ borderColor: "rgba(155,143,138,0.3)", color: WARM_BROWN }}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddrForm(false)}
                  className="h-10 flex-1 border text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-slate-50"
                  style={{ borderColor: "rgba(155,143,138,0.3)", color: MUTED }}
                >
                  Huỷ
                </button>
                <button
                  onClick={handleAddrSave}
                  disabled={createAddress.isPending || updateAddress.isPending}
                  className="h-10 flex-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-opacity disabled:opacity-50"
                  style={{ background: ACCENT }}
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
