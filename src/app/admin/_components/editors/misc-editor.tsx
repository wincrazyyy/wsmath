// app/admin/_components/misc-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { MISC_FIELDS } from "@/app/admin/_lib/fields/misc-fields";
import { JsonEditor } from "./json-editor";

type MiscEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function MiscEditor<T extends object>({
  data,
  onChangeData,
}: MiscEditorProps<T>) {
  return (
    <JsonEditor<T>
      title="Misc items"
      description="Edit WhatsApp CTA copy and other small global settings."
      data={data}
      fields={MISC_FIELDS as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/json/misc.json"
      slug="misc"
      onChangeData={onChangeData}
    />
  );
}
