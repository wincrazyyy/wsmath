// app/admin/_components/about-editor.tsx
"use client";

import type { FieldConfig } from "../_lib/fields";
import {
  ABOUT_HEADER_FIELDS,
  ABOUT_HERO_FIELDS,
  ABOUT_STATS_COURSES_FIELDS,
  ABOUT_CTA_FIELDS,
  ABOUT_FIELDS,
} from "../_lib/about-fields";
import { JsonEditor } from "./json-editor";

type SubTab = "header" | "hero" | "statsCourses" | "cta";

type AboutEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function AboutEditor<T extends object>({
  data,
  onChangeData,
}: AboutEditorProps<T>) {
  const tabs: {
    key: SubTab;
    label: string;
    fields: FieldConfig[];
    panelTitle: string;
    panelDescription: string;
  }[] = [
    {
      key: "header",
      label: "Section header",
      fields: ABOUT_HEADER_FIELDS,
      panelTitle: "About – section header",
      panelDescription:
        "Edit the eyebrow, title, subtitle, chips, and right-hand summary card.",
    },
    {
      key: "hero",
      label: "Hero image & cards",
      fields: ABOUT_HERO_FIELDS,
      panelTitle: "About – hero image & cards",
      panelDescription:
        "Edit the horizontal hero image, lower eyebrow, and the two cards overlapping the image.",
    },
    {
      key: "statsCourses",
      label: "Stats & courses",
      fields: ABOUT_STATS_COURSES_FIELDS,
      panelTitle: "About – stats & courses",
      panelDescription:
        "Edit the stats pills and the list of courses that feed the grouped IB / A-Level / IGCSE course cards.",
    },
    {
      key: "cta",
      label: "CTA ribbon",
      fields: ABOUT_CTA_FIELDS,
      panelTitle: "About – CTA ribbon",
      panelDescription:
        "Edit the CTA ribbon heading and subheading shown under the About section.",
    },
  ];

  return (
    <JsonEditor<T>
      title="About"
      description="Edit the About header, hero image band, stats, grouped courses, and CTA ribbon in separate tabs."
      data={data}
      fields={ABOUT_FIELDS}
      onChangeData={onChangeData}
      jsonFileHint="src/app/_lib/content/json/about.json"
      slug="about"
      enableTabs
      tabs={tabs}
    />
  );
}
