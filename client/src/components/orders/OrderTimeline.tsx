import { ORDER_STATUS_LABELS } from "@/types/order";
import type { StatusHistoryEntry } from "@/types/order";

interface Props {
  statusHistory: StatusHistoryEntry[];
  currentStatus: string;
}

export function OrderTimeline({ statusHistory, currentStatus }: Props) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-sm text-slate-400">
        Trạng thái: {ORDER_STATUS_LABELS[currentStatus] || currentStatus}
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {statusHistory.map((entry, index) => {
        const isLast = index === statusHistory.length - 1;
        const label = ORDER_STATUS_LABELS[entry.status] || entry.status;
        const date = new Date(entry.timestamp);

        return (
          <div key={index} className="relative pb-4 last:pb-0">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-[-17px] top-3 h-full w-px bg-slate-200" />
            )}
            {/* Dot */}
            <div
              className={`absolute left-[-21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
                isLast
                  ? "border-rose-500 bg-rose-500"
                  : "border-slate-300 bg-white"
              }`}
            />
            <div>
              <span className="text-sm font-medium text-slate-900">{label}</span>
              <span className="ml-2 text-xs text-slate-400">
                {date.toLocaleDateString("vi-VN")} {date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
              {entry.notes && (
                <p className="mt-0.5 text-xs text-slate-500">{entry.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
