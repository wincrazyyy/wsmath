// app/admin/_components/json-editor-helpers.ts

import { FieldConfig } from "./fields/fields";


export type JsonEditorSubTabConfig = {
  key: string;
  label: string;
  fields: FieldConfig[];
  panelTitle?: string;
  panelDescription?: string;
};

export type JsonEditorTabConfig = {
  key: string;
  label: string;
  fields?: FieldConfig[];
  subTabs?: JsonEditorSubTabConfig[];
  panelTitle?: string;
  panelDescription?: string;
};


export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/**
 * Turn "/hero.png" into "public/hero.png"
 */
export function buildRepoPathFromPublic(publicPath: string): string {
  const trimmed = publicPath.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return `public${trimmed}`;
  return `public/${trimmed}`;
}

/**
 * Normalise a public directory like "leaflets" -> "/leaflets"
 * and "/leaflets/" -> "/leaflets"
 */
export function normalizeDirPublic(
  dir: unknown,
  fallback: string,
): string {
  const raw = typeof dir === "string" ? dir.trim() : "";
  let d = raw || fallback;
  if (!d.startsWith("/")) d = `/${d}`;
  if (d.endsWith("/")) d = d.slice(0, -1);
  return d;
}

/**
 * For "group.leaflet.pages", return "group.leaflet"
 */
export function getBasePath(fieldPath: string): string {
  const parts = fieldPath.split(".");
  parts.pop();
  return parts.join(".");
}

/**
 * Build numbered sub-tabs (1, 2, 3, ...) for array paths like:
 *   "featured[0].name", "featured[1].quote", ...
 *
 * @param allFields        Full list of FieldConfig entries
 * @param arrayKey         Base key, e.g. "featured" or "carousel"
 * @param panelTitlePrefix Prefix used as "X #1", "X #2"...
 * @param panelDescription Shared description for all sub-tabs
 */
export function buildIndexedSubTabs(
  allFields: FieldConfig[],
  arrayKey: string,
  panelTitlePrefix: string,
  panelDescription: string,
): JsonEditorSubTabConfig[] {
  const byIndex: Record<number, FieldConfig[]> = {};
  const regex = new RegExp(`^${arrayKey}\\[(\\d+)\\]\\.`);

  for (const field of allFields) {
    const match = field.path.match(regex);
    if (!match) continue;

    const idx = Number(match[1]);
    if (!byIndex[idx]) byIndex[idx] = [];
    byIndex[idx].push(field);
  }

  return Object.keys(byIndex)
    .map(Number)
    .sort((a, b) => a - b)
    .map((idx) => ({
      key: `${arrayKey}-${idx}`,
      label: String(idx + 1),
      fields: byIndex[idx],
      panelTitle: `${panelTitlePrefix} #${idx + 1}`,
      panelDescription,
    }));
}