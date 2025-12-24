// app/_components/sections/packages/group-package-card.tsx
import type { GroupConfig } from "@/app/_lib/content/types/packages.types";
import { GroupLeafletViewer } from "./group-leaflet-viewer";
import { BookButton } from "../../ui/book-button";

interface GroupPackageCardProps {
  config: GroupConfig;
  groupPrice: number;
  groupRatePerLesson: number;
}

export function GroupPackageCard({
  config,
  groupPrice,
  groupRatePerLesson,
}: GroupPackageCardProps) {
  const originalPrice = config.originalPrice ? Number(config.originalPrice) : NaN;
  const hasOriginal =
    Number.isFinite(originalPrice) && originalPrice > groupPrice;

  const saveAmount = hasOriginal ? originalPrice - groupPrice : 0;
  const savePct = hasOriginal ? Math.round((saveAmount / originalPrice) * 100) : 0;

  return (
    <article
      className={[
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-md",
        "ring-2 ring-emerald-100/80 transition hover:-translate-y-1 hover:shadow-lg",
      ].join(" ")}
    >
      {/* subtle group accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 blur-2xl"
      />

      <div className="relative flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-3 py-1 text-[11px] font-medium text-white">
          {config.label}
        </div>

        {config.tag && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-700">
            {config.tag}
          </span>
        )}
      </div>

      {/* PRICE */}
      <div className="relative mt-4">
        <p className="text-xs text-neutral-500">{config.programmeLabel}</p>

        {hasOriginal && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="line-through">
              HKD {originalPrice.toLocaleString()}
            </span>

            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Save {savePct}%
            </span>

            <span className="text-neutral-400" aria-hidden>
              •
            </span>

            <span>Save HKD {saveAmount.toLocaleString()}</span>
          </div>
        )}

        <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
          HKD {groupPrice.toLocaleString()}
          <span className="ml-1 text-xs font-normal text-neutral-500">
            (~HKD {groupRatePerLesson.toLocaleString()} / lesson)
          </span>
        </p>
      </div>

      <h3 className="relative mt-3 text-lg font-semibold tracking-tight text-neutral-900 md:text-xl">
        {config.title}
      </h3>
      <p className="relative mt-1 text-sm text-neutral-600">{config.description}</p>

      <ul className="relative mt-4 space-y-2 text-sm text-neutral-700">
        {(config.points ?? []).map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[0.35rem] h-2 w-2 flex-none rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
            {item}
          </li>
        ))}
      </ul>

      <div className="relative mt-5">
        <GroupLeafletViewer />
      </div>

      <div className="relative z-10 mt-auto pt-5">
        <BookButton
          variant="group"
          label={config.bookLabel}
          ariaLabel="Enquire about group lessons on WhatsApp"
        />
      </div>
    </article>
  );
}
