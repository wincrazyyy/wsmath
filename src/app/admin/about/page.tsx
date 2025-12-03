import aboutContent from "@/app/_lib/content/about.json";
import { ABOUT_FIELDS } from "../_lib/about-fields";
import { JsonEditor } from "../_components/json-editor";

type AboutContent = typeof aboutContent;

export default function AboutAdminPage() {
  return (
    <JsonEditor<AboutContent>
      title="About section content"
      description="Edit the About copy, bullets, stats, and courses. Keys are fixed; change only the text."
      initialData={aboutContent}
      fields={ABOUT_FIELDS}
      jsonFileHint="app/_lib/content/about.json"
    />
  );
}
