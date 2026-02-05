import { useState } from "react";

export default function Topbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          ☰
        </button>
        <div className="relative w-[420px] max-w-[60vw]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm">Share</button>
        <button className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm">Export</button>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-300" />
          <div className="text-sm text-slate-700">Bonnie Green</div>
        </div>
      </div>
    </div>
  );
}
