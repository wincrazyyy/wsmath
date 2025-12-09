// app/_components/sections/packages/packages.tsx
"use client";

import packagesContent from "@/app/_lib/content/json/packages.json";
import type {
  PrivateConfig,
  GroupConfig,
  ComparisonConfig,
  PackagesConfig,
} from "@/app/_lib/content/types/packages.types";

import { SectionHeader } from "../../ui/section/section-header";
import { PricingComparisonStrip } from "./pricing-comparison-strip";
import { PrivatePackageCard } from "./private-package-card";
import { GroupPackageCard } from "./group-package-card";

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function Packages() {
  const data = packagesContent as PackagesConfig;

  const header = data.header;
  const privateCfg: PrivateConfig = data.private;
  const groupCfg: GroupConfig = data.group;
  const comparisonCfg: ComparisonConfig = data.comparison;

  const privateRate = toNumber(privateCfg.hourlyRate);
  const groupPrice = toNumber(groupCfg.price);
  const groupLessons = Math.max(1, toNumber(groupCfg.lessons, 32));
  const intensiveLessons = Math.max(
    1,
    toNumber(privateCfg.intensive.lessons, 8)
  );

  const private32Hours = privateRate * groupLessons;
  const groupRatePerLesson = Math.round(groupPrice / groupLessons);
  const eightLessonBlockCost = privateRate * intensiveLessons;

  return (
    <section
      id="packages"
      className="container mx-auto max-w-5xl px-4 pb-4 pt-6"
    >
      <SectionHeader
        eyebrow={header.eyebrow}
        title={header.title}
        subtitle={header.subtitle}
        align="left"
        chips={header.chips}
        rightAccent={header.rightAccent}
      />

      <PricingComparisonStrip
        comparison={comparisonCfg}
        privateRate={privateRate}
        groupPrice={groupPrice}
        private32Hours={private32Hours}
        groupRatePerLesson={groupRatePerLesson}
      />

      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <PrivatePackageCard
          config={privateCfg}
          privateRate={privateRate}
          intensiveLessons={intensiveLessons}
          eightLessonBlockCost={eightLessonBlockCost}
        />
        <GroupPackageCard
          config={groupCfg}
          groupPrice={groupPrice}
          groupRatePerLesson={groupRatePerLesson}
        />
      </div>
    </section>
  );
}
