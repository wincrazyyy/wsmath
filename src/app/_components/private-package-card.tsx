import type { PrivateConfig } from "@/app/_lib/content/packages.types";
import { WhatsAppButton } from "./whatsapp-button";

interface PrivatePackageCardProps {
  config: PrivateConfig;
  privateRate: number;
  intensiveLessons: number;
  eightLessonBlockCost: number;
}

export function PrivatePackageCard({
  config,
  privateRate,
  intensiveLessons,
  eightLessonBlockCost,
}: PrivatePackageCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-md ring-1 ring-transparent transition hover:-translate-y-1 hover:shadow-lg hover:ring-neutral-200">
      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 px-3 py-1 text-[11px] font-medium text-neutral-50">
        {config.label}
      </div>

      {/* PRICE */}
      <div className="mt-4">
        <p className="text-xs text-neutral-500">{config.rateLabel}</p>
        <p className="text-2xl font-semibold tracking-tight text-neutral-900">
          HKD {privateRate.toLocaleString()}
          <span className="ml-1 text-xs font-normal text-neutral-500">
            / hour
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

      {/* 8-lesson intensive block */}
      <div className="mt-7 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
          {config.intensive.label}
        </p>
        <p className="mt-1 text-sm text-neutral-700">
          {config.intensive.bodyPrefix}{" "}
          <span className="font-semibold">
            HKD {eightLessonBlockCost.toLocaleString()}
          </span>{" "}
          for an {intensiveLessons}-lesson block (8 × 60 mins).
        </p>

        <ul className="mt-3 space-y-1.5 text-sm text-neutral-800">
          {(config.intensive.points ?? []).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-[0.35rem] h-2 w-2 flex-none rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-5">
        <WhatsAppButton
          width={220}
          height={56}
          imgClassName="h-14 w-auto"
          ariaLabel="Enquire about 1-to-1 lessons on WhatsApp"
        />
        {config.buttonNote && (
          <p className="mt-2 text-[11px] text-neutral-500">
            {config.buttonNote}
          </p>
        )}
      </div>
    </article>
  );
}
