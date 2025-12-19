// src/app/_components/sections/results/expand-cell.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  count: number;
  items: string[];
  pinned: boolean;
  onPinChange: (nextPinned: boolean) => void;
};

export function ExpandCell({ count, items, pinned, onPinChange }: Props) {
  const [hovered, setHovered] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const active = pinned || hovered;

  function clearCloseTimer() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function onEnter() {
    clearCloseTimer();
    setHovered(true);
  }

  function onLeave() {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setHovered(false), 120);
  }

  useEffect(() => () => clearCloseTimer(), []);

  function togglePin() {
    onPinChange(!pinned);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={active}
      onClick={togglePin}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          togglePin();
        }
        if (e.key === "Escape") {
          onPinChange(false);
          setHovered(false);
        }
      }}
      className={[
        "w-full min-w-0 rounded-lg border bg-white px-2 py-2",
        "transition-[box-shadow,border-color,background-color] duration-200",
        active
          ? "border-indigo-400 bg-indigo-50/70 shadow-lg shadow-indigo-200/40 ring-2 ring-indigo-300"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-md",
      ].join(" ")}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">{count}</div>
        <div className="text-[10px] text-slate-400">
          {pinned ? "Pinned" : "Hover / click"}
        </div>
      </div>

      <div className="text-[11px] text-slate-500">
        {count === 1 ? "student" : "students"}
      </div>

      <div
        className={[
          "overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
          active ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="mt-2 max-h-[180px] overflow-auto pr-1">
          <div className="text-[11px] leading-snug text-slate-700 whitespace-normal break-words">
            {items.join(", ")}
          </div>
        </div>

        <div className="mt-2 text-[10px] text-slate-400">
          {pinned ? "Click to collapse" : "Click to pin open"}
        </div>
      </div>
    </div>
  );
}
