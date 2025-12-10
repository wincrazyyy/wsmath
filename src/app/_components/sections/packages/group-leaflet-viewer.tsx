// app/_components/sections/packages/group-leaflet-viewer.tsx
"use client";

import { useEffect, useState } from "react";
import packagesContent from "@/app/_lib/content/json/packages.json";
import { LeafletInlineViewer } from "./group-leaflet-inline-viewer";
import { LeafletFullscreenPortal } from "./group-leaflet-fullscreen-portal";

const LEAFLET = packagesContent.group.leaflet ?? {
  label: "Course leaflet preview",
  pages: [] as string[],
  autoAdvanceSeconds: "5",
};

const GROUP_LEAFLET_PAGES: string[] = LEAFLET.pages ?? [];

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

// ---------- Container (slideshow logic) ----------

export function GroupLeafletViewer() {
  const pages = GROUP_LEAFLET_PAGES;
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pageCount = pages.length;
  const autoSeconds = toNumber(LEAFLET.autoAdvanceSeconds, 5);

  // Auto-advance only when NOT in fullscreen
  useEffect(() => {
    if (pageCount <= 1 || isFullscreen) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % pageCount);
    }, autoSeconds * 1000);

    return () => clearInterval(timer);
  }, [pageCount, autoSeconds, isFullscreen]);

  if (pageCount === 0) return null;

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % pageCount);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + pageCount) % pageCount);
  };

  const handleSelectPage = (i: number) => {
    setIndex(i);
  };

  return (
    <>
      <LeafletInlineViewer
        label={LEAFLET.label || "Course leaflet preview"}
        pages={pages}
        index={index}
        onPrev={handlePrev}
        onNext={handleNext}
        onSelectPage={handleSelectPage}
        onOpenFullscreen={() => setIsFullscreen(true)}
      />
      <LeafletFullscreenPortal
        pages={pages}
        index={index}
        isOpen={isFullscreen}
        onPrev={handlePrev}
        onNext={handleNext}
        onClose={() => setIsFullscreen(false)}
      />
    </>
  );
}
