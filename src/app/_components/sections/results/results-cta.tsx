// app/_components/sections/results/results-cta.tsx
import Image from "next/image";
import type { ResultsConfig } from "@/app/_lib/content/types/results.types";
import { WhatsAppButton } from "../../ui/whatsapp-button";

export function ResultsCta({ data }: { data: ResultsConfig["resultsCta"] }) {
  const resultsCta = data;

  return (
    <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
        {/* Left: make it larger + take more width */}
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

        {/* Right: keep image column slightly narrower */}
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

            {/* Floating CTA card (hero-style) */}
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
