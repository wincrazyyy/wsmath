// app/_components/about.tsx
import Image from "next/image";
import aboutContent from "@/app/_lib/content/about.json";
import { CoursesCovered } from "./courses-covered";

export function About() {
  const about = aboutContent;

  return (
    <>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900">
        {about.title}
      </h2>
      <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />

      {/* Lead */}
      <p className="mt-4 text-base leading-relaxed text-neutral-700 md:text-lg">
        {about.lead}
      </p>

      {/* Image container with white top band for overlays */}
      <div className="relative mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {/* Overlap cards on white band */}
        <div className="grid gap-4 p-4 md:p-0 md:absolute md:inset-x-6 md:top-4 md:z-10 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
            <h3 className="mt-3 text-sm font-semibold text-neutral-900">{about.area1.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {about.area1.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
            <h3 className="mt-3 text-sm font-semibold text-neutral-900">{about.area2.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {about.area2.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Adjustable white spacer band (space for the cards) */}
        <div className="h-12 sm:h-0 md:h-48 lg:h-36" />

        {/* Horizontal image */}
        <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
          <Image
            src={about.imageSrc}
            alt="Tutor pointing upward"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 960px, 100vw"
          />
        </div>

        {/* Eyebrow + Title */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/80 px-3 py-1 backdrop-blur">
            <span className="text-[11px] font-medium text-neutral-900">
              {about.eyebrow}
            </span>
            <span className="hidden h-px w-16 bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 sm:block" />
          </div>
        </div>
      </div>

      {/* Quick stats / credibility */}
      <div className="mt-8 flex flex-wrap gap-3">
        {about.stats.map((t: string) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
            {t}
          </span>
        ))}
      </div>

      {/* Courses covered */}
      <CoursesCovered items={about.courses} />
    </>
  );
}
