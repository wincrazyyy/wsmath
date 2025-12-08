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
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-900/90">
      {/* A4-ish area */}
      <div className="flex justify-center p-3">
        <div className="relative w-full max-w-[420px]">
          {/* A4 ratio: 210 x 297 */}
          <div className="relative w-full aspect-[210/297] rounded-lg bg-white shadow-md">
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

      {/* Page indicators – kept OUTSIDE the A4 aspect box and not clipped */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {GROUP_LEAFLET_PAGES.map((_, i) => {
            const isActive = i === index;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition ${
                  isActive
                    ? "w-6 bg-sky-400"
                    : "w-2 bg-neutral-600/60 hover:bg-neutral-400"
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
  // simple math for comparison
  const oneToOneHourly = 1500;
  const groupTotal = 16800;
  const lessons = 32;
  const oneToOneTotal = oneToOneHourly * lessons; // 48,000
  const groupPerLesson = Math.round(groupTotal / lessons); // 525

  return (
    <section
      id="packages"
      className="container mx-auto max-w-5xl px-4 pb-16 pt-4"
    >
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900">
        Course options
      </h2>
      <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />

      <p className="mt-4 text-sm text-neutral-600 md:text-base">
        Choose between fully personalised 1-to-1 coaching, or a high-value
        structured group course that covers the full syllabus with notes, drills
        and past-paper training.
      </p>

      {/* Pricing comparison strip */}
      <div className="mt-5 grid gap-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-xs text-neutral-700 md:grid-cols-3 md:text-sm">
        <div>
          <p className="font-semibold text-neutral-900">1-to-1 coaching</p>
          <p className="mt-1">
            HKD <span className="font-semibold">{oneToOneHourly.toLocaleString()}</span>{" "}
            / hour
          </p>
        </div>
        <div>
          <p className="font-semibold text-neutral-900">Group course</p>
          <p className="mt-1">
            HKD{" "}
            <span className="font-semibold">
              {groupTotal.toLocaleString()}
            </span>{" "}
            full programme
            <span className="ml-1 text-[11px] text-emerald-700 md:text-xs">
              (~HKD {groupPerLesson.toLocaleString()} / lesson)
            </span>
          </p>
        </div>
        <div className="md:text-right">
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
            for 32 group sessions.
          </p>
        </div>
      </div>

      {/* Two packages */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* 1-to-1 premium card */}
        <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-medium text-neutral-50">
            Premium 1-to-1
          </div>

          <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-900">
            Private online coaching
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            For students who want maximum customisation, tight accountability,
            and fast score improvements.
          </p>

          <div className="mt-4">
            <p className="text-sm text-neutral-500">From</p>
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
              Deep dive into your school tests, IA preparation, and mock exams.
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

          <div className="mt-auto pt-5">
            <WhatsAppButton
              width={220}
              height={56}
              imgClassName="h-14 w-auto"
              ariaLabel="Enquire about 1-to-1 lessons on WhatsApp"
            />
            <p className="mt-2 text-[11px] text-neutral-500">
              Mention “1-to-1 package” and your current grade / target score.
            </p>
          </div>
        </article>

        {/* Group course card */}
        <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 px-3 py-1 text-[11px] font-medium text-white">
            High-value group
          </div>

          <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-900">
            32-lesson Zoom group course
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Structured syllabus for IBMYP / IGCSE students bridging into IBDP
            AASL / AISL, with full notes and exam-style practice.
          </p>

          <div className="mt-4">
            <p className="text-sm text-neutral-500">Full programme</p>
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

          {/* Leaflet viewer fills the bottom part */}
          <div className="mt-5">
            <GroupLeafletViewer />
          </div>
        </article>
      </div>
    </section>
  );
}