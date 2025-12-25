// app/_components/sections/results/results-schools.tsx
"use client";

import { ResultsSchoolsConfig } from "@/app/_lib/content/types/results.types";

export function ResultsSchools({ data }: { data: ResultsSchoolsConfig }) {
  const { eyebrow, heading, subheading, items } = data;

  if (!items || items.length === 0) return null;

  return (
    <section className="container mt-10 max-w-5xl">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              {eyebrow}
            </p>
            <h3 className="mt-1 text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
              {heading}
            </h3>
            {subheading ? (
              <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
                {subheading}
              </p>
            ) : null}
          </div>

          <div className="hidden sm:block h-10 w-10 rounded-full border border-neutral-200 bg-neutral-50" />
        </div>

        <ul className="mt-6 grid gap-x-10 gap-y-4 text-sm text-neutral-700 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((name) => (
            <li key={name} className="leading-relaxed">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
