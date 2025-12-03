"use client";

import Image from "next/image";
import { TestimonialCarousel } from "./testimonial-carousel";

export type Testimonial = {
  name: string;
  role?: string;
  quote: string;
  avatarSrc?: string;
};

const ALL_TESTIMONIALS: Testimonial[] = [
  {
    name: "Yuki W.",
    role: "IBDP AAHL — Level 7",
    quote:
      "Winson’s targeted drills and weekly plans took me from a predicted 5 to a solid 7 before finals.",
    avatarSrc: "/avatars/yuki.jpg",
  },
  {
    name: "Alex L.",
    role: "A-Level Math & FM — A* A*",
    quote:
      "Crystal-clear exam strategies. I always knew exactly what to practice each week.",
    avatarSrc: "/avatars/alex.jpg",
  },
  {
    name: "Parent of Darren",
    role: "HKU Medicine (MBBS) admit",
    quote:
      "Professional, strict on pacing, and genuinely invested in outcomes. Worth every bit.",
    avatarSrc: "/avatars/parent-darren.jpg",
  },
  {
    name: "Sabrina C.",
    role: "IBDP AISL — 7",
    quote:
      "Online lessons with iPad + GoodNotes were more effective than any face-to-face class I tried.",
    avatarSrc: "/avatars/sabrina.jpg",
  },
  {
    name: "Bobby K.",
    role: "IBDP AASL — 7",
    quote:
      "I love the lessons Winson has to offer! The way he teaches is very easy to understand and he is always very patient with me.",
    avatarSrc: "/avatars/bobby.jpg",
  },
  {
    name: "Jonathan G.",
    role: "IBDP AAHL — 6",
    quote:
      "Winson helped me improve my math skills and gain confidence. His lessons are engaging and effective.",
    avatarSrc: "/avatars/jonathan.jpg",
  },
  {
    name: "James P.",
    role: "IBDP AASL — 6",
    quote:
      "Winson's teaching methods are exceptional. He breaks down complex concepts into simple, understandable parts.",
    avatarSrc: "/avatars/bobby.jpg",
  },
  {
    name: "Pauline S.",
    role: "A-Level Math & FM — A* A*",
    quote:
      "Winson is an amazing tutor! He is very patient and explains concepts clearly. I saw significant improvement in my grades.",
    avatarSrc: "/avatars/pauline.jpg",
  },
];

const FEATURED_NAMES = new Set([
  "Yuki W.",
  "Pauline S.",
  "Parent of Darren",
  "James P.",
]);

const FEATURED = ALL_TESTIMONIALS.filter((t) => FEATURED_NAMES.has(t.name));
const CAROUSEL_ITEMS = ALL_TESTIMONIALS.filter(
  (t) => !FEATURED_NAMES.has(t.name)
);

export function Testimonials() {
  return (
    <>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900">
        Testimonials
      </h2>
      <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />

      {/* Featured grid */}
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {FEATURED.map((t) => (
          <li
            key={t.name + t.quote.slice(0, 16)}
            className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 opacity-20" />

            <div className="mt-4 flex items-start gap-4">
              <Avatar name={t.name} src={t.avatarSrc} />
              <div>
                <h3 className="font-medium">{t.name}</h3>
                {t.role && (
                  <p className="mt-0.5 text-xs text-neutral-500">{t.role}</p>
                )}
              </div>
            </div>

            <p className="mt-4 text-neutral-700">
              <span aria-hidden className="mr-1 text-xl text-neutral-400">
                “
              </span>
              {t.quote}
              <span aria-hidden className="ml-1 text-xl text-neutral-400">
                ”
              </span>
            </p>
          </li>
        ))}
      </ul>

      {/* Carousel below featured */}
      {CAROUSEL_ITEMS.length > 0 && (
        <div className="mt-10">
          <TestimonialCarousel items={CAROUSEL_ITEMS} />
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
