import type { ComparisonConfig } from "@/app/_lib/content/types/packages.types";

interface PricingComparisonStripProps {
  comparison: ComparisonConfig;
  privateRate: number;
  groupPrice: number;
  private32Hours: number;
  groupRatePerLesson: number;
}

export function PricingComparisonStrip({
  comparison,
  privateRate,
  groupPrice,
  private32Hours,
  groupRatePerLesson,
}: PricingComparisonStripProps) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/90 p-4 text-xs text-neutral-700 shadow-sm md:text-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {comparison.privateLabel}
          </p>
          <p className="mt-1 text-sm text-neutral-800">
            HKD{" "}
            <span className="text-lg font-semibold text-neutral-900">
              {privateRate.toLocaleString()}
            </span>{" "}
            <span className="text-xs text-neutral-500">/ hour</span>
          </p>
        </div>

        <div className="hidden h-10 w-px bg-neutral-200 md:block" />

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {comparison.groupLabel}
          </p>
          <p className="mt-1 text-sm text-neutral-800">
            HKD{" "}
            <span className="text-lg font-semibold text-neutral-900">
              {groupPrice.toLocaleString()}
            </span>{" "}
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
              / full programme
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                ~HKD {groupRatePerLesson.toLocaleString()} / lesson
              </span>
            </span>
          </p>
        </div>

        <div className="hidden h-10 w-px bg-neutral-200 md:block" />

        <div className="rounded-xl bg-white px-3 py-2 text-xs text-neutral-800 shadow-sm md:text-sm">
          <p className="font-semibold text-neutral-900">{comparison.title}</p>
          <p className="mt-1">
            {comparison.privateLinePrefix}{" "}
            <span className="font-semibold">
              HKD {private32Hours.toLocaleString()}
            </span>{" "}
            vs{" "}
            <span className="font-semibold text-sky-700">
              HKD {groupPrice.toLocaleString()}
            </span>{" "}
            {comparison.groupLineSuffix}
          </p>
        </div>
      </div>
    </div>
  );
}
