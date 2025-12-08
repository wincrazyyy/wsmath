// app/_components/packages-section.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WhatsAppButton } from "./whatsapp-button";
import packagesContent from "@/app/_lib/content/packages.json";

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

// ===== Group leaflet viewer driven by JSON =====
const LEAFLET = packagesContent.group.leaflet ?? {
  label: "Course leaflet preview",
  pages: [] as string[],
  autoAdvanceSeconds: "5",
};

const GROUP_LEAFLET_PAGES = LEAFLET.pages ?? [];

export function GroupLeafletViewer() {
  const [index, setIndex] = useState(0);
  const pageCount = GROUP_LEAFLET_PAGES.length;
  const autoSeconds = toNumber(LEAFLET.autoAdvanceSeconds, 5);

  useEffect(() => {
    if (pageCount <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % pageCount);
    }, autoSeconds * 1000);

    return () => clearInterval(timer);
  }, [pageCount, autoSeconds]);

  if (pageCount === 0) return null;

  const currentSrc = GROUP_LEAFLET_PAGES[index];

  return (
    <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/95 px-4 pb-4 pt-3 shadow-md">
      <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-300">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          {LEAFLET.label || "Course leaflet preview"}
        </span>
        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-200">
          Page {index + 1} / {pageCount}
        </span>
      </div>

      {/* A4-ish area */}
      <div className="mt-3 flex justify-center">
        <div className="relative w-full max-w-[420px]">
          {/* A4 ratio: 210 x 297 */}
          <div className="relative w-full aspect-[210/297] overflow-hidden rounded-xl bg-neutral-900 shadow-lg ring-1 ring-neutral-800">
            <Image
              src={currentSrc}
              alt={`Course leaflet page ${index + 1}`}
              fill
              className="object-contain"
              sizes="420px"
            />
          </div>
        </div>
      </div>

      {/* Page indicators */}
      {pageCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {GROUP_LEAFLET_PAGES.map((_, i) => {
            const isActive = i === index;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "w-6 bg-sky-400 shadow-[0_0_0_3px_rgba(56,189,248,0.35)]"
                    : "w-2 bg-neutral-600/70 hover:bg-neutral-400"
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== Main section driven by packages.json =====
export function PackagesSection() {
  const data = packagesContent;

  const privateCfg = data.private;
  const groupCfg = data.group;

  const privateRate = toNumber(privateCfg.hourlyRate);
  const groupPrice = toNumber(groupCfg.price);
  const groupLessons = Math.max(1, toNumber(groupCfg.lessons, 32));
  const intensiveLessons = Math.max(
    1,
    toNumber(privateCfg.intensive.lessons, 8)
  );

  const private32Hours = privateRate * groupLessons;
  const groupRatePerLesson = Math.round(groupPrice / groupLessons);
  const eightLessonBlockCost = privateRate * intensiveLessons;

  return (
    <section
      id="packages"
      className="container mx-auto max-w-5xl px-4 pb-4 pt-6"
    >
      {/* Heading */}
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
            {data.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-600 md:text-base">
            {data.subtitle}
          </p>
        </div>
        {data.topBadge && (
          <div className="hidden md:block">
            <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-50">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              {data.topBadge}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />

      {/* Pricing comparison strip */}
      <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/90 p-4 text-xs text-neutral-700 shadow-sm md:text-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {data.comparison.privateLabel}
            </p>
            <p className="mt-1 text-sm text-neutral-800">
              HKD{" "}
              <span className="text-lg font-semibold text-neutral-900">
                {privateRate.toLocaleString()}
              </span>{" "}
              <span className="text-xs text-neutral-500">/ hour</span>
            </p>
          </div>

          <div className="hidden h-10 w-px bg-neutral-200 md:block" />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {data.comparison.groupLabel}
            </p>
            <p className="mt-1 text-sm text-neutral-800">
              HKD{" "}
              <span className="text-lg font-semibold text-neutral-900">
                {groupPrice.toLocaleString()}
              </span>{" "}
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                / full programme
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                  ~HKD {groupRatePerLesson.toLocaleString()} / lesson
                </span>
              </span>
            </p>
          </div>

          <div className="hidden h-10 w-px bg-neutral-200 md:block" />

          <div className="rounded-xl bg-white px-3 py-2 text-xs text-neutral-800 shadow-sm md:text-sm">
            <p className="font-semibold text-neutral-900">
              {data.comparison.title}
            </p>
            <p className="mt-1">
              {data.comparison.privateLinePrefix}{" "}
              <span className="font-semibold">
                HKD {private32Hours.toLocaleString()}
              </span>{" "}
              vs{" "}
              <span className="font-semibold text-sky-700">
                HKD {groupPrice.toLocaleString()}
              </span>{" "}
              {data.comparison.groupLineSuffix}
            </p>
          </div>
        </div>
      </div>

      {/* Two packages */}
      <div className="mt-7 grid gap-6 md:grid-cols-2">
        {/* 1-to-1 premium card */}
        <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-md ring-1 ring-transparent transition hover:-translate-y-1 hover:shadow-lg hover:ring-neutral-200">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 px-3 py-1 text-[11px] font-medium text-neutral-50">
            {privateCfg.label}
          </div>

          {/* PRICE */}
          <div className="mt-4">
            <p className="text-xs text-neutral-500">
              {privateCfg.rateLabel}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-neutral-900">
              HKD {privateRate.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-neutral-500">
                / hour
              </span>
            </p>
          </div>

          <h3 className="mt-3 text-lg font-semibold tracking-tight text-neutral-900 md:text-xl">
            {privateCfg.title}
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            {privateCfg.description}
          </p>

          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            {(privateCfg.points ?? []).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[0.35rem] h-2 w-2 flex-none rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                {item}
              </li>
            ))}
          </ul>

          {/* 8-lesson intensive block */}
          <div className="mt-7 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
              {privateCfg.intensive.label}
            </p>
            <p className="mt-1 text-sm text-neutral-700">
              {privateCfg.intensive.bodyPrefix}{" "}
              <span className="font-semibold">
                HKD {eightLessonBlockCost.toLocaleString()}
              </span>{" "}
              for an {intensiveLessons}-lesson block (8 × 60 mins).
            </p>

            <ul className="mt-3 space-y-1.5 text-sm text-neutral-800">
              {(privateCfg.intensive.points ?? []).map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[0.35rem] h-2 w-2 flex-none rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-5">
            <WhatsAppButton
              width={220}
              height={56}
              imgClassName="h-14 w-auto"
              ariaLabel="Enquire about 1-to-1 lessons on WhatsApp"
            />
            {privateCfg.buttonNote && (
              <p className="mt-2 text-[11px] text-neutral-500">
                {privateCfg.buttonNote}
              </p>
            )}
          </div>
        </article>

        {/* Group course card */}
        <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-md ring-2 ring-sky-100 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 px-3 py-1 text-[11px] font-medium text-white">
              {groupCfg.label}
            </div>
            {groupCfg.tag && (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-sky-700">
                {groupCfg.tag}
              </span>
            )}
          </div>

          {/* PRICE */}
          <div className="mt-4">
            <p className="text-xs text-neutral-500">
              {groupCfg.programmeLabel}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-neutral-900">
              HKD {groupPrice.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-neutral-500">
                (~HKD {groupRatePerLesson.toLocaleString()} / lesson)
              </span>
            </p>
          </div>

          <h3 className="mt-3 text-lg font-semibold tracking-tight text-neutral-900 md:text-xl">
            {groupCfg.title}
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            {groupCfg.description}
          </p>

          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            {(groupCfg.points ?? []).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[0.35rem] h-2 w-2 flex-none rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <GroupLeafletViewer />
          </div>
        </article>
      </div>
    </section>
  );
}
