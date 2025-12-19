// app/_components/sections/testimonials/featured-testimonials-grid.tsx
"use client";

import Image from "next/image";
import type { Testimonial } from "@/app/_lib/content/types/testimonials.types";

import { TestimonialAvatar } from "./testimonial-avatar";

type FeaturedTestimonialsGridProps = {
  items: Testimonial[];
};

export function FeaturedTestimonialsGrid({
  items,
}: FeaturedTestimonialsGridProps) {
  return (
    <ul className="mt-6 grid gap-6 sm:grid-cols-2">
      {items.map((t, idx) => (
        <li
          key={(t.name || `featured-${idx}`) + (t.quote?.slice(0, 16) ?? "")}
          className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 opacity-20" />

          <div className="mt-4 flex items-start gap-4">
            <TestimonialAvatar
              name={t.name || "Student"}
              src={t.avatarSrc}
              useDefaultAvatar={t.useDefaultAvatar}
              size={48}
            />
            <div>
              <h3 className="font-medium">{t.name || "Student name"}</h3>
              {t.role && (
                <p className="mt-0.5 text-xs text-neutral-500">
                  {t.role}
                </p>
              )}
            </div>
          </div>

          {t.quote && (
            <p className="mt-4 text-neutral-700">
              <span aria-hidden className="mr-1 text-xl text-neutral-400">
                “
              </span>
              {t.quote}
              <span aria-hidden className="ml-1 text-xl text-neutral-400">
                ”
              </span>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
