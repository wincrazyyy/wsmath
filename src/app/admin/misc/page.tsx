// app/admin/misc/page.tsx
import miscContent from "@/app/_lib/content/misc.json";
import { MISC_FIELDS } from "../_lib/misc-fields";
import { JsonEditor } from "../_components/json-editor";

type MiscContent = typeof miscContent;

export default function MiscAdminPage() {
  return (
    <JsonEditor<MiscContent>
      title="Misc items"
      description="Edit WhatsApp CTA copy and other small global settings used across the site."
      initialData={miscContent}
      fields={MISC_FIELDS}
      jsonFileHint="app/_lib/content/misc.json"
    />
  );
}
