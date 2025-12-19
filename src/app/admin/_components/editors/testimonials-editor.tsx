// app/admin/_components/editors/testimonials-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { Testimonial, TestimonialsConfig } from "@/app/_lib/content/types/testimonials.types";
import {
  TESTIMONIALS_HEADER_FIELDS,
  TESTIMONIALS_VIDEO_FIELDS,
  TESTIMONIALS_FEATURED_FIELDS,
  makeTestimonialsCarouselFields,
  makeTestimonialsFields,
} from "@/app/admin/_lib/fields/testimonials-fields";
import { JsonEditor } from "./json-editor";
import {
  JsonEditorTabConfig,
  JsonEditorSubTabConfig,
  buildIndexedSubTabs,
} from "@/app/admin/_lib/json-editor-helpers";

export function makeEmptyTestimonial(): Testimonial {
  return { name: "", role: "", quote: "", avatarSrc: "" };
}

type TestimonialsEditorProps<T extends TestimonialsConfig> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function TestimonialsEditor<T extends TestimonialsConfig>({
  data,
  onChangeData,
}: TestimonialsEditorProps<T>) {
  const carouselCount = Array.isArray(data.carousel) ? data.carousel.length : 0;

  const carouselFields = makeTestimonialsCarouselFields(carouselCount);

  const featuredSubTabs: JsonEditorSubTabConfig[] = buildIndexedSubTabs(
    TESTIMONIALS_FEATURED_FIELDS,
    "featured",
    "Featured testimonial",
    "Edit this individual featured testimonial in the main grid.",
  );

  const carouselSubTabs: JsonEditorSubTabConfig[] = buildIndexedSubTabs(
    carouselFields,
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
      subTabAdd: {
        listPath: "carousel",
        buttonLabel: "Add testimonial",
        defaultItem: makeEmptyTestimonial(),
      },
      panelTitle: "Carousel testimonials (scrolling strip)",
      panelDescription:
        "Use the numbered tabs to edit each testimonial in the scrolling carousel strip.",
    },
  ];

  const dynamicFields = makeTestimonialsFields({ carouselCount });

  return (
    <JsonEditor<T>
      title="Testimonials"
      description="Edit the testimonials header, student voices video, featured testimonials, and carousel strip."
      data={data}
      fields={dynamicFields as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/json/testimonials.json"
      onChangeData={onChangeData}
      slug="testimonials"
      enableTabs
      tabs={tabs}
    />
  );
}
