// app/_components/sections/packages/private-package-card.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { PrivateConfig } from "@/app/_lib/content/types/packages.types";
import styles from "./private-package-card.module.css";
import { BookButton } from "../../ui/book-button";

interface PrivatePackageCardProps {
  config: PrivateConfig;
  privateRate: number;
  intensiveLessons: number;
  eightLessonBlockCost: number;
}

const HIGHLIGHT_EVENT = "wsmath:highlight";
const SOLO_CARD_ID = "solo-lessons";

export function PrivatePackageCard({
  config,
  privateRate,
  intensiveLessons,
  eightLessonBlockCost,
}: PrivatePackageCardProps) {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const onHighlight = (e: Event) => {
      const ce = e as CustomEvent<{ id?: string; ms?: number }>;
      if (ce.detail?.id !== SOLO_CARD_ID) return;

      setHighlight(true);
      const ms = Math.max(900, ce.detail?.ms ?? 2600);
      window.setTimeout(() => setHighlight(false), ms);
    };

    window.addEventListener(HIGHLIGHT_EVENT, onHighlight as EventListener);
    return () =>
      window.removeEventListener(HIGHLIGHT_EVENT, onHighlight as EventListener);
  }, []);

  return (
    <article
      id={SOLO_CARD_ID}
      className={[
        "relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-md",
        "ring-1 ring-transparent transition",
        "hover:-translate-y-1 hover:shadow-lg hover:ring-neutral-200",
        highlight
          ? [
              "border-violet-300 ring-2 ring-violet-500/80",
              "bg-violet-50/40",
              "shadow-2xl shadow-violet-400/30",
              styles.highlightPulse, // <-- add the module class here
            ].join(" ")
          : "",
      ].join(" ")}
    >
      {/* stronger glow layer */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute -inset-1 rounded-[22px] opacity-0 blur-xl transition-opacity duration-300",
          highlight ? "opacity-100 bg-gradient-to-r from-indigo-400/35 via-violet-400/35 to-sky-400/35" : "",
        ].join(" ")}
      />

      <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 px-3 py-1 text-[11px] font-medium text-neutral-50">
        {config.label}
      </div>

      {/* PRICE */}
      <div className="relative z-10 mt-4">
        <p className="text-xs text-neutral-500">{config.rateLabel}</p>
        <p className="text-2xl font-semibold tracking-tight text-neutral-900">
          HKD {privateRate.toLocaleString()}
          <span className="ml-1 text-xs font-normal text-neutral-500">/ hour</span>
        </p>
      </div>

      <h3 className="relative z-10 mt-3 text-lg font-semibold tracking-tight text-neutral-900 md:text-xl">
        {config.title}
      </h3>
      <p className="relative z-10 mt-1 text-sm text-neutral-600">{config.description}</p>

      <ul className="relative z-10 mt-4 space-y-2 text-sm text-neutral-700">
        {(config.points ?? []).map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[0.35rem] h-2 w-2 flex-none rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
            {item}
          </li>
        ))}
      </ul>

      {/* 8-lesson intensive block */}
      <div className="relative z-10 mt-7 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
          {config.intensive.label}
        </p>
        <p className="mt-1 text-sm text-neutral-700">
          {config.intensive.bodyPrefix}{" "}
          <span className="font-semibold">HKD {eightLessonBlockCost.toLocaleString()}</span>{" "}
          for an {intensiveLessons}-lesson block (8 × 60 mins).
        </p>

        <ul className="mt-3 space-y-1.5 text-sm text-neutral-800">
          {(config.intensive.points ?? []).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-[0.35rem] h-2 w-2 flex-none rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* image (between content and WhatsApp) */}
      <div className="relative z-10 mt-6 flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 min-h-[140px]">
        <Image
          src={config.privateSrc}
          alt="Tutor pointing upward"
          fill
          sizes="(max-width: 640px) 100vw, 560px"
          className="object-cover object-top"
          priority
        />
      </div>

      <div className="relative z-10 mt-auto pt-5">
        <BookButton
          label={config.bookLabel}
          ariaLabel="Enquire about 1-to-1 lessons on WhatsApp"
        />
      </div>
    </article>
  );
}
