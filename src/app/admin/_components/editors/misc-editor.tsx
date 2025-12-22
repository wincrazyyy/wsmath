// app/admin/_components/editors/misc-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { MiscConfig } from "@/app/_lib/content/types/misc.types";
import {
  WHATSAPP_GLOBAL_FIELDS,
  FOOTER_FIELDS,
  MISC_FIELDS
} from "@/app/admin/_lib/fields/misc-fields";
import { JsonEditor } from "./json-editor";
import {
  type JsonEditorTabConfig,
} from "@/app/admin/_lib/json-editor-helpers";

type MiscEditorProps<T extends MiscConfig> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function MiscEditor<T extends MiscConfig>({
  data,
  onChangeData,
}: MiscEditorProps<T>) {
  const tabs: JsonEditorTabConfig[] = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      fields: WHATSAPP_GLOBAL_FIELDS,
      panelTitle: "WhatsApp – global settings",
      panelDescription:
        "Edit the WhatsApp phone number and pre-filled message used in the WhatsApp CTA button.",
    },
    {
      key: "footer",
      label: "Footer",
      fields: FOOTER_FIELDS,
      panelTitle: "Footer – global settings",
      panelDescription:
        "Edit the footer branding, columns, CTA block, and bottom bar.",
    }
  ];

  return (
    <JsonEditor<T>
      title="Misc items"
      description="Edit WhatsApp CTA copy and other small global settings."
      data={data}
      fields={MISC_FIELDS as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/json/misc.json"
      slug="misc"
      onChangeData={onChangeData}
      enableTabs
      tabs={tabs}
    />
  );
}
