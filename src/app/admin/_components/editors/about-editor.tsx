// app/admin/_components/editors/about-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { AboutConfig } from "@/app/_lib/content/types/about.types";
import {
  ABOUT_HEADER_FIELDS,
  ABOUT_HERO_FIELDS,
  ABOUT_STATS_COURSES_FIELDS,
  ABOUT_FIELDS,
} from "@/app/admin/_lib/fields/about-fields";
import { JsonEditor } from "./json-editor";
import {
  getBaseFieldsAndSubTabs,
  type JsonEditorTabConfig,
} from "@/app/admin/_lib/json-editor-helpers";

type AboutEditorProps<T extends AboutConfig> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function AboutEditor<T extends AboutConfig>({ data, onChangeData }: AboutEditorProps<T>) {
  const [statsCoursesBaseFields, statsCoursesSubTabs] = getBaseFieldsAndSubTabs(
    ABOUT_STATS_COURSES_FIELDS,
    "coursesSection.groups",
    "Courses group",
    "Edit this course card (title, caption, and courses list).",
  );

  const tabs: JsonEditorTabConfig[] = [
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
      fields: statsCoursesBaseFields,
      subTabs: statsCoursesSubTabs,
      panelTitle: "About – stats & courses",
      panelDescription:
        "Edit the stats pills + courses section heading. Use the sub-tabs to edit each course card.",
    },
  ];

  return (
    <JsonEditor<T>
      title="About"
      description="Edit the About header, hero image band, stats, grouped courses, and CTA ribbon in separate tabs."
      data={data}
      fields={ABOUT_FIELDS as FieldConfig[]}
      onChangeData={onChangeData}
      jsonFileHint="src/app/_lib/content/json/about.json"
      slug="about"
      enableTabs
      tabs={tabs}
    />
  );
}
