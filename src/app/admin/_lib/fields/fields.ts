// app/admin/_lib/fields.ts
export type FieldType = "string" | "textarea" | "string[]";

export type FieldConfig = {
  path: string;
  label: string;
  description?: string;
  type: FieldType;
};

export function repeatFields(
  listBasePath: string,
  labelBase: string,
  count: number,
  makeItemFields: (itemPath: string, itemLabel: string, index: number) => FieldConfig[]
): FieldConfig[] {
  const out: FieldConfig[] = [];
  for (let i = 0; i < count; i++) {
    const itemPath = `${listBasePath}[${i}]`;
    const itemLabel = `${labelBase} #${i + 1}`;
    out.push(...makeItemFields(itemPath, itemLabel, i));
  }
  return out;
}