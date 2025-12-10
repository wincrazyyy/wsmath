// app/_components/sections/about/about-hero.tsx
import Image from "next/image";
import type { AboutHeroConfig } from "@/app/_lib/content/types/about.types";

type AboutHeroProps = {
  hero: AboutHeroConfig;
};

export function AboutHero({ hero }: AboutHeroProps) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {/* Overlap cards on white band */}
      <div className="grid gap-4 p-4 md:p-0 md:absolute md:inset-x-6 md:top-4 md:z-10 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
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

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
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

      {/* Adjustable white spacer band (space for the cards) */}
      <div className="h-12 sm:h-0 md:h-48 lg:h-36" />

      {/* Horizontal image */}
      <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
        <Image
          src="/about-hero.png"
          alt="Tutor pointing upward"
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 960px, 100vw"
        />
      </div>

      {/* Eyebrow on image ribbon */}
      {hero.eyebrow && (
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/80 px-3 py-1 backdrop-blur">
            <span className="text-[11px] font-medium text-neutral-900">
              {hero.eyebrow}
            </span>
            <span className="hidden h-px w-16 bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 sm:block" />
          </div>
        </div>
      )}
    </div>
  );
}
