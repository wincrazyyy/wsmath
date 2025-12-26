// app/_components/sections/results/results-cta.tsx
import Image from "next/image";
import type { ResultsConfig } from "@/app/_lib/content/types/results.types";
import { WhatsAppButton } from "../../ui/whatsapp-button";

export function ResultsCta({ data }: { data: ResultsConfig["resultsCta"] }) {
  const resultsCta = data;

  return (
    <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* Left: text + bullets + desktop CTA */}
        <div className="max-w-xl text-center md:text-left">
          <h2 className="text-2xl font-semibold tracking-tight">
            {resultsCta.heading}
          </h2>
          <p className="mt-2 text-neutral-600">{resultsCta.subheading}</p>

          {resultsCta.bullets?.length > 0 && (
            <ul className="mt-4 grid gap-2 text-sm text-neutral-700">
              {resultsCta.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2 justify-center md:justify-start"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                  <span className="text-left">{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Desktop (md+) CTA stays in left column */}
          <div className="mt-5 hidden md:block">
            <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
            {resultsCta.note && (
              <p className="mt-2 text-xs text-neutral-500">{resultsCta.note}</p>
            )}
          </div>
        </div>

        {/* Right: visual (bigger on mobile) + mobile overlay CTA */}
        <div className="relative mx-auto w-full shrink-0 max-w-[520px] md:mx-0 md:max-w-sm lg:max-w-md">
          <div className="relative aspect-[8/7] overflow-hidden rounded-2xl md:aspect-[8/5]">
            <Image
              src={resultsCta.logoSrc}
              alt="WSMath visual"
              fill
              priority
              className="object-cover object-top"
              sizes="(min-width: 1024px) 360px, (min-width: 768px) 40vw, 92vw"
            />

            {/* Mobile-only overlay CTA (hero-style) */}
            <div className="absolute inset-x-4 bottom-3 z-10 md:hidden">
              <div className="relative mx-auto w-full rounded-2xl border border-white/60 bg-white/75 px-4 py-3 shadow-lg backdrop-blur">
                {/* subtle glow */}
                <div
                  aria-hidden
                  className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-500/25 via-violet-500/25 to-sky-400/25 blur-xl"
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
          </div>
        </div>

      </div>
    </section>
  );
}
