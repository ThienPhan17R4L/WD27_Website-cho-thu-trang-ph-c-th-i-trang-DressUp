import { useAddresses } from "@/hooks/useAddresses";
import type { Address } from "@/types/address";

interface Props {
  selectedId: string | null;
  onSelect: (address: Address) => void;
}

export function AddressSelector({ selectedId, onSelect }: Props) {
  const { data: addresses, isLoading } = useAddresses();

  if (isLoading) {
    return <div className="text-sm text-slate-400">Đang tải địa chỉ...</div>;
  }

  if (!addresses?.data || addresses.data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
        Chưa có địa chỉ nào. Vui lòng thêm địa chỉ trong trang Hồ sơ.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {addresses.data.map((addr) => (
        <button
          key={addr._id}
          type="button"
          onClick={() => onSelect(addr)}
          className={`w-full rounded-md border p-3 text-left text-sm transition ${
            selectedId === addr._id
              ? "border-rose-400 bg-rose-50"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
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
        </button>
      ))}
    </div>
  );
}
