// app/_components/testimonials.tsx
"use client";

import Image from "next/image";
import testimonialsContent from "@/app/_lib/content/testimonials.json";
import { TestimonialCarousel } from "./testimonial-carousel";
import { StudentVoicesVideo } from "./student-voices-video";

type TestimonialsContent = typeof testimonialsContent;

export type Testimonial = TestimonialsContent["featured"][number];

export function Testimonials() {
  const featured: Testimonial[] = testimonialsContent.featured ?? [];
  const carousel: Testimonial[] = testimonialsContent.carousel ?? [];

  return (
    <>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900">
        {testimonialsContent.title}
      </h2>
      <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />

      {/* Student voices video just under the section heading */}
      <StudentVoicesVideo />

      {/* Featured grid */}
      {featured.length > 0 && (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {featured.map((t, idx) => (
            <li
              key={(t.name || `featured-${idx}`) + (t.quote?.slice(0, 16) ?? "")}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 opacity-20" />

              <div className="mt-4 flex items-start gap-4">
                <Avatar name={t.name || "Student"} src={t.avatarSrc} />
                <div>
                  <h3 className="font-medium">
                    {t.name || "Student name"}
                  </h3>
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
      )}

      {/* Carousel below featured */}
      {carousel.length > 0 && (
        <div className="mt-10">
          <TestimonialCarousel items={carousel} />
        </div>
      )}
    </>
  );
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-neutral-200">
        <Image
          src={src}
          alt={`${name} avatar`}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-600 text-sm font-semibold text-white ring-1 ring-neutral-200">
      {initials}
    </div>
  );
}
