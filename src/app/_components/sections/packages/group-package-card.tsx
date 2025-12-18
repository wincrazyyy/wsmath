// app/_components/sections/packages/group-package-card.tsx
import type { GroupConfig } from "@/app/_lib/content/types/packages.types";
import { GroupLeafletViewer } from "./group-leaflet-viewer";

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
  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-md ring-2 ring-sky-100 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 px-3 py-1 text-[11px] font-medium text-white">
          {config.label}
        </div>
        {config.tag && (
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-sky-700">
            {config.tag}
          </span>
        )}
      </div>

      {/* PRICE */}
      <div className="mt-4">
        <p className="text-xs text-neutral-500">{config.programmeLabel}</p>
        <p className="text-2xl font-semibold tracking-tight text-neutral-900">
          HKD {groupPrice.toLocaleString()}
          <span className="ml-1 text-xs font-normal text-neutral-500">
            (~HKD {groupRatePerLesson.toLocaleString()} / lesson)
          </span>
        </p>
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight text-neutral-900 md:text-xl">
        {config.title}
      </h3>
      <p className="mt-1 text-sm text-neutral-600">{config.description}</p>

      <ul className="mt-4 space-y-2 text-sm text-neutral-700">
        {(config.points ?? []).map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[0.35rem] h-2 w-2 flex-none rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <GroupLeafletViewer />
      </div>
    </article>
  );
}
