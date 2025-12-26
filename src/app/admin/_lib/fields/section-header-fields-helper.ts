import { SectionHeaderAccentColumn } from "@/app/_components/ui/section/section-header";
import { FieldConfig, repeatFields } from "./fields";

// section header right accent column fields

export function makeEmptyRightAccentColumn(): SectionHeaderAccentColumn {
  return { title: "", items: [] };
}

function headerRightAccentColumnFields(
  basePath: string,
  labelPrefix: string
): FieldConfig[] {
  return [
    {
      path: `${basePath}.title`,
      label: `${labelPrefix} – Title`,
      description: "Title for the accent column.",
      type: "string",
    },
    {
      path: `${basePath}.items`,
      label: `${labelPrefix} – Items`,
      description: "One line per item in the accent column.",
      type: "string[]",
    },
  ];
}

export function makeHeaderRightAccentColumnFields(count: number): FieldConfig[] {
  return repeatFields("header.rightAccent.columns", "Right Accent", count, (path, label) =>
    headerRightAccentColumnFields(path, label)
  );
}