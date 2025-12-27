// app/_components/sections/packages/ia-support.tsx
"use client";

import type { IaSupportConfig } from "@/app/_lib/content/types/packages.types";
import { BookButton } from "@/app/_components/ui/book-button";

type Props = {
  config: IaSupportConfig;
};

export function IaSupport({ config }: Props) {
  const {
    eyebrow,
    title,
    description,
    lessonStructureTitle,
    lessonStructure,
    topicsTitle,
    topics,
    bookLabel,
    whatsappPrefillText,
  } = config;

  return (
    <div className="mt-8 flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {eyebrow}
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">
            {title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">{description}</p>
        </div>

      </div>

      {/* Top -> bottom layout */}
      <div className="mt-6 space-y-6">
        {/* Lesson structure */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-sm font-semibold text-neutral-900">
            {lessonStructureTitle}
          </div>

          <ul className="mt-3 space-y-2">
            {(lessonStructure ?? []).map((t) => (
              <li
                key={t}
                className={[
                  "group relative rounded-xl p-[1px] transition-transform duration-200 ease-out",
                  "hover:-translate-y-[1px]",
                ].join(" ")}
              >
                {/* full-item highlight ring */}
                <div
                  aria-hidden
                  className={[
                    "pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200",
                    "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
                    "group-hover:opacity-100",
                  ].join(" ")}
                />

                {/* Item content */}
                <div
                  className={[
                    "relative flex min-h-[44px] items-start gap-2 rounded-[11px] bg-white px-3 py-2",
                    "border border-neutral-200 text-sm text-neutral-700 transition",
                    "group-hover:border-transparent group-hover:shadow-sm",
                  ].join(" ")}
                >
                  {/* Colored dot */}
                  <span
                    aria-hidden
                    className={[
                      "mt-[6px] h-2 w-2 shrink-0 rounded-full",
                      "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
                      "ring-2 ring-white shadow-sm",
                      "transition-transform duration-200",
                      "group-hover:scale-110",
                    ].join(" ")}
                  />
                  <span className="transition group-hover:text-neutral-900">{t}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Topics */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-sm font-semibold text-neutral-900">{topicsTitle}</div>

          <div className="mt-3 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(topics ?? []).map((t) => (
              <div
                key={t.title}
                className={[
                  "group relative h-full rounded-xl p-[1px] transition-transform duration-200 ease-out",
                  "hover:-translate-y-1 hover:shadow-md",
                ].join(" ")}
              >
                {/* full-card highlight ring */}
                <div
                  aria-hidden
                  className={[
                    "pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200",
                    "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
                    "group-hover:opacity-100",
                  ].join(" ")}
                />

                <div
                  className={[
                    "relative h-full rounded-[11px] bg-white p-3 transition",
                    "border border-neutral-200",
                    "group-hover:border-transparent group-hover:shadow-sm",
                    "flex flex-col",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold text-neutral-900 transition group-hover:text-indigo-700">
                    {t.title}
                  </div>
                  <div className="mt-1 text-xs text-neutral-600 transition group-hover:text-neutral-700">
                    {t.desc}
                  </div>
                  <div className="mt-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-auto pt-5">
        <BookButton
          variant="plain"
          label={bookLabel}
          ariaLabel="Enquire about IA support on WhatsApp"
          prefillText={whatsappPrefillText}
          buttonClassName="rounded-xl px-4 py-2.5 text-[13px]"
        />
      </div>
    </div>
  );
}
