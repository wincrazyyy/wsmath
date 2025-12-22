// app/_components/sections/home/proof-pills.tsx
"use client";

import type React from "react";
import homeContent from "@/app/_lib/content/json/home.json";
import styles from "./proof-pills.module.css";

type PillStyle = React.CSSProperties & {
  "--delay"?: string;
  "--floatDuration"?: string;
};

export function ProofPills() {
  const pills = homeContent.proofPills as string[];

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {pills.map((t, i) => (
        <span
          key={t}
          className={`${styles.proofPill} flex w-full justify-center sm:inline-flex sm:w-auto rounded-full bg-gradient-to-r from-indigo-500/70 via-violet-500/70 to-sky-500/70 p-[1px]`}
          style={
            {
              "--delay": `${i * 0.12}s`,
              "--floatDuration": `${4.5 + i * 0.6}s`,
            } as PillStyle
          }
        >
          <span
            className={`${styles.innerPill} inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-[0.8rem] font-semibold text-neutral-800 shadow-sm md:text-sm sm:w-auto`}
          >
            <span className="h-1 w-1 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
            {t}
          </span>
        </span>
      ))}
    </div>
  );
}
