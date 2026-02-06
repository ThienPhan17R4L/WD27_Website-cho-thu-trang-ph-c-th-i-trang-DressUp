import { useMemo, useState } from "react";

const ACCENT = "rgb(213, 176, 160)";

type TabKey = "desc" | "additional" | "reviews";

export function ProductTabs({
  description,
  additional,
  reviewsCount = 0,
}: {
  description?: string;
  additional?: string;
  reviewsCount?: number;
}) {
  const [tab, setTab] = useState<TabKey>("desc");

  const content = useMemo(() => {
    if (tab === "desc") return description ?? "";
    if (tab === "additional") return additional ?? "";
    return "";
  }, [tab, description, additional]);

  function TabButton({ k, label }: { k: TabKey; label: string }) {
    const active = tab === k;
    return (
      <button
        type="button"
        onClick={() => setTab(k)}
        className={[
          "px-10 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase",
          "ring-1 ring-slate-200",
          active ? "text-white" : "text-slate-500 hover:text-slate-800",
        ].join(" ")}
        style={active ? { backgroundColor: ACCENT, borderColor: ACCENT } : undefined}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="mt-14">
      <div className="flex flex-wrap gap-4">
        <TabButton k="desc" label="Description" />
        <TabButton k="additional" label="Additional Information" />
        <TabButton k="reviews" label={`Reviews (${reviewsCount})`} />
      </div>

      <div className="mt-8">
        {tab === "reviews" ? (
          <div className="text-[14px] leading-7 text-slate-600">
            {reviewsCount ? "Render reviews list here." : "No reviews yet."}
          </div>
        ) : (
          <div className="text-[14px] leading-7 text-slate-600 whitespace-pre-line">
            {content || (
              <>
                Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium
                doloremque laudantium, totam rem aperiam eaque ipsa...
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
