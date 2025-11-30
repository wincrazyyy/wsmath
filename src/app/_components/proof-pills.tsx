"use client";

import { useEffect, useState } from "react";

const PILLS = [
  "50%+ IBDP Level 7 track record",
  "100% A* in A-Level Math & Further Math",
  "17,000+ teaching hours",
  "200+ one-to-one students",
];

const SLOT_OFFSET = 40;

export function ProofPills() {
  const [centerIndex, setCenterIndex] = useState(0);

  useEffect(() => {
    if (PILLS.length <= 1) return;

    const id = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % PILLS.length);
    }, 3200);

    return () => clearInterval(id);
  }, []);

  const getPosition = (index: number) => {
    const n = PILLS.length;
    const offset = (index - centerIndex + n) % n;

    if (offset === 0) return 0;
    if (offset === 1) return 1;
    if (offset === n - 1) return -1;

    return offset < n / 2 ? 2 : -2;
  };

  return (
    <div className="mt-4 w-full">
      {/* 3 Rows; Middle big, 2 small */}
      <div className="relative h-[120px] overflow-hidden md:h-[130px]">
        {PILLS.map((text, index) => {
          const pos = getPosition(index);
          const isCenter = pos === 0;
          const isVisible = Math.abs(pos) <= 1;

          const translate = pos * SLOT_OFFSET;

          return (
            <div
              key={text}
              className={[
                "absolute left-0 right-0 px-1 transition-all duration-500 ease-out",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
                isCenter ? "z-10" : "z-0",
              ].join(" ")}
              style={{
                top: "50%",
                transform: `translateY(-50%) translateY(${translate}px)`,
              }}
            >
              {/* Pill content */}
              {isCenter ? (
                <div className="inline-flex w-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 p-[1.5px] shadow-md">
                  <span className="flex w-full items-center justify-between rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-900 md:px-6 md:py-4 md:text-base">
                    {text}
                  </span>
                </div>
              ) : (
                <span className="flex w-full items-center justify-between rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-[11px] font-medium text-neutral-600 opacity-80 shadow-sm md:text-xs">
                  {text}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
