import homeContent from "@/app/_lib/content/home.json";
import { HOME_FIELDS } from "../_lib/home-fields";
import { JsonEditor } from "../_components/json-editor";

type HomeContent = typeof homeContent;

export default function HomeAdminPage() {
  return (
    <JsonEditor<HomeContent>
      title="Homepage content"
      description="Edit hero and proof-pills for the homepage. Field names are locked; just edit the text."
      initialData={homeContent}
      fields={HOME_FIELDS}
      jsonFileHint="app/_lib/content/home.json"
    />
  );
}
