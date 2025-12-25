import type { JSX } from "react";
import type {
  CoursesSectionConfig,
  CoursesSectionGroupConfig,
} from "@/app/_lib/content/types/about.types";

import { BookButton } from "@/app/_components/ui/book-button";

type CoursesCoveredProps = {
  coursesSection: CoursesSectionConfig;
  className?: string;
};

export function CoursesCovered({
  coursesSection,
  className = "",
}: CoursesCoveredProps) {
  const groups = coursesSection.groups;

  const dot = (
    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
  );

  return (
    <section className={`mt-10 ${className}`} aria-label={coursesSection.title}>
      {/* Section heading */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-neutral-900 md:text-lg">
            {coursesSection.title}
          </h3>
          <div className="h-px w-10 rounded-full bg-neutral-200" />
        </div>
        {coursesSection.strapline && (
          <p className="hidden text-[11px] font-medium tracking-[0.22em] text-neutral-400 sm:block">
            {coursesSection.strapline}
          </p>
        )}
      </div>

      {/* Shell with soft gradient background */}
      <div className="mt-4 rounded-3xl border border-neutral-200 bg-gradient-to-br from-indigo-50 via-sky-50 to-violet-50 p-[1px]">
        <div className="rounded-[1.35rem] bg-white/80 px-4 py-5 shadow-sm backdrop-blur-sm sm:px-6 sm:py-6">
          {coursesSection.intro && (
            <p className="max-w-2xl text-xs text-neutral-600 sm:text-sm">
              {coursesSection.intro}
            </p>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {groups.map((meta, idx) => {
              const courses = meta.courses ?? [];
              if (courses.length === 0) return null;

              const baseWrapper =
                "relative h-full transition-transform duration-200 ease-out hover:-translate-y-1.5";

              const cardKey = meta.title
                ? `courses-${meta.title}`
                : `courses-${idx}`;

              const ctaVariant = meta.emphasize ? "blue" : "plain";
              const ctaLabel = meta.cta.label;
              const ctaPrefill = meta.cta.prefillText;
              const ctaAria =
                meta.cta?.ariaLabel ?? `Enquire about ${meta.title} on WhatsApp`;

              if (meta.emphasize) {
                return (
                  <div key={cardKey} className="h-full">
                    <div
                      className={`${baseWrapper} rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 p-[1.5px] shadow-[0_0_0_1px_rgba(129,140,248,0.35)]`}
                    >
                      {/* make card a flex-col so CTA can sit at bottom */}
                      <div className="flex h-full flex-col rounded-[1rem] border border-indigo-100 bg-white p-4 shadow-sm sm:p-5">
                        <Header meta={meta} flagship />
                        <CourseList courses={courses} dot={dot} />

                        {/* CTA pinned to bottom, aligned across columns */}
                        <div className="mt-auto pt-4">
                          <BookButton
                            variant={ctaVariant}
                            label={ctaLabel}
                            ariaLabel={ctaAria}
                            prefillText={ctaPrefill}
                            buttonClassName="rounded-xl px-4 py-2.5 text-[13px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={cardKey} className="h-full">
                  {/* make card a flex-col so CTA can sit at bottom */}
                  <div
                    className={`${baseWrapper} flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5`}
                  >
                    <Header meta={meta} />
                    <CourseList courses={courses} dot={dot} />

                    {/* CTA pinned to bottom, aligned across columns */}
                    <div className="mt-auto pt-4">
                      <BookButton
                        variant={ctaVariant}
                        label={ctaLabel}
                        ariaLabel={ctaAria}
                        prefillText={ctaPrefill}
                        buttonClassName="rounded-xl px-4 py-2.5 text-[13px]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

type HeaderProps = {
  meta: CoursesSectionGroupConfig;
  flagship?: boolean;
};

function Header({ meta, flagship }: HeaderProps) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div>
        <h4
          className={
            meta.emphasize
              ? "text-sm font-semibold text-neutral-900 sm:text-[0.95rem]"
              : "text-[0.85rem] font-semibold text-neutral-900"
          }
        >
          {meta.title}
        </h4>
        {meta.caption && (
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-neutral-400">
            {meta.caption}
          </p>
        )}
      </div>

      {flagship && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase text-white shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
          Flagship
        </span>
      )}
    </div>
  );
}

type CourseListProps = {
  courses: string[];
  dot: JSX.Element;
};

function CourseList({ courses, dot }: CourseListProps) {
  return (
    <ul className="mt-4 space-y-1.5">
      {courses.map((course) => {
        return (
          <li
            key={course}
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[0.7rem] font-medium text-neutral-800"
          >
            {dot}
            <span className="leading-snug">{course}</span>
          </li>
        );
      })}
    </ul>
  );
}
