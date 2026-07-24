import Image from "next/image";
import type { AboutHeroConfig } from "@/app/_lib/content/types/about.types";

type AboutHeroProps = {
  hero: AboutHeroConfig;
};

export function AboutHero({ hero }: AboutHeroProps) {
  return (
    // OUTER: prismatic border
    <div className="relative mt-8 rounded-2xl bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 p-[2px] shadow-sm">
      
      {/* INNER: Flex column to separate the cards and the image entirely */}
      <div className="relative flex flex-col overflow-hidden rounded-[calc(theme(borderRadius.2xl)-2px)] bg-neutral-50">
        
        {/* TOP: Cards Section */}
        <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6 lg:p-8 lg:gap-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
            <h3 className="mt-3 text-sm font-semibold text-neutral-900">
              {hero.area1.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {hero.area1.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-[0.45rem] h-2 w-2 shrink-0 flex-none rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600"
                  />
                  <span className="leading-relaxed">{item}</span>
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
                  <span
                    aria-hidden
                    className="mt-[0.45rem] h-2 w-2 shrink-0 flex-none rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600"
                  />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM: Image Section (Fully unobstructed) */}
        <div className="relative min-h-[350px] w-full sm:min-h-[450px] md:min-h-[550px]">
          <Image
            src={hero.imageSrc}
            alt="Tutor pointing upward"
            fill
            priority
            className="object-cover object-center saturate-90 contrast-95 brightness-105"
            sizes="(min-width: 1024px) 960px, 100vw"
          />
          
          {/* Subtle gradient overlay to make the bottom ribbon pop against the image */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Eyebrow ribbon */}
          {hero.eyebrow && (
            <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/75 px-3 py-1 shadow-lg backdrop-blur-md">
                <span className="text-[11px] font-medium text-neutral-900">
                  {hero.eyebrow}
                </span>
                <span className="hidden h-px w-16 bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 sm:block" />
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}