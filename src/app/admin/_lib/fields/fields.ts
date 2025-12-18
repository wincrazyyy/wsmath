// app/admin/_lib/fields.ts
export type FieldType = "string" | "textarea" | "string[]" | "table";

export type TableColumnConfig = {
  key: string;                // object key, e.g. "name"
  label?: string;             // header label
  kind?: "string" | "number"; // optional override
  placeholder?: string;
};

export type TableSortRule = {
  key: string;
  order?: "asc" | "desc";
};

export type TableConfig = {
  columns?: TableColumnConfig[];
  itemLabel?: string;
  minTableWidthPx?: number;
  sortBy?: TableSortRule[];
};

export type FieldConfig = {
  path: string;
  label: string;
  description?: string;
  type: FieldType;
  table?: TableConfig;
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