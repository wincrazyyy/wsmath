// app/_components/sections/results/results-cta.tsx
import Image from "next/image";
import type { ResultsConfig } from "@/app/_lib/content/types/results.types";
import { WhatsAppButton } from "../../ui/whatsapp-button";

export function ResultsCta({ data }: { data: ResultsConfig["resultsCta"] }) {
  const resultsCta = data;

  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      {/* Prismatic backdrop (subtle, hero-like) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* faint grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.06)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        {/* soft prismatic spotlight */}
        <div className="absolute -top-28 left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/18 via-violet-500/18 to-sky-400/18 blur-3xl [mask-image:radial-gradient(ellipse_at_center,black,transparent_58%)]" />
        {/* extra gentle wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white/20 to-sky-50/40" />
      </div>

      <div className="relative flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
        {/* Left */}
        <div className="flex-1 text-center md:text-left md:pr-2 lg:pr-6">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            {resultsCta.heading}
          </h2>

          <p className="mt-3 text-base leading-relaxed text-neutral-600 md:text-lg">
            {resultsCta.subheading}
          </p>

          {resultsCta.bullets?.length > 0 && (
            <ul className="mt-6 grid gap-3 text-base text-neutral-700 md:text-[15px]">
              {resultsCta.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3 justify-center md:justify-start"
                >
                  <span
                    aria-hidden
                    className="mt-[9px] h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600"
                  />
                  <span className="text-left leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right */}
        <div className="relative mx-auto w-full shrink-0 md:mx-0 md:w-[42%] lg:w-[40%] max-w-[560px]">
          <div className="relative aspect-[8/7] overflow-hidden rounded-2xl">
            <Image
              src={resultsCta.logoSrc}
              alt="WSMath visual"
              fill
              priority
              className="object-cover object-top"
              sizes="(min-width: 1024px) 360px, (min-width: 768px) 40vw, 92vw"
            />

            {/* Floating CTA card */}
            <div className="pointer-events-none absolute inset-x-4 bottom-3 z-10 sm:bottom-4">
              <div className="pointer-events-auto relative mx-auto w-full max-w-[560px] rounded-2xl border border-white/60 bg-white/75 px-4 py-3 shadow-lg backdrop-blur sm:px-5 sm:py-4">
                <div
                  aria-hidden
                  className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-500/25 via-violet-500/25 to-sky-400/25 blur-xl sm:-inset-1 sm:blur-2xl"
                />

                <div className="relative flex flex-col items-center text-center">
                  <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
                  {resultsCta.note && (
                    <p className="mt-2 text-xs text-neutral-600">
                      {resultsCta.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* end floating card */}
          </div>
        </div>
      </div>
    </section>
  );
}
