// app/_components/sections/about/about-hero.tsx
import Image from "next/image";
import type { AboutHeroConfig } from "@/app/_lib/content/types/about.types";

type AboutHeroProps = {
  hero: AboutHeroConfig;
};

export function AboutHero({ hero }: AboutHeroProps) {
  return (
    // OUTER: prismatic border
    <div className="relative mt-8 rounded-2xl bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 p-[2px] shadow-sm">
      {/* INNER: actual card (content shifts because of the border padding above) */}
      <div className="relative overflow-hidden rounded-[calc(theme(borderRadius.2xl)-2px)] bg-white">
        {/* Full-bleed background image (fills entire hero) */}
        <div className="absolute inset-0">
          <Image
            src={hero.imageSrc}
            alt="Tutor pointing upward"
            fill
            priority
            className="object-cover object-center saturate-90 contrast-95 brightness-105"
            sizes="(min-width: 1024px) 960px, 100vw"
          />
          {/* Readability overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-transparent" />
        </div>

        {/* Height + layout wrapper */}
        <div className="relative z-10 flex min-h-[620px] flex-col sm:min-h-[700px] md:min-h-[560px] lg:min-h-[620px]">
          {/* Cards: normal flow on mobile, overlapped on md+ */}
          <div className="grid gap-4 p-4 md:absolute md:inset-x-6 md:top-4 md:z-10 md:grid-cols-2 md:p-0">
            <div className="rounded-xl border border-white/35 bg-white/35 p-5 shadow-lg backdrop-blur-lg">
              <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
              <h3 className="mt-3 text-sm font-semibold text-neutral-900">
                {hero.area1.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {hero.area1.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/35 bg-white/35 p-5 shadow-lg backdrop-blur-lg">
              <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
              <h3 className="mt-3 text-sm font-semibold text-neutral-900">
                {hero.area2.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {hero.area2.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Filler so there’s always visible image area below the cards */}
          <div className="flex-1" />
        </div>

        {/* Eyebrow ribbon */}
        {hero.eyebrow && (
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/35 px-3 py-1 shadow-lg backdrop-blur-lg">
              <span className="text-[11px] font-medium text-neutral-900">
                {hero.eyebrow}
              </span>
              <span className="hidden h-px w-16 bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 sm:block" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
