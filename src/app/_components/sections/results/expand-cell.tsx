// src/app/_components/sections/results/expand-cell.tsx
"use client";

type Props = {
  count: number;
  items: string[];
  gradeLabel?: string;
  pinned: boolean;
  active: boolean;
  onPinChange: (nextPinned: boolean) => void;
};

export function ExpandCell({ count, items, gradeLabel, pinned, active, onPinChange }: Props) {
  function togglePin() {
    onPinChange(!pinned);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={active}
      onClick={togglePin}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          togglePin();
        }
        if (e.key === "Escape") onPinChange(false);
      }}
      className={[
        "h-full w-full min-w-0 min-h-0 overflow-hidden rounded-lg border bg-white px-2 py-2",
        "flex flex-col",
        "transition-[box-shadow,border-color,background-color] duration-200",
        active
          ? "border-indigo-400 bg-indigo-50/70 shadow-lg shadow-indigo-200/40 ring-2 ring-indigo-300"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-md",
      ].join(" ")}
    >
      {/* Always visible header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {gradeLabel && (
            <div className="inline-flex items-center gap-2">
              <span
                className={[
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold",
                  "bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-violet-500/15",
                  "text-indigo-700 ring-1 ring-indigo-200",
                ].join(" ")}
              >
                Final Grade <span className="ml-1 font-bold">{gradeLabel}</span>
              </span>
            </div>
          )}

          <div className="mt-1 text-sm font-semibold text-slate-900">
            {count} {count === 1 ? "Student" : "Students"}
          </div>
        </div>

        <div className="shrink-0 text-[10px] text-slate-400">
          {pinned ? "Pinned" : "Hover / click"}
        </div>
      </div>


      <div className="text-[11px] text-slate-500">
        {count === 1 ? "student" : "students"}
      </div>

      {/* Only render expanded content when active (prevents overflow in compressed siblings) */}
      {active && (
        <div className="mt-2 min-h-0 flex-1 flex flex-col">
          <div className="min-h-0 flex-1 overflow-auto pr-1">
            <div className="text-[11px] leading-snug text-slate-700 whitespace-normal break-words">
              {items.join(", ")}
            </div>
          </div>

          <div className="mt-2 shrink-0 text-[10px] text-slate-400">
            {pinned ? "Click to collapse" : "Click to pin open"}
          </div>
        </div>
      )}
    </div>
  );
}
