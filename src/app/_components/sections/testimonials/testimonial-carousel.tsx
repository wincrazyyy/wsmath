// app/_components/sections/testimonials/testimonial-carousel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import type { Testimonial } from "@/app/_lib/content/types/testimonials.types";

import { TestimonialAvatar } from "./testimonial-avatar";
import styles from "./testimonial-carousel.module.css";

export function TestimonialCarousel({
  items,
}: {
  items: Testimonial[];
  speedSec?: number;
}) {

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef(false);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const loopingItems = useMemo(
    () => (items?.length ? [...items, ...items] : []),
    [items]
  );

  useEffect(() => {
    let animationFrameId: number;
    const speed = 0.5;

    const step = () => {
      const container = scrollRef.current;
      if (container && !isPausedRef.current) {
        container.scrollLeft += speed;

        const loopWidth = container.scrollWidth / 2;

        if (container.scrollLeft >= loopWidth) {
          container.scrollLeft -= loopWidth;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    isPausedRef.current = true;

    startXRef.current = e.clientX;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    isPausedRef.current = false;
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      isPausedRef.current = false;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container || !isDraggingRef.current) return;

    e.preventDefault();

    const deltaX = e.clientX - startXRef.current;
    const loopWidth = container.scrollWidth / 2;

    let nextScrollLeft = scrollLeftRef.current - deltaX;

    if (nextScrollLeft < 0) {
      nextScrollLeft += loopWidth;
      scrollLeftRef.current += loopWidth;
    } else if (nextScrollLeft >= loopWidth * 2) {
      nextScrollLeft -= loopWidth;
      scrollLeftRef.current -= loopWidth;
    }

    container.scrollLeft = nextScrollLeft;
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
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          className={`relative z-10 flex gap-4 overflow-x-auto px-4 py-5 select-none touch-pan-x ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } ${styles.scrollSmooth}`}
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
        </div>
      </div>

      <p className="mt-3 text-sm text-neutral-700">
        <span aria-hidden className="mr-1 text-neutral-400">
          “
        </span>
        {t.quote}
        <span aria-hidden className="ml-1 text-neutral-400">
          ”
        </span>
      </p>
    </div>
  );
}
