"use client";

import type React from "react";
import homeContent from "@/app/_lib/content/json/home.json";

export function ProofPills() {
  const pills = homeContent.proofPills as string[];

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {pills.map((t, i) => (
        <span
          key={t}
          className="proof-pill inline-flex rounded-full bg-gradient-to-r from-indigo-500/70 via-violet-500/70 to-sky-500/70 p-[1px]"
          style={
            {
              "--delay": `${i * 0.12}s`,
              "--floatDuration": `${4.5 + i * 0.6}s`,
            } as React.CSSProperties
          }
        >
          <span className="inner-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[0.8rem] font-semibold text-neutral-800 shadow-sm md:text-sm">
            <span className="h-1 w-1 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
            {t}
          </span>
        </span>
      ))}

      <style jsx>{`
        .proof-pill {
          opacity: 0;
          transform: translateY(20px) scale(0.94);
          animation:
            pillEntrance 0.7s var(--delay, 0s) cubic-bezier(0.22, 0.8, 0.35, 1)
              forwards,
            pillFloat var(--floatDuration, 5s)
              calc(0.7s + var(--delay, 0s)) ease-in-out infinite;
        }

        .inner-pill {
          transition:
            transform 180ms ease-out,
            box-shadow 180ms ease-out,
            background-color 180ms ease-out;
        }

        .proof-pill:hover .inner-pill {
          transform: translateY(-2px) scale(1.02);
          box-shadow:
            0 10px 25px rgba(15, 23, 42, 0.12),
            0 0 0 1px rgba(148, 163, 184, 0.35);
        }

        @keyframes pillEntrance {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.94);
          }
          60% {
            opacity: 1;
            transform: translateY(-6px) scale(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pillFloat {
          0% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-6px);
          }
          50% {
            transform: translateY(-2px);
          }
          75% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
