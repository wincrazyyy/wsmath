// app/admin/testimonials/page.tsx
import testimonialsContent from "@/app/_lib/content/testimonials.json";
import { TESTIMONIALS_FIELDS } from "../testimonials-fields";
import { JsonEditor } from "../json-editor";

type TestimonialsContent = typeof testimonialsContent;

export default function TestimonialsAdminPage() {
  return (
    <JsonEditor<TestimonialsContent>
      title="Testimonials content"
      description="Edit testimonial cards and carousel quotes. Field names are fixed; just change the text, names, and schools."
      initialData={testimonialsContent}
      fields={TESTIMONIALS_FIELDS}
      jsonFileHint="app/_lib/content/testimonials.json"
    />
  );
}
