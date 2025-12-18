"use client";

import packagesContent from "@/app/_lib/content/json/packages.json";
import type {
  PackagesConfig,
  PrivateConfig,
  GroupConfig,
  ComparisonConfig,
} from "@/app/_lib/content/types/packages.types";

import { SectionReveal } from "../../ui/section/section-reveal";

import { PackagesHeader } from "./packages-header";
import { PricingComparisonStrip } from "./pricing-comparison-strip";
import { PrivatePackageCard } from "./private-package-card";
import { GroupPackageCard } from "./group-package-card";
import { IaSupport } from "./ia-support";

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function Packages() {
  const data = packagesContent as PackagesConfig;
  const { header, comparison, private: privateConfig, group: groupConfig } =
    data;

  const privateCfg: PrivateConfig = privateConfig;
  const groupCfg: GroupConfig = groupConfig;
  const comparisonCfg: ComparisonConfig = comparison;

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
    <>
      <PackagesHeader header={header} />

      <SectionReveal>
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

        <IaSupport />
      </SectionReveal>
    </>
  );
}
