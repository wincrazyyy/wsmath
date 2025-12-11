// app/admin/_components/testimonials-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import {
  TESTIMONIALS_FIELDS,
  TESTIMONIALS_HEADER_FIELDS,
} from "@/app/admin/_lib/fields/testimonials-fields";
import { JsonEditor } from "./json-editor";

type SubTab = "header" | "video" | "featured" | "carousel" | "cta";

type TestimonialsEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function TestimonialsEditor<T extends object>({
  data,
  onChangeData,
}: TestimonialsEditorProps<T>) {
  const headerFields: FieldConfig[] = TESTIMONIALS_HEADER_FIELDS;

  const videoFields: FieldConfig[] = TESTIMONIALS_FIELDS.filter((f) =>
    f.path.startsWith("video."),
  );

  const featuredFields: FieldConfig[] = TESTIMONIALS_FIELDS.filter((f) =>
    f.path.startsWith("featured["),
  );

  const carouselFields: FieldConfig[] = TESTIMONIALS_FIELDS.filter((f) =>
    f.path.startsWith("carousel["),
  );

  const ctaFields: FieldConfig[] = TESTIMONIALS_FIELDS.filter((f) =>
    f.path.startsWith("testimonialsCta."),
  );

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
      fields: headerFields,
      panelTitle: "Testimonials – section header",
      panelDescription:
        "Edit the eyebrow, title, and subtitle for the Testimonials section heading.",
    },
    {
      key: "video",
      label: "Student voices video",
      fields: videoFields,
      panelTitle: "Student voices video",
      panelDescription:
        "Controls the heading, description, and media paths for the video shown under the testimonials section.",
    },
    {
      key: "featured",
      label: "Featured testimonials",
      fields: featuredFields,
      panelTitle: "Featured testimonials (top section)",
      panelDescription:
        "Edit the highlighted testimonials that appear in the main grid.",
    },
    {
      key: "carousel",
      label: "Carousel strip",
      fields: carouselFields,
      panelTitle: "Carousel testimonials (scrolling strip)",
      panelDescription:
        "Edit the testimonials shown in the scrolling carousel strip.",
    },
    {
      key: "cta",
      label: "Testimonials CTA box",
      fields: ctaFields,
      panelTitle: "Testimonials CTA box",
      panelDescription:
        "Controls the heading, bullets, note, and logo for the WhatsApp CTA box displayed under the testimonials section.",
    },
  ];

  return (
    <JsonEditor<T>
      title="Testimonials"
      description="Edit the testimonials header, student voices video, featured testimonials, carousel strip, and WhatsApp CTA box."
      data={data}
      fields={[...headerFields, ...TESTIMONIALS_FIELDS]}
      jsonFileHint="src/app/_lib/content/json/testimonials.json"
      onChangeData={onChangeData}
      slug="testimonials"
      enableTabs
      tabs={tabs}
    />
  );
}
