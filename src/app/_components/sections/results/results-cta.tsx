// app/_components/sections/results/results-cta.tsx
import Image from "next/image";
import type { ResultsConfig } from "@/app/_lib/content/types/results.types";
import { WhatsAppButton } from "../../ui/whatsapp-button";

export function ResultsCta({ data }: { data: ResultsConfig["resultsCta"] }) {
  const resultsCta = data;

  return (
    <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* Left: text + bullets (CTA moved out for mobile ordering) */}
        <div className="max-w-xl text-center sm:items-center md:max-w-[560px] md:text-left">
          <h2 className="text-2xl font-semibold tracking-tight">
            {resultsCta.heading}
          </h2>
          <p className="mt-2 text-neutral-600">{resultsCta.subheading}</p>

          {resultsCta.bullets?.length > 0 && (
            <ul className="mt-4 grid gap-2 text-sm text-neutral-700 sm:mx-auto sm:max-w-md md:mx-0 md:max-w-none">
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

          {/* CTA + Note on md+ (left column) */}
          <div className="mt-5 hidden md:block">
            <div className="flex justify-start">
              <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
            </div>

            {resultsCta.note && (
              <p className="mt-2 text-xs text-neutral-500">{resultsCta.note}</p>
            )}
          </div>
        </div>

        {/* Right: image (smaller on mobile + md) */}
        <div className="relative mx-auto w-full shrink-0 max-w-[260px] sm:max-w-xs md:mx-0 md:max-w-[280px] lg:max-w-sm">
          <div className="relative aspect-[8/5] overflow-hidden rounded-2xl">
            <Image
              src={resultsCta.logoSrc}
              alt="WSMath visual"
              fill
              priority
              className="object-cover object-top"
              sizes="(min-width: 1024px) 320px, (min-width: 768px) 280px, 260px"
            />
          </div>

          {/* CTA + Note under image on mobile (and sm) */}
          <div className="mt-5 md:hidden">
            <div className="flex justify-center">
              <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
            </div>

            {resultsCta.note && (
              <p className="mt-2 text-center text-xs text-neutral-500">
                {resultsCta.note}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
