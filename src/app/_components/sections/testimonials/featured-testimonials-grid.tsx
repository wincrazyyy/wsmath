// app/_components/sections/testimonials/featured-testimonials-grid.tsx
"use client";

import type { Testimonial } from "@/app/_lib/content/types/testimonials.types";
import { TestimonialAvatar } from "./testimonial-avatar";

type FeaturedTestimonialsGridProps = {
  items: Testimonial[];
};

export function FeaturedTestimonialsGrid({ items }: FeaturedTestimonialsGridProps) {
  return (
    <ul className="mt-6 grid gap-6 sm:grid-cols-2">
      {items.map((t, idx) => (
        <li
          key={(t.name || `featured-${idx}`) + (t.quote?.slice(0, 16) ?? "")}
          className={[
            "group relative rounded-2xl p-[1px]",
            "transition-transform duration-200 ease-out",
            "hover:-translate-y-1 hover:shadow-lg",
          ].join(" ")}
        >
          {/* gradient ring on hover */}
          <div
            aria-hidden
            className={[
              "pointer-events-none absolute inset-0 rounded-2xl opacity-0",
              "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
              "transition-opacity duration-200",
              "group-hover:opacity-100",
            ].join(" ")}
          />

          {/* soft glow behind (outside) */}
          <div
            aria-hidden
            className={[
              "pointer-events-none absolute -inset-2 rounded-[22px] opacity-0 blur-xl",
              "bg-gradient-to-r from-indigo-500/20 via-violet-500/18 to-sky-500/20",
              "transition-opacity duration-200",
              "group-hover:opacity-100",
            ].join(" ")}
          />

          {/* card */}
          <div
            className={[
              "relative rounded-[15px] border border-neutral-200 bg-white p-6 shadow-sm",
              "transition-all duration-200",
              "group-hover:border-transparent group-hover:shadow-md",
            ].join(" ")}
          >
            {/* top accent bar */}
            <div
              className={[
                "h-1 w-full rounded-full",
                "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
                "opacity-20 transition-all duration-200",
                "group-hover:opacity-40 group-hover:scale-x-[1.02]",
              ].join(" ")}
            />

            <div className="mt-4 flex items-start gap-4">
              <div className="transition-transform duration-200 group-hover:-translate-y-0.5">
                <TestimonialAvatar
                  name={t.name || "Student"}
                  src={t.avatarSrc}
                  useDefaultAvatar={t.useDefaultAvatar}
                  size={48}
                />
              </div>

              <div className="min-w-0">
                <h3 className="font-medium text-neutral-900 transition-colors duration-200 group-hover:text-indigo-700">
                  {t.name || "Student name"}
                </h3>

                {t.role && (
                  <p className="mt-0.5 text-xs text-neutral-500 transition-colors duration-200 group-hover:text-neutral-600">
                    {t.role}
                  </p>
                )}

                {t.university && (
                  <p className="text-xs text-neutral-500 transition-colors duration-200 group-hover:text-neutral-600">
                    {t.university}
                  </p>
                )}
              </div>
            </div>

            {t.quote && (
              <p className="mt-4 text-neutral-700 transition-colors duration-200 group-hover:text-neutral-800">
                <span aria-hidden className="mr-1 text-xl text-neutral-400">
                  “
                </span>
                {t.quote}
                <span aria-hidden className="ml-1 text-xl text-neutral-400">
                  ”
                </span>
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
