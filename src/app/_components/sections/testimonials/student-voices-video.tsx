// app/_components/sections/testimonials/student-voices-video.tsx
"use client";

import testimonialsContent from "@/app/_lib/content/json/testimonials.json";
import type { TestimonialsConfig } from "@/app/_lib/content/types/testimonials.types";

export function StudentVoicesVideo() {
  const data = testimonialsContent as TestimonialsConfig;
  const video = data.video;

  return (
    <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            {video.eyebrow}
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
            {video.heading}
          </h3>
          <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
            {video.subheading}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-black/90">
        <div className="relative aspect-video w-full">
          <video
            src={video.src}
            poster={video.poster}
            controls
            className="h-full w-full object-cover object-center"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
