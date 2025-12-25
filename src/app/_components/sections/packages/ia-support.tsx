// app/_components/sections/packages/ia-support.tsx
"use client";

import type { IaSupportConfig } from "@/app/_lib/content/types/packages.types";
import { BookButton } from "@/app/_components/ui/book-button";

type Props = {
  config: IaSupportConfig;
};

const SOLO_CARD_ID = "solo-lessons";
const HIGHLIGHT_EVENT = "wsmath:highlight";

export function IaSupport({ config }: Props) {
  const {
    eyebrow,
    title,
    description,
    ctaLabel,
    lessonStructureTitle,
    lessonStructure,
    topicsTitle,
    topics,
    bookLabel,
    whatsappPrefillText,
  } = config;

  function goToSoloAndHighlight() {
    const el = document.getElementById(SOLO_CARD_ID);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(HIGHLIGHT_EVENT, {
          detail: { id: SOLO_CARD_ID, ms: 2600 },
        })
      );
    }, 250);
  }

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

        <button
          type="button"
          onClick={goToSoloAndHighlight}
          className="inline-flex w-fit items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
        >
          {ctaLabel}
        </button>
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
              <li key={t} className="flex gap-2 text-sm text-neutral-700">
                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Topics */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-sm font-semibold text-neutral-900">{topicsTitle}</div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(topics ?? []).map((t) => (
              <div key={t.title} className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="text-sm font-semibold text-neutral-900">{t.title}</div>
                <div className="mt-1 text-xs text-neutral-600">{t.desc}</div>
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
