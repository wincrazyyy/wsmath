// app/_components/sections/home/hero.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import homeContent from "@/app/_lib/content/json/home.json";
import { WhatsAppButton } from "../../ui/whatsapp-button";

import { rubik } from "@/app/_lib/fonts";

function renderStyledTitle(title: string) {
  const parts = title.split(/(\s+)/);

  const GRAD =
    "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 " +
    "bg-clip-text text-transparent [-webkit-text-fill-color:transparent]";

  return parts.map((part, i) => {
    if (/^\s+$/.test(part)) return <span key={`sp-${i}`}>{part}</span>;
    if (!part) return null;

    const first = part.slice(0, 1);
    const rest = part.slice(1);

    return (
      <span key={`w-${i}`} className="inline-block">
        <span className={`text-[1.12em] align-baseline ${GRAD}`}>{first}</span>
        <span className={GRAD}>{rest}</span>
      </span>
    );
  });
}


const hero = homeContent.hero;

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : fallback;
}

function useCountUp(target: number, durationMs = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    let raf = 0;
    let start: number | null = null;

    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / durationMs, 1);

      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);

      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };

    setValue(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

export function Hero() {
  const [entered, setEntered] = useState(false);

  const targetHours = useMemo(() => toNumber(hero.stat?.value, 0), []);
  const hours = useCountUp(targetHours, 1100);

  const hoursText = useMemo(() => {
    const nf = new Intl.NumberFormat("en-GB");
    return `${nf.format(hours)}+`;
  }, [hours]);

  useEffect(() => {
    // trigger enter animation after mount
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) {
      setEntered(true);
      return;
    }

    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      {/* subtle grid + spotlight */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.06)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute -top-32 left-1/2 h-[48rem] w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-sky-400/20 blur-3xl [mask-image:radial-gradient(ellipse_at_center,black,transparent_55%)]" />
      </div>

      {/* Content */}
      <div className="relative grid grid-cols-1 place-items-center gap-10 px-8 py-16 sm:px-12 md:px-16 md:py-24 lg:grid-cols-2 lg:items-center">
        {/* Image */}
        <div className="relative order-1 mx-auto w-full aspect-[4/3] overflow-hidden rounded-2xl sm:max-w-[560px] md:max-w-[520px] lg:order-2 lg:mx-0 lg:max-w-none lg:aspect-[5/4]">
          <Image
            src={hero.imageSrc}
            alt="WSMath hero"
            fill
            priority
            className="object-cover object-top"
            sizes="(min-width: 1024px) 48vw, (min-width: 768px) 70vw, 100vw"
          />

          {/* Floating stat card (fade + float up, count-up number) */}
          {hero.stat?.value && (
            <div
              className={[
                "pointer-events-none absolute inset-x-4 bottom-3 z-10", // bottom-4 -> bottom-3
                "transition-all duration-700 ease-out",
                entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
              ].join(" ")}
            >
              <div className="relative mx-auto w-full max-w-[620px] rounded-2xl border border-white/60 bg-white/75 px-4 py-2.5 shadow-lg backdrop-blur sm:px-5 sm:py-4">
                {/* subtle glow (smaller on mobile) */}
                <div
                  aria-hidden
                  className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-500/25 via-violet-500/25 to-sky-400/25 blur-xl sm:-inset-1 sm:blur-2xl"
                />

                <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:text-left">
                  <div className="shrink-0 rounded-xl bg-white/70 px-3 py-1.5 ring-1 ring-black/5 sm:px-4 sm:py-2">
                    <div className="text-2xl font-extrabold leading-none tracking-tight tabular-nums sm:text-3xl md:text-4xl">
                      <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">
                        {hoursText}
                      </span>
                    </div>

                    {/* mobile labels */}
                    <div className="mt-1 space-y-0.5 sm:hidden">
                      <div className="text-xs font-semibold text-neutral-900">
                        {hero.stat.label}
                      </div>
                      {hero.stat.subLabel && (
                        <div className="text-[11px] leading-snug text-neutral-600">
                          {hero.stat.subLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* desktop (sm+) label stack */}
                  <div className="hidden space-y-0.5 sm:block">
                    <div className="text-sm font-semibold text-neutral-900 md:text-base">
                      {hero.stat.label}
                    </div>
                    {hero.stat.subLabel && (
                      <div className="text-xs text-neutral-600 md:text-sm">
                        {hero.stat.subLabel}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="order-2 max-w-xl text-center lg:order-1 lg:text-left">
          <h1
            className={[
              "text-5xl font-extrabold leading-none tracking-tight md:text-6xl",
              rubik.className,
            ].join(" ")}
          >
            {renderStyledTitle(hero.title)}
          </h1>
          <p className="mt-4 text-lg text-neutral-700 md:text-xl">
            {hero.subtitle}
          </p>

          <p className="mt-2 text-sm text-neutral-600 md:text-xl">
            {hero.tagline}
          </p>

          <div className="mt-6">
            <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
