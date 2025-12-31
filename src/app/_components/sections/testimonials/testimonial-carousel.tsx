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
      const el = scrollRef.current;
      if (!el) return;

      const THRESH = 6;

      const onTouchStart = (ev: TouchEvent) => {
        if (!ev.touches || ev.touches.length === 0) return;

        isDraggingRef.current = true;
        setIsDragging(true);
        isPausedRef.current = true;

        axisRef.current = null;
        startXRef.current = ev.touches[0].clientX;
        startYRef.current = ev.touches[0].clientY;
        scrollLeftRef.current = el.scrollLeft;
      };

      const onTouchMove = (ev: TouchEvent) => {
        if (!isDraggingRef.current || !ev.touches || ev.touches.length === 0) return;

        const x = ev.touches[0].clientX;
        const y = ev.touches[0].clientY;

        const dx = x - startXRef.current;
        const dy = y - startYRef.current;

        if (axisRef.current === null) {
          const ax = Math.abs(dx);
          const ay = Math.abs(dy);

          if (ax < THRESH && ay < THRESH) return;

          // Lock to horizontal only if clearly horizontal, otherwise let the page scroll
          if (ax > ay + 2) axisRef.current = "x";
          else {
            // vertical intent: end our drag; don't prevent default
            isDraggingRef.current = false;
            setIsDragging(false);
            isPausedRef.current = false;
            axisRef.current = null;
            return;
          }
        }

        if (axisRef.current !== "x") return;

        // IMPORTANT: needs passive:false listener to work on iOS Safari
        ev.preventDefault();

        const loopWidth = el.scrollWidth / 2;
        if (loopWidth <= 0) return;

        let next = scrollLeftRef.current - dx;

        // Keep within [0, loopWidth)
        next = ((next % loopWidth) + loopWidth) % loopWidth;

        el.scrollLeft = next;
      };

      const onTouchEnd = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
        isPausedRef.current = false;
        axisRef.current = null;
      };

      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend", onTouchEnd);
      el.addEventListener("touchcancel", onTouchEnd);

      return () => {
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove as any);
        el.removeEventListener("touchend", onTouchEnd);
        el.removeEventListener("touchcancel", onTouchEnd);
      };
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
