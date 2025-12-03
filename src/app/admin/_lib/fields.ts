// app/admin/fields.ts
export type FieldType = "string" | "textarea" | "string[]";

export type FieldConfig = {
  path: string;
  label: string;
  description?: string;
  type: FieldType;
};