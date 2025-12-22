// app/_components/sections/packages/pricing-comparison-strip.tsx
import type { ComparisonConfig } from "@/app/_lib/content/types/packages.types";

interface PricingComparisonStripProps {
  comparison: ComparisonConfig;
  privateRate: number;
  groupPrice: number;
  groupOriginalPrice?: number;
  private32Hours: number;
  groupRatePerLesson: number;
}

export function PricingComparisonStrip({
  comparison,
  privateRate,
  groupPrice,
  groupOriginalPrice = 0,
  private32Hours,
  groupRatePerLesson,
}: PricingComparisonStripProps) {
  const hasOriginal =
    Number.isFinite(groupOriginalPrice) && groupOriginalPrice > groupPrice;

  const saveAmount = hasOriginal ? groupOriginalPrice - groupPrice : 0;
  const savePct = hasOriginal
    ? Math.round((saveAmount / groupOriginalPrice) * 100)
    : 0;

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/90 p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
        {/* Private */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {comparison.privateLabel}
          </p>

          <div className="mt-2 md:min-h-[28px] flex items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-sky-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600"
              />
              Premium Quality
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm text-neutral-700">HKD</span>
            <span className="text-xl font-semibold tracking-tight text-neutral-900 tabular-nums">
              {privateRate.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500">/ hour</span>
          </div>
        </div>


        {/* Divider */}
        <div className="hidden w-px bg-neutral-200 md:block" />

        {/* Group */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {comparison.groupLabel}
          </p>

          <div className="mt-2 md:min-h-[28px]">
            {hasOriginal ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 leading-tight">
                <span className="text-neutral-400">Was</span>
                <span className="font-medium text-neutral-400 line-through tabular-nums">
                  HKD {groupOriginalPrice.toLocaleString()}
                </span>

                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Save {savePct}%
                </span>

                <span className="text-neutral-300" aria-hidden>
                  •
                </span>

                <span className="tabular-nums">Save HKD {saveAmount.toLocaleString()}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm text-neutral-700">HKD</span>
            <span className="text-xl font-semibold tracking-tight text-neutral-900 tabular-nums">
              {groupPrice.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500">/ full programme</span>

            <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700 tabular-nums">
              ~HKD {groupRatePerLesson.toLocaleString()} / lesson
            </span>
          </div>
        </div>


        {/* Divider */}
        <div className="hidden w-px bg-neutral-200 md:block" />

        {/* Value comparison */}
        <div className="min-w-0 md:max-w-[360px]">
          <div className="relative h-full rounded-2xl border border-white/60 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
            <div
              className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/15 via-sky-400/10 to-fuchsia-500/15 blur-2xl"
              aria-hidden="true"
            />

            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
              {comparison.title}
            </p>

            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              <span className="text-neutral-600">{comparison.privateLinePrefix} </span>

              <span className="inline-flex items-baseline gap-1 rounded-lg bg-neutral-900/5 px-2 py-1 font-semibold text-neutral-900">
                HKD {private32Hours.toLocaleString()}
              </span>

              <span className="mx-1 text-neutral-400">vs</span>

              <span className="inline-flex items-baseline gap-1 rounded-lg bg-sky-500/10 px-2 py-1 font-semibold text-sky-800">
                HKD {groupPrice.toLocaleString()}
              </span>

              <span className="text-neutral-600"> {comparison.groupLineSuffix}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceRow({
  amount,
  suffix,
}: {
  amount: number;
  suffix: string;
}) {
  return (
    <div className="mt-2 grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2">
      <span className="text-sm text-neutral-700">HKD</span>
      <span className="text-xl font-semibold tracking-tight text-neutral-900 tabular-nums">
        {amount.toLocaleString()}
      </span>
      <span className="text-xs text-neutral-500">{suffix}</span>
    </div>
  );
}
