"use client";

import { useEffect, useMemo, useState } from "react";

type SectionItem = {
  id: string;     // must match your section ids in the DOM
  label: string;  // tooltip / aria label
};

const DEFAULT_SECTIONS: SectionItem[] = [
  { id: "about", label: "About" },
  { id: "packages", label: "Packages" },
  { id: "testimonials", label: "Testimonials" },
  { id: "results", label: "Results" },
  { id: "faq", label: "FAQ" },
];

export function SectionDots({
  sections = DEFAULT_SECTIONS,
  className = "",
}: {
  sections?: SectionItem[];
  className?: string;
}) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  const ids = useMemo(() => sections.map((s) => s.id), [sections]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (els.length === 0) return;

    // Pick the best visible section, similar to your Nav logic
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) setActive(visible.target.id);
      },
      {
        // “active” when section is roughly in the middle band of the viewport
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.2, 0.35, 0.5, 0.75, 1],
      }
    );

    els.forEach((el) => observer.observe(el));

    // set initial quickly (without needing scroll)
    if (!prefersReduced) {
      requestAnimationFrame(() => {
        const inView = els.find((el) => {
          const r = el.getBoundingClientRect();
          const mid = window.innerHeight * 0.5;
          return r.top <= mid && r.bottom >= mid;
        });
        if (inView) setActive(inView.id);
      });
    }

    return () => observer.disconnect();
  }, [ids]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={[
        // Right-side, vertically centered
        "fixed right-5 top-1/2 z-30 -translate-y-1/2",
        // Hide on small screens (tweak as you like)
        "hidden md:flex",
        className,
      ].join(" ")}
      aria-label="Section progress"
    >
      <div
        className={[
          "flex flex-col items-center gap-3 rounded-full",
          "border border-neutral-200/70 bg-white/70 px-2.5 py-3",
          "shadow-sm backdrop-blur",
        ].join(" ")}
      >
        {sections.map((s) => {
          const isActive = active === s.id;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToId(s.id)}
              className={[
                "group relative grid place-items-center",
                "h-4 w-4 rounded-full",
                "transition",
                isActive ? "scale-105" : "hover:scale-105",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              ].join(" ")}
              aria-label={`Go to ${s.label}`}
              title={s.label}
            >
              {/* Outer glow when active / hover */}
              <span
                aria-hidden
                className={[
                  "absolute -inset-2 rounded-full opacity-0 blur-md transition-opacity duration-200",
                  "bg-gradient-to-r from-indigo-500/25 via-violet-500/25 to-sky-500/25",
                  isActive ? "opacity-100" : "group-hover:opacity-100",
                ].join(" ")}
              />

              {/* Dot */}
              <span
                aria-hidden
                className={[
                  "relative h-2.5 w-2.5 rounded-full transition",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600"
                    : "bg-neutral-300 group-hover:bg-neutral-400",
                ].join(" ")}
              />

              {/* Tooltip */}
              <span
                aria-hidden
                className={[
                  "pointer-events-none absolute right-full mr-3",
                  "whitespace-nowrap rounded-full border border-neutral-200 bg-white px-2.5 py-1",
                  "text-xs font-medium text-neutral-700 shadow-sm",
                  "opacity-0 translate-x-1 transition-all duration-200",
                  "group-hover:opacity-100 group-hover:translate-x-0",
                ].join(" ")}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
