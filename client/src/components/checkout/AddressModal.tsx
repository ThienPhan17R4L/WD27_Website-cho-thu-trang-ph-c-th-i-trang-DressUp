import { useState, useEffect } from "react";
import { Address } from "@/types/address";

const ACCENT = "rgb(213, 176, 160)";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddressId: string | "new";
  onSelectAddress: (addressId: string) => void;
  onCreateAddress: (data: any) => Promise<void>;
  onUpdateAddress: (id: string, data: any) => Promise<void>;
}

export default function AddressModal({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onCreateAddress,
  onUpdateAddress,
}: AddressModalProps) {
  const [mode, setMode] = useState<"select" | "create" | "edit">("select");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    line1: "",
    ward: "",
    district: "",
    province: "",
    label: "",
  });

  useEffect(() => {
    if (isOpen) {
      setMode("select");
      setEditingAddressId(null);
    }
  }, [isOpen]);

  const handleEditAddress = (address: Address) => {
    setMode("edit");
    setEditingAddressId(address._id);
    setForm({
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      line1: address.line1,
      ward: address.ward,
      district: address.district,
      province: address.province,
      label: address.label || "",
    });
  };

  const handleCreateNew = () => {
    setMode("create");
    setForm({
      receiverName: "",
      receiverPhone: "",
      line1: "",
      ward: "",
      district: "",
      province: "",
      label: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      receiverName: form.receiverName.trim(),
      receiverPhone: form.receiverPhone.trim(),
      line1: form.line1.trim(),
      ward: form.ward.trim(),
      district: form.district.trim(),
      province: form.province.trim(),
      label: form.label.trim() || undefined,
      country: "VN",
    };

    if (mode === "create") {
      await onCreateAddress(data);
    } else if (mode === "edit" && editingAddressId) {
      await onUpdateAddress(editingAddressId, data);
    }

    setMode("select");
  };

  const handleCancel = () => {
    if (mode === "select") {
      onClose();
    } else {
      setMode("select");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "select" && "Chọn địa chỉ giao hàng"}
            {mode === "create" && "Tạo địa chỉ mới"}
            {mode === "edit" && "Chỉnh sửa địa chỉ"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {mode === "select" && (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAddressId === addr._id
                      ? "border-2 bg-[#f7f3ef]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  style={
                    selectedAddressId === addr._id
                      ? { borderColor: ACCENT }
                      : {}
                  }
                  onClick={() => {
                    onSelectAddress(addr._id);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {addr.isDefault && (
                          <span className="text-sm">⭐</span>
                        )}
                        <span className="font-semibold text-slate-900">
                          {addr.label || addr.receiverName}
                        </span>
                        {addr.isDefault && (
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div>
                          {addr.receiverName} | {addr.receiverPhone}
                        </div>
                        <div>
                          {addr.line1}, {addr.ward}, {addr.district},{" "}
                          {addr.province}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(addr);
                      }}
                      className="text-sm font-medium hover:underline ml-4"
                      style={{ color: ACCENT }}
                    >
                      Sửa
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleCreateNew}
                className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-700 transition-colors"
              >
                ➕ Thêm địa chỉ mới
              </button>
            </div>
          )}

          {(mode === "create" || mode === "edit") && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[13px] font-medium text-slate-700">
                  Nhãn địa chỉ (tùy chọn)
                </label>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Nhà riêng, Văn phòng, v.v."
                  className="mt-2 h-12 w-full bg-[#f6f3ef] px-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700">
                  Tên người nhận *
                </label>
                <input
                  required
                  value={form.receiverName}
                  onChange={(e) =>
                    setForm({ ...form, receiverName: e.target.value })
                  }
                  className="mt-2 h-12 w-full bg-[#f6f3ef] px-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700">
                  Số điện thoại *
                </label>
                <input
                  required
                  value={form.receiverPhone}
                  onChange={(e) =>
                    setForm({ ...form, receiverPhone: e.target.value })
                  }
                  placeholder="0912345678"
                  className="mt-2 h-12 w-full bg-[#f6f3ef] px-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700">
                  Địa chỉ *
                </label>
                <input
                  required
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  placeholder="123 Đường ABC"
                  className="mt-2 h-12 w-full bg-[#f6f3ef] px-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700">
                    Phường/Xã *
                  </label>
                  <input
                    required
                    value={form.ward}
                    onChange={(e) =>
                      setForm({ ...form, ward: e.target.value })
                    }
                    className="mt-2 h-12 w-full bg-[#f6f3ef] px-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700">
                    Quận/Huyện *
                  </label>
                  <input
                    required
                    value={form.district}
                    onChange={(e) =>
                      setForm({ ...form, district: e.target.value })
                    }
                    className="mt-2 h-12 w-full bg-[#f6f3ef] px-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    required
                    value={form.province}
                    onChange={(e) =>
                      setForm({ ...form, province: e.target.value })
                    }
                    className="mt-2 h-12 w-full bg-[#f6f3ef] px-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-[rgba(213,176,160,0.8)]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 h-12 text-sm font-semibold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  {mode === "create" ? "Tạo địa chỉ" : "Cập nhật"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 h-12 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
