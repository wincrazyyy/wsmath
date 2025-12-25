// app/admin/_components/editors/misc-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { FaqItem, FaqConfig } from "@/app/_lib/content/types/faq.types";
import {
  FAQ_HEADER_FIELDS,
  FAQ_TOP_FIELDS,
  makeFaqItemsFields,
  makeFaqFields,
} from "@/app/admin/_lib/fields/faq-fields";
import { JsonEditor } from "./json-editor";
import {
  type JsonEditorTabConfig,
  JsonEditorSubTabConfig,
  buildIndexedSubTabs,
} from "@/app/admin/_lib/json-editor-helpers";

export function makeEmptyFaqItem(): FaqItem {
  return { q: "", a: "" };
}

type FaqEditorProps<T extends FaqConfig> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function FaqEditor<T extends FaqConfig>({
  data,
  onChangeData,
}: FaqEditorProps<T>) {
  const faqCount = Array.isArray(data.items) ? data.items.length : 0;

  const faqFields = makeFaqItemsFields(faqCount);

  const faqSubTabs: JsonEditorSubTabConfig[] = buildIndexedSubTabs(
    faqFields,
    "items",
    "FAQ item",
    "Edit this individual FAQ item.",
  );

  const tabs: JsonEditorTabConfig[] = [
    {
      key: "header",
      label: "Section header",
      fields: FAQ_HEADER_FIELDS,
      panelTitle: "FAQ – section header",
      panelDescription:
        "Edit the eyebrow, title, and subtitle for the FAQ section heading.",
    },
    {
      key: "top",
      label: "Top section",
      fields: FAQ_TOP_FIELDS,
      panelTitle: "FAQ – top section",
      panelDescription:
        "Edit the eyebrow, heading, and subheading for the top part of the FAQ section.",
    },
    {
      key: "items",
      label: "FAQ items",
      fields: [],
      subTabs: faqSubTabs,
      subTabAdd: {
        listPath: "items",
        buttonLabel: "Add FAQ item",
        defaultItem: makeEmptyFaqItem(),
      },
      panelTitle: "FAQ items",
      panelDescription:
        "Use the numbered tabs to edit each FAQ item.",
    },  
  ];

  const dynamicFields = makeFaqFields({ faqCount });

  return (
    <JsonEditor<T>
      title="FAQ"
      description="Edit the FAQ header, top section, and FAQ items."
      data={data}
      fields={dynamicFields as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/json/faq.json"
      onChangeData={onChangeData}
      slug="faq"
      enableTabs
      tabs={tabs}
    />
  );
}
