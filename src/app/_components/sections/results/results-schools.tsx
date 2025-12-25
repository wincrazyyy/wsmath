// app/_components/sections/results/results-schools.tsx
"use client";

import { ResultsSchoolsConfig } from "@/app/_lib/content/types/results.types";

export function ResultsSchools({ data }: { data: ResultsSchoolsConfig }) {
  const { eyebrow, heading, subheading, items } = data;

  if (!items || items.length === 0) return null;

  return (
    <section className="container mt-10 max-w-5xl">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
        {/* Header (removed the right circle) */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
            {heading}
          </h3>
          {subheading ? (
            <p className="mt-1 text-xs text-neutral-600 sm:text-sm">{subheading}</p>
          ) : null}
        </div>

        {/* Cards shell */}
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-[1px]">
          <ul className="grid gap-2 rounded-[1.1rem] bg-white/90 p-3 backdrop-blur-sm sm:grid-cols-2 sm:gap-3 sm:p-4 lg:grid-cols-3">
            {items.map((name) => (
              <li key={name} className="h-full">
                <div
                  className={[
                    "group relative h-full rounded-xl p-[1px]",
                    "transition-transform duration-200 ease-out",
                    "hover:-translate-y-0.5",
                  ].join(" ")}
                >
                  {/* Gradient ring */}
                  <div
                    aria-hidden
                    className={[
                      "pointer-events-none absolute inset-0 rounded-xl",
                      "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                      "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
                    ].join(" ")}
                  />

                  {/* Content */}
                  <div
                    className={[
                      "relative h-full rounded-[11px] bg-white px-3 py-2.5",
                      "border border-neutral-200 shadow-sm transition",
                      "group-hover:border-transparent group-hover:shadow-md",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className={[
                          "mt-[6px] h-2 w-2 shrink-0 rounded-full",
                          "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
                          "ring-2 ring-white shadow-sm",
                          "transition-transform duration-200 group-hover:scale-110",
                        ].join(" ")}
                      />
                      <span className="text-[13px] font-medium leading-snug text-neutral-800">
                        {name}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          {items.length.toLocaleString()} total schools
        </p>
      </div>
    </section>
  );
}
