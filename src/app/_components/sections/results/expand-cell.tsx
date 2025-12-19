// src/app/_components/sections/results/expand-cell.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export function ExpandCell({ count, items }: { count: number; items: string[] }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const active = open || hovered;

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

  function toggle() {
    setOpen((v) => !v);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={active}
      onClick={toggle}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
        if (e.key === "Escape") {
          setOpen(false);
          setHovered(false);
        }
      }}
      className={[
        "w-full rounded-lg border bg-white px-2 py-2",
        "transition-[box-shadow,border-color,background-color] duration-200",
        active
          ? "border-indigo-400 bg-indigo-50/70 shadow-lg shadow-indigo-200/40 ring-2 ring-indigo-300"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-md",
      ].join(" ")}
    >
      {/* header stays visible always */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">{count}</div>
        <div className="text-[10px] text-slate-400">
          {open ? "Pinned" : "Hover / click"}
        </div>
      </div>
      <div className="text-[11px] text-slate-500">
        {count === 1 ? "student" : "students"}
      </div>

      {/* EXPAND IN FLOW (this is the key change) */}
      <div
        className={[
          "overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
          active ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="mt-2 max-h-[180px] overflow-auto pr-1">
          <ul className="space-y-1 text-[11px] text-slate-700 whitespace-normal break-words">
            {items.map((x) => (
              <li key={x} className="leading-snug">
                {x}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-2 text-[10px] text-slate-400">
          {open ? "Click to collapse" : "Click to pin open"}
        </div>
      </div>
    </div>
  );
}
