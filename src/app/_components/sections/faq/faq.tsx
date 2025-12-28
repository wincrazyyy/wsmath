"use client";

import faqContent from "@/app/_lib/content/json/faq.json";
import { FaqConfig } from "@/app/_lib/content/types/faq.types";

import { SectionReveal } from "../../ui/section/section-reveal";
import { FaqHeader } from "./faq-header";

export function Faq() {
  const data = faqContent as FaqConfig;
  const { header, top, items } = data as FaqConfig;

  return (
    <>
      <FaqHeader header={header} />

      <SectionReveal>
        <div className="mt-8 mb-16 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                {top.eyebrow}
              </p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
                {top.heading}
              </h2>
              <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
                {top.subheading}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {(items ?? []).map((item: { q: string; a: string }) => (
              <details
                key={item.q}
                className="group rounded-xl border border-neutral-200 bg-white px-4 py-3 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-medium text-neutral-900">{item.q}</span>

                  <span
                    aria-hidden="true"
                    className={[
                      "grid h-6 w-6 flex-none place-items-center",
                      "rounded-md border border-neutral-200 bg-white",
                      "text-sm font-semibold leading-none text-neutral-500",
                      "transition-transform duration-200",
                      "group-open:rotate-45",
                    ].join(" ")}
                  >
                    +
                  </span>
                </summary>


                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
