// app/admin/_components/editors/about-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { AboutConfig } from "@/app/_lib/content/types/about.types";
import {
  makeAboutHeaderFields,
  ABOUT_HERO_FIELDS,
  ABOUT_STATS_COURSES_FIELDS,
  ABOUT_CTA_FIELDS,
  makeAboutFields,
} from "@/app/admin/_lib/fields/about-fields";
import { JsonEditor } from "./json-editor";
import {
  getBaseFieldsAndSubTabs,
  type JsonEditorTabConfig,
} from "@/app/admin/_lib/json-editor-helpers";
import { makeEmptyRightAccentColumn } from "@/app/admin/_lib/fields/section-header-fields-helper";

type AboutEditorProps<T extends AboutConfig> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function AboutEditor<T extends AboutConfig>({ data, onChangeData }: AboutEditorProps<T>) {
  const accentColumnCount = Array.isArray(data.header.rightAccent?.columns) ? data.header.rightAccent.columns.length : 0;

  const [accentColumnBaseFields, accentColumnSubTabs] = getBaseFieldsAndSubTabs(
    makeAboutHeaderFields(accentColumnCount),
    "header.rightAccent.columns",
    "Right Accent Column",
    "Edit this individual right accent column.",
  );

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
      fields: accentColumnBaseFields,
      subTabs: accentColumnSubTabs,
      subTabAdd: {
        listPath: "header.rightAccent.columns",
        buttonLabel: "Add right accent column",
        defaultItem: makeEmptyRightAccentColumn(),
      },
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
    {
      key: "cta",
      label: "CTA ribbon",
      fields: ABOUT_CTA_FIELDS,
      panelTitle: "About – CTA ribbon",
      panelDescription:
        "Edit the CTA ribbon heading and subheading shown under the About section.",
    },
  ];

  const dynamicFields = makeAboutFields({ accentColumnCount });

  return (
    <JsonEditor<T>
      title="About"
      description="Edit the About header, hero image band, stats, grouped courses, and CTA ribbon in separate tabs."
      data={data}
      fields={dynamicFields as FieldConfig[]}
      onChangeData={onChangeData}
      jsonFileHint="src/app/_lib/content/json/about.json"
      slug="about"
      enableTabs
      tabs={tabs}
    />
  );
}
