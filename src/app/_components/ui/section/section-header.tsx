// app/_components/ui/section-header.tsx
"use client";

import * as React from "react";
import styles from "./section-header.module.css";

export interface SectionHeaderAccentColumn {
  title: string;
  items: string[];
}

export interface SectionHeaderRightAccent {
  heading?: string;
  badge?: string;
  mainValue?: string;
  mainLabel?: string;
  mainSize?: "sm" | "lg" | string;
  columns?: SectionHeaderAccentColumn[];
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: "left" | "center";
  size?: "md" | "lg";
  showDivider?: boolean;
  rightAccent?: SectionHeaderRightAccent | null;
  chips?: string[];
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  align = "left",
  size = "lg",
  showDivider = true,
  rightAccent = null,
  chips = [],
  className = "mt-4",
}: SectionHeaderProps) {
  const isCenter = align === "center";
  const titleClasses =
    size === "lg" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl";

  const showAccent = !isCenter && !!rightAccent;
  const hasChips = chips.length > 0;

  const [chipIndex, setChipIndex] = React.useState(0);

  React.useEffect(() => {
    if (!hasChips || chips.length <= 1) return;

    const id = window.setInterval(() => {
      setChipIndex((prev) => (prev + 1) % chips.length);
    }, 4000);

    return () => window.clearInterval(id);
  }, [hasChips, chips.length]);

  const currentChip = hasChips ? chips[chipIndex] : null;

  const ChipBanner = ({ centered = false }: { centered?: boolean }) =>
    currentChip ? (
      <div className={`mt-4 ${centered ? "flex justify-center" : ""}`}>
        {/* let the chip size to content */}
        <div className={styles.chipStack}>
          {/* deck “shadow cards” */}
          <div className={styles.chipShadowBack} aria-hidden="true" />
          <div className={styles.chipShadow} aria-hidden="true" />

          {/* active card – key triggers animation on change */}
          <div
            key={chipIndex}
            className={`${styles.chipCard} inline-flex items-center justify-center px-4 py-2.5 text-xs md:text-sm font-semibold text-neutral-900`}
          >
            {currentChip}
          </div>
        </div>
      </div>
    ) : null;

  // ================= Centered layout =================
  if (isCenter) {
    return (
      <header className={className}>
        <div className="flex flex-col items-center text-center">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                {eyebrow}
              </p>
            )}

            <h2
              className={`${titleClasses} font-extrabold tracking-tight text-neutral-900`}
            >
              {title}
            </h2>

            {subtitle && (
              <p className="mt-2 text-sm text-neutral-600 md:text-base">
                {subtitle}
              </p>
            )}
          </div>

          {hasChips && <ChipBanner centered />}
        </div>

        {showDivider && (
          <div className="mt-4 mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
        )}
      </header>
    );
  }

  // ================= Left-aligned layout =================
  const accentHeading = rightAccent?.heading ?? "";
  const accentBadge = rightAccent?.badge ?? "";
  const accentMainValue = rightAccent?.mainValue ?? "";
  const accentMainLabel = rightAccent?.mainLabel ?? "";
  const accentMainSize = rightAccent?.mainSize ?? "lg";
  const accentColumns = rightAccent?.columns ?? [];

  return (
    <header className={className}>
      <div
        className={`flex flex-col gap-4 ${
          showAccent ? "md:flex-row md:items-stretch md:justify-between" : ""
        }`}
      >
        {/* Left column: text */}
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              {eyebrow}
            </p>
          )}

          <h2
            className={`${titleClasses} font-extrabold tracking-tight text-neutral-900`}
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 max-w-xl text-sm text-neutral-600 md:text-base">
              {subtitle}
            </p>
          )}

          {hasChips && <ChipBanner />}
        </div>

        {/* Right column: accent card */}
        {showAccent && (
          <div className="flex md:flex-1 md:h-full justify-end">
            <div className="relative w-full max-w-xs h-full flex">
              <div
                className="pointer-events-none absolute -inset-4 -z-10 bg-gradient-to-br from-violet-500/30 via-sky-400/20 to-fuchsia-500/30 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative flex h-full w-full flex-col gap-3 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  {accentHeading && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                      {accentHeading}
                    </p>
                  )}
                  {accentBadge && (
                    <span className="whitespace-nowrap rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                      {accentBadge}
                    </span>
                  )}
                </div>

                {(accentMainValue || accentMainLabel) && (
                  <div className="flex items-baseline gap-2">
                    {accentMainValue && (
                      <span
                        className={
                          accentMainSize === "lg"
                            ? "text-3xl md:text-4xl font-extrabold text-slate-900"
                            : "text-xl md:text-2xl font-extrabold text-slate-900"
                        }
                      >
                        {accentMainValue}
                      </span>
                    )}
                    {accentMainLabel && (
                      <span className="text-xs leading-snug text-slate-600">
                        {accentMainLabel}
                      </span>
                    )}
                  </div>
                )}

                {accentColumns.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 gap-3 text-[11px] text-slate-700 md:grid-cols-2 md:text-xs">
                    {accentColumns.map((col) => (
                      <div key={col.title}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {col.title}
                        </p>
                        <p className="mt-1 leading-snug">
                          {col.items.join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showDivider && (
        <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
      )}
    </header>
  );
}
