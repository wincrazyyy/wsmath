"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WhatsAppButton } from "./whatsapp-button";

const PRIVATE_RATE = 1500; // HKD per hour
const GROUP_PRICE = 16800; // HKD upfront
const GROUP_LESSONS = 32;
const EFFECTIVE_GROUP_RATE = GROUP_PRICE / GROUP_LESSONS; // 525
const PRIVATE_32_HOURS = PRIVATE_RATE * GROUP_LESSONS; // 48,000

const GROUP_LEAFLET_PAGES = [
  "/leaflets/group-leaflet-page-1.jpg",
  "/leaflets/group-leaflet-page-2.jpg",
  "/leaflets/group-leaflet-page-3.jpg",
  "/leaflets/group-leaflet-page-4.jpg",
  "/leaflets/group-leaflet-page-5.jpg",
  "/leaflets/group-leaflet-page-6.jpg",
  "/leaflets/group-leaflet-page-7.jpg",
];

const AUTO_ADVANCE_SECONDS = 5;

export function GroupLeafletViewer() {
  const [index, setIndex] = useState(0);
  const pageCount = GROUP_LEAFLET_PAGES.length;

  useEffect(() => {
    if (pageCount <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % pageCount);
    }, AUTO_ADVANCE_SECONDS * 1000);

    return () => clearInterval(timer);
  }, [pageCount]);

  if (pageCount === 0) return null;

  const currentSrc = GROUP_LEAFLET_PAGES[index];

  return (
    <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/95 px-4 pb-4 pt-3 shadow-md">
      <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-300">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Course leaflet preview
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
                    ? "w-6 bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.35)]"
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

export function PackagesSection() {
  const oneToOneHourly = 1500;
  const groupTotal = 16800;
  const lessons = 32;
  const oneToOneTotal = oneToOneHourly * lessons; // 48,000
  const groupPerLesson = Math.round(groupTotal / lessons); // 525
  const eightLessonCost = oneToOneHourly * 8; // 12,000

  return (
    <section
      id="packages"
      className="container mx-auto max-w-5xl px-4 pb-16 pt-6"
    >
      {/* Heading */}
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
            Course options &amp; pricing
          </h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-600 md:text-base">
            Choose between{" "}
            <span className="font-medium text-neutral-900">
              fully personalised 1-to-1 coaching
            </span>{" "}
            or a{" "}
            <span className="font-medium text-neutral-900">
              high-value structured group programme
            </span>{" "}
            that builds a rock-solid foundation for IBDP exams.
          </p>
        </div>
        <div className="hidden md:block">
          <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-50">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            IB / A-Level specialist since 2017
          </span>
        </div>
      </div>

      <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />

      {/* Pricing comparison strip */}
      <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/90 p-4 text-xs text-neutral-700 shadow-sm md:text-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Standard 1-to-1 rate
            </p>
            <p className="mt-1 text-sm text-neutral-800">
              HKD{" "}
              <span className="text-lg font-semibold text-neutral-900">
                {oneToOneHourly.toLocaleString()}
              </span>{" "}
              <span className="text-xs text-neutral-500">/ hour</span>
            </p>
          </div>

          <div className="hidden h-10 w-px bg-neutral-200 md:block" />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Group course investment
            </p>
            <p className="mt-1 text-sm text-neutral-800">
              HKD{" "}
              <span className="text-lg font-semibold text-neutral-900">
                {groupTotal.toLocaleString()}
              </span>{" "}
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                / full programme
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  ~HKD {groupPerLesson.toLocaleString()} / lesson
                </span>
              </span>
            </p>
          </div>

          <div className="hidden h-10 w-px bg-neutral-200 md:block" />

          <div className="rounded-xl bg-white px-3 py-2 text-xs text-neutral-800 shadow-sm md:text-sm">
            <p className="font-semibold text-neutral-900">Value comparison</p>
            <p className="mt-1">
              32 hours 1-to-1 ≈{" "}
              <span className="font-semibold">
                HKD {oneToOneTotal.toLocaleString()}
              </span>{" "}
              vs{" "}
              <span className="font-semibold text-emerald-700">
                HKD {groupTotal.toLocaleString()}
              </span>{" "}
              for 32 structured group sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Two packages */}
      <div className="mt-7 grid gap-6 md:grid-cols-2">
        {/* 1-to-1 premium card */}
        <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-md ring-1 ring-transparent hover:-translate-y-1 hover:shadow-lg hover:ring-neutral-200 transition">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 px-3 py-1 text-[11px] font-medium text-neutral-50">
            Premium 1-to-1
          </div>

          <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-900 md:text-xl">
            Private online coaching
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            For students who want maximum customisation, tight accountability,
            and fast score improvements.
          </p>

          <div className="mt-4">
            <p className="text-xs text-neutral-500">Typical rate</p>
            <p className="text-2xl font-semibold tracking-tight text-neutral-900">
              HKD {oneToOneHourly.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-neutral-500">
                / hour
              </span>
            </p>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              Deep dive into school tests, IA preparation, and mock exams.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              Fully personalised by-topic drills and homework, adjusted weekly.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              Ideal if you’re pushing for{" "}
              <span className="font-semibold">Level 6–7 / A*</span> and want
              strict pacing.
            </li>
          </ul>

          {/* 8-lesson intensive block */}
          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
              8-lesson intensive
            </p>
            <p className="mt-1 text-xs text-neutral-700">
              Around{" "}
              <span className="font-semibold">
                HKD {eightLessonCost.toLocaleString()}
              </span>{" "}
              for an 8-lesson block (8 × 60 mins).
            </p>

            <ul className="mt-3 space-y-1.5 text-xs text-neutral-800">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Priority online correspondence.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Unlimited tailor-made past-paper practice with step-by-step
                solutions.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                8 online lessons of 60 minutes with custom time allocation.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Detailed summary by topic and{" "}
                <span className="font-semibold">school mock exam prediction</span>.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                IBDP Math IA topic setup &amp; guidance until completion.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Expected{" "}
                <span className="font-semibold">
                  2 grades improvement or better
                </span>{" "}
                (e.g. from 5 to 7 in IBDP or from B to A* in A-Level) with full
                commitment.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                GoodNotes 6 one-time payment sponsorship.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Referral rebate of up to{" "}
                <span className="font-semibold">HKD 3,000</span> per student
                referred.
              </li>
            </ul>
          </div>

          <div className="mt-auto pt-5">
            <WhatsAppButton
              width={220}
              height={56}
              imgClassName="h-14 w-auto"
              ariaLabel="Enquire about 1-to-1 lessons on WhatsApp"
            />
            <p className="mt-2 text-[11px] text-neutral-500">
              Mention “1-to-1 8-lesson package” and your current grade / target
              score.
            </p>
          </div>
        </article>

        {/* Group course card */}
        <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-md ring-2 ring-emerald-100 hover:-translate-y-1 hover:shadow-lg transition">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 px-3 py-1 text-[11px] font-medium text-white">
              High-value group
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-700">
              Most popular
            </span>
          </div>

          <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-900 md:text-xl">
            32-lesson Zoom group course
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Structured syllabus for IBMYP / IGCSE students bridging into IBDP
            AASL / AISL, with full notes and exam-style practice.
          </p>

          <div className="mt-4">
            <p className="text-xs text-neutral-500">Full programme</p>
            <p className="text-2xl font-semibold tracking-tight text-neutral-900">
              HKD {groupTotal.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-neutral-500">
                (~HKD {groupPerLesson.toLocaleString()} / lesson)
              </span>
            </p>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              Approx. 32 live Zoom lessons + high-quality teaching videos.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              By-topic notes, GoodNotes materials, and curated past-paper sets.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              Designed so motivated students can rely on group only and still
              reach strong exam results.
            </li>
          </ul>

          <div className="mt-5">
            <GroupLeafletViewer />
          </div>
        </article>
      </div>
    </section>
  );
}
