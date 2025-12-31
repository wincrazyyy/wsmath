// app/_components/sections/testimonials/testimonial-carousel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import type { Testimonial } from "@/app/_lib/content/types/testimonials.types";

import { TestimonialAvatar } from "./testimonial-avatar";
import styles from "./testimonial-carousel.module.css";

export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isPausedRef = useRef(false);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const axisRef = useRef<"x" | "y" | null>(null);
  const capturedPointerIdRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const loopingItems = useMemo(
    () => (items?.length ? [...items, ...items] : []),
    [items]
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let raf = 0;
    const speed = 0.5;
    let pos = container.scrollLeft;

    const step = () => {
      const el = scrollRef.current;
      if (!el) return;

      const loopWidth = el.scrollWidth / 2;

      if (!isPausedRef.current && loopWidth > 0) {
        pos += speed;
        if (pos >= loopWidth) pos -= loopWidth;
        el.scrollLeft = pos;
      } else {
        pos = el.scrollLeft; // keep accumulator in sync after dragging
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const endDrag = (el?: HTMLDivElement | null) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    isPausedRef.current = false;
    axisRef.current = null;

    const pid = capturedPointerIdRef.current;
    if (el && pid !== null) {
      try {
        el.releasePointerCapture(pid);
      } catch {}
    }
    capturedPointerIdRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;

    // Only left mouse button; touch/pen are fine.
    if (e.pointerType === "mouse" && e.button !== 0) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    isPausedRef.current = true;

    axisRef.current = null;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !isDraggingRef.current) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    // Decide intent once.
    if (axisRef.current === null) {
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);

      // small deadzone to avoid accidental locks
      if (ax < 4 && ay < 4) return;

      if (ax > ay + 2) {
        axisRef.current = "x";
        // Capture only when we commit to horizontal dragging
        try {
          el.setPointerCapture(e.pointerId);
          capturedPointerIdRef.current = e.pointerId;
        } catch {}
      } else {
        // vertical intent: stop our drag and let the page scroll
        endDrag(el);
        return;
      }
    }

    if (axisRef.current !== "x") return;

    // prevent page from treating it as scroll / rubber-band
    e.preventDefault();

    const loopWidth = el.scrollWidth / 2;
    if (loopWidth <= 0) return;

    // base - dx (drag right moves content right/scroll left, adjust to taste)
    let next = scrollLeftRef.current - dx;

    // keep within [0, loopWidth)
    next = ((next % loopWidth) + loopWidth) % loopWidth;

    el.scrollLeft = next;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    endDrag(scrollRef.current);
  };

  const handlePointerCancel = () => {
    endDrag(scrollRef.current);
  };

  return (
    <section className="mt-8">
      <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />

        {/* scroll track */}
        <div
          ref={scrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={`relative z-10 flex gap-4 overflow-x-auto px-4 py-5 select-none overscroll-x-contain ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } ${styles.scrollSmooth}`}
          // IMPORTANT for iOS Safari: allow vertical page scroll, but let us handle horizontal.
          style={{ touchAction: "pan-y" }}
        >
          {loopingItems.map((t, i) => (
            <div key={`${t.name ?? "t"}-${i}`} className="w-[280px] md:w-[340px] flex-none">
              <Card t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ t }: { t: Testimonial }) {
  return (
    <div className="h-full rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <TestimonialAvatar
          name={t.name}
          src={t.avatarSrc}
          useDefaultAvatar={t.useDefaultAvatar}
          size={40}
        />
        <div>
          <p className="font-medium leading-tight">{t.name}</p>
          {t.role && <p className="text-xs text-neutral-500">{t.role}</p>}
          {t.university && <p className="text-xs text-neutral-500">{t.university}</p>}
        </div>
      </div>

      <p className="mt-3 text-sm text-neutral-700">
        <span aria-hidden className="mr-1 text-neutral-400">“</span>
        {t.quote}
        <span aria-hidden className="ml-1 text-neutral-400">”</span>
      </p>
    </div>
  );
}
