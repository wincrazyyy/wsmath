"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WhatsAppButton } from "./whatsapp-button";

// Pricing constants for easy comparison
const PRIVATE_RATE = 1500; // HKD per hour
const GROUP_PRICE = 16800; // HKD upfront
const GROUP_LESSONS = 32;
const EFFECTIVE_GROUP_RATE = GROUP_PRICE / GROUP_LESSONS; // 525
const PRIVATE_32_HOURS = PRIVATE_RATE * GROUP_LESSONS; // 48,000

// Tip: export your leaflet PDF as separate PNG/JPG pages into /public/leaflets
const GROUP_LEAFLET_PAGES = [
  "/leaflets/group-leaflet-page-1.jpg",
  "/leaflets/group-leaflet-page-2.jpg",
  "/leaflets/group-leaflet-page-3.jpg",
  "/leaflets/group-leaflet-page-4.jpg",
  "/leaflets/group-leaflet-page-5.jpg",
  "/leaflets/group-leaflet-page-6.jpg",
  "/leaflets/group-leaflet-page-7.jpg",
];

function GroupLeafletViewer() {
  const [index, setIndex] = useState(0);
  const pageCount = GROUP_LEAFLET_PAGES.length;

  useEffect(() => {
    if (pageCount <= 1) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % pageCount);
    }, 6000);

    return () => clearInterval(id);
  }, [pageCount]);

  if (pageCount === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500">
        Upload leaflet pages to <code>/public/leaflets</code> to preview them here.
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900/90">
      {/* A4-ish aspect ratio, with a max height so it doesn't dominate */}
      <div className="relative mx-auto w-full max-w-[420px] max-h-[520px]">
        <div className="relative aspect-[210/297] w-full">
          <Image
            src={GROUP_LEAFLET_PAGES[index]}
            alt={`Group course leaflet page ${index + 1}`}
            fill
            className="object-contain bg-white"
            sizes="(min-width: 768px) 420px, 90vw"
          />
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          {GROUP_LEAFLET_PAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 w-4 rounded-full transition ${
                i === index
                  ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500"
                  : "bg-neutral-500/40 hover:bg-neutral-400/70"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PackagesSection() {
  return (
    <section className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Course options
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
            Two ways to work with WSMath
          </h2>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            Choose between fully tailored 1:1 coaching, or a structured high-value group
            programme that covers the same core IBDP syllabus at a fraction of the cost.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* 1:1 Premium Package */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-6 shadow-sm">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-sky-400/10 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
              Premium 1:1 Coaching
            </span>

            <div className="mt-4 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-neutral-900">
                HKD {PRIVATE_RATE.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-neutral-500">per hour</p>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Ideal for Level 7 / A* targets, entrance exams and students needing bespoke pacing.
            </p>

            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Fully customised lesson plans based on school tests, mock exams, and target
                universities.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Real-time correction on iPad + GoodNotes, with recordings and annotated solutions.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Exam-technique drills, mock-paper marking, and strategy for Paper 1 / 2 / 3.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Priority support for urgent test prep or predicted-grade upgrades.
              </li>
            </ul>

            <p className="mt-4 text-xs text-neutral-500">
              32 hours of 1:1 coaching at this level would be{" "}
              <span className="font-semibold text-neutral-900">
                HKD {PRIVATE_32_HOURS.toLocaleString()}
              </span>
              , fully tailored around one student.
            </p>

            <div className="mt-4">
              <WhatsAppButton
                width={220}
                height={56}
                imgClassName="h-12 w-auto"
                ariaLabel="Enquire about 1:1 premium coaching on WhatsApp"
              />
            </div>
          </div>
        </div>

        {/* Group Course Package */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 via-violet-50/80 to-sky-50/80 p-6 shadow-sm">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-500/15 via-violet-500/15 to-sky-400/15 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-100">
              Zoom Group Course
            </span>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-2xl font-bold tracking-tight text-neutral-900">
                HKD {GROUP_PRICE.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-neutral-500">
                full programme • 32 lessons
              </p>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Effective rate ~{" "}
              <span className="font-semibold text-neutral-900">
                HKD {Math.round(EFFECTIVE_GROUP_RATE).toLocaleString()}
              </span>{" "}
              per live Zoom lesson, plus notes and practice sets.
            </p>

            <ul className="mt-4 space-y-2 text-sm text-neutral-800">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                ~32 live small-group Zoom lessons, covering all key IBDP AASL / AISL topics.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Structured leaflet-style notes that explain the concepts clearly — students
                revise from PDF before/after class.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                By-topic past-paper packs with model solutions, aligned to the IBDP exam style.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                Ideal for students who want WSMath methods at{" "}
                <span className="font-semibold">~⅓ of the 1:1 hourly rate</span>.
              </li>
            </ul>

            {/* Leaflet viewer */}
            <GroupLeafletViewer />
          </div>
        </div>
      </div>

      {/* Comparison strip */}
      <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-700 sm:text-sm">
        <p>
          For the same 32-lesson framework,{" "}
          <span className="font-semibold">
            1:1 = HKD {PRIVATE_32_HOURS.toLocaleString()}
          </span>{" "}
          vs{" "}
          <span className="font-semibold">
            Group = HKD {GROUP_PRICE.toLocaleString()}
          </span>
          . The group course gives you Winson&apos;s methods, notes, and by-topic practice at
          roughly <span className="font-semibold">35% of the 1:1 hourly cost</span>.
        </p>
      </div>
    </section>
  );
}
