// app/admin/_components/packages-editor.tsx
"use client";

import type { FieldConfig } from "../_lib/fields";
import { PACKAGES_FIELDS } from "../_lib/packages-fields";
import { JsonEditor } from "./json-editor";

type PackagesEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function PackagesEditor<T extends object>({
  data,
  onChangeData,
}: PackagesEditorProps<T>) {
  return (
    <JsonEditor<T>
      title="Course options & pricing"
      description="Edit 1-to-1 premium package, group course details, pricing, and leaflet pages."
      data={data}
      fields={PACKAGES_FIELDS as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/packages.json"
      onChangeData={onChangeData}
    />
  );
}
