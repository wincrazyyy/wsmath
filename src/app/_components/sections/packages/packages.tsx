// app/_components/sections/packages/packages.tsx
"use client";

import packagesContent from "@/app/_lib/content/json/packages.json";
import type { PackagesConfig } from "@/app/_lib/content/types/packages.types";

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
  const { header, comparison, private: privateConfig, group: groupConfig, iaSupport } = data;

  const privateRate = toNumber(privateConfig.hourlyRate);

  const groupPrice = toNumber(groupConfig.price);
  const groupOriginalPrice = toNumber((groupConfig as any).originalPrice, 0); // or groupConfig.originalPrice once typed
  const groupLessons = Math.max(1, toNumber(groupConfig.lessons, 32));

  const intensiveLessons = Math.max(1, toNumber(privateConfig.intensive.lessons, 8));

  const private32Hours = privateRate * groupLessons;
  const groupRatePerLesson = Math.floor(Math.round(groupPrice / groupLessons) / 100) * 100;
  const eightLessonBlockCost = privateRate * intensiveLessons * (toNumber(privateConfig.lessonMinutes, 60) / 60);

  return (
    <>
      <PackagesHeader header={header} />

      <SectionReveal>
        <PricingComparisonStrip
          comparison={comparison}
          privateRate={privateRate}
          groupPrice={groupPrice}
          groupOriginalPrice={groupOriginalPrice}
          private32Hours={private32Hours}
          groupRatePerLesson={groupRatePerLesson}
        />

        <div className="mt-7 grid gap-6 md:grid-cols-2">
          <PrivatePackageCard
            config={privateConfig}
            privateRate={privateRate}
            intensiveLessons={intensiveLessons}
            eightLessonBlockCost={eightLessonBlockCost}
          />
          <GroupPackageCard
            config={groupConfig}
            groupPrice={groupPrice}
            groupRatePerLesson={groupRatePerLesson}
          />
        </div>

        <IaSupport config={iaSupport} />
      </SectionReveal>
    </>
  );
}
