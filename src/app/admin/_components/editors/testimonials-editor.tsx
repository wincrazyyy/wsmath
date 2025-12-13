// app/admin/_components/editors/testimonials-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import {
  TESTIMONIALS_HEADER_FIELDS,
  TESTIMONIALS_VIDEO_FIELDS,
  TESTIMONIALS_FEATURED_FIELDS,
  TESTIMONIALS_CAROUSEL_FIELDS,
  TESTIMONIALS_FIELDS
} from "@/app/admin/_lib/fields/testimonials-fields";
import { JsonEditor } from "./json-editor";
import {
  JsonEditorTabConfig,
  JsonEditorSubTabConfig,
  buildIndexedSubTabs,
} from "@/app/admin/_lib/json-editor-helpers";

type TestimonialsEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function TestimonialsEditor<T extends object>({
  data,
  onChangeData,
}: TestimonialsEditorProps<T>) {
  const featuredSubTabs: JsonEditorSubTabConfig[] = buildIndexedSubTabs(
    TESTIMONIALS_FEATURED_FIELDS,
    "featured",
    "Featured testimonial",
    "Edit this individual featured testimonial in the main grid.",
  );

  const carouselSubTabs: JsonEditorSubTabConfig[] = buildIndexedSubTabs(
    TESTIMONIALS_CAROUSEL_FIELDS,
    "carousel",
    "Carousel testimonial",
    "Edit this individual testimonial in the scrolling carousel strip.",
  );

  const tabs: JsonEditorTabConfig[] = [
    {
      key: "header",
      label: "Section header",
      fields: TESTIMONIALS_HEADER_FIELDS,
      panelTitle: "Testimonials – section header",
      panelDescription:
        "Edit the eyebrow, title, and subtitle for the Testimonials section heading.",
    },
    {
      key: "video",
      label: "Student voices video",
      fields: TESTIMONIALS_VIDEO_FIELDS,
      panelTitle: "Student voices video",
      panelDescription:
        "Controls the heading, description, and media paths for the video shown under the testimonials section.",
    },
    {
      key: "featured",
      label: "Featured testimonials",
      fields: [],
      subTabs: featuredSubTabs,
      panelTitle: "Featured testimonials (top section)",
      panelDescription:
        "Use the numbered tabs to edit each featured testimonial in the main grid.",
    },
    {
      key: "carousel",
      label: "Carousel strip",
      fields: [],
      subTabs: carouselSubTabs,
      panelTitle: "Carousel testimonials (scrolling strip)",
      panelDescription:
        "Use the numbered tabs to edit each testimonial in the scrolling carousel strip.",
    },
  ];

  return (
    <JsonEditor<T>
      title="Testimonials"
      description="Edit the testimonials header, student voices video, featured testimonials, and carousel strip."
      data={data}
      fields={TESTIMONIALS_FIELDS as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/json/testimonials.json"
      onChangeData={onChangeData}
      slug="testimonials"
      enableTabs
      tabs={tabs}
    />
  );
}
