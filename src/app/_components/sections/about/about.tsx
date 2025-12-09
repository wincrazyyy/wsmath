// app/_components/sections/about/about.tsx
import aboutContent from "@/app/_lib/content/json/about.json";
import type { AboutConfig } from "@/app/_lib/content/types/about.types";

import { AboutHeader } from "./about-header";
import { AboutHero } from "./about-hero";
import { AboutStats } from "./about-stats";
import { CoursesCovered } from "./courses-covered";

export function About() {
  const about = aboutContent as AboutConfig;
  const { header, hero, stats, courses } = about;

  return (
    <>
      <AboutHeader header={header} />
      <AboutHero hero={hero} />
      <AboutStats stats={stats} />
      <CoursesCovered items={courses} />
    </>
  );
}
