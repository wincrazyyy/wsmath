"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FieldConfig, TableColumnConfig } from "@/app/admin/_lib/fields/fields";
import { getByPath, setByPath } from "@/app/admin/_lib/json-path";

type Cell = string | number | boolean | null | undefined;
type Row = Record<string, Cell>;

type Props<T extends object> = {
  field: FieldConfig; // field.path points to an array of objects
  data: T;
  onChangeData: (next: T) => void;
};

type SortOrder = "asc" | "desc";
type TableSortRule = { key: string; order?: SortOrder };

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function toRows(raw: unknown): Row[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isPlainObject) as Row[];
}

function guessNumericColumn(rows: Row[], key: string): boolean {
  for (const r of rows) {
    const v = r[key];
    if (typeof v === "number" && Number.isFinite(v)) return true;
  }
  return false;
}

function inferColumns(rows: Row[]): TableColumnConfig[] {
  const keySet = new Set<string>();
  for (const r of rows) {
    for (const k of Object.keys(r)) keySet.add(k);
  }
  const keys = Array.from(keySet);

  const preferred = ["name", "year", "from", "to", "months"];
  keys.sort((a, b) => {
    const ia = preferred.indexOf(a);
    const ib = preferred.indexOf(b);
    if (ia !== -1 || ib !== -1)
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.localeCompare(b);
  });

  return keys.map((k) => ({ key: k, label: toTitle(k) }));
}

function toTitle(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function splitLine(line: string): string[] {
  const parts = line.includes("\t") ? line.split("\t") : line.split(",");
  return parts.map((x) => x.trim());
}

function looksLikeHeader(parts: string[], columns: TableColumnConfig[]) {
  const colKeys = new Set(columns.map((c) => c.key.toLowerCase()));
  const colLabels = new Set(
    columns.map((c) => (c.label ?? c.key).toLowerCase())
  );
  const hits = parts.filter(
    (p) => colKeys.has(p.toLowerCase()) || colLabels.has(p.toLowerCase())
  ).length;
  return hits >= Math.max(2, Math.ceil(columns.length / 2));
}

function parseBulk(
  text: string,
  columns: TableColumnConfig[],
  numericKeys: Set<string>
): Row[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  let start = 0;
  let mapByIndex = columns.map((c) => c.key);

  const first = splitLine(lines[0]);
  if (looksLikeHeader(first, columns)) {
    start = 1;
    mapByIndex = first.map((h) => {
      const hLower = h.toLowerCase();
      const match =
        columns.find((c) => c.key.toLowerCase() === hLower) ??
        columns.find((c) => (c.label ?? "").toLowerCase() === hLower);
      return match?.key ?? h;
    });
  }

  const out: Row[] = [];

  for (let i = start; i < lines.length; i++) {
    const parts = splitLine(lines[i]);
    if (parts.length === 0) continue;

    const row: Row = {};
    for (let j = 0; j < parts.length; j++) {
      const key = mapByIndex[j] ?? columns[j]?.key;
      if (!key) continue;

      const raw = parts[j];
      if (raw === "") {
        row[key] = undefined;
        continue;
      }

      if (numericKeys.has(key)) {
        const n = Number(raw);
        row[key] = Number.isFinite(n) ? n : raw;
      } else {
        row[key] = raw;
      }
    }

    if (Object.keys(row).length > 0) out.push(row);
  }

  return out;
}

function compareValues(a: Cell, b: Cell, numeric: boolean): number {
  const aEmpty = a === undefined || a === null || a === "";
  const bEmpty = b === undefined || b === null || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;

  if (numeric) {
    const na = typeof a === "number" ? a : Number(a);
    const nb = typeof b === "number" ? b : Number(b);

    const aIsNum = Number.isFinite(na);
    const bIsNum = Number.isFinite(nb);

    if (aIsNum && bIsNum) return na - nb;
    if (aIsNum) return -1;
    if (bIsNum) return 1;
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function sortRowsStable(
  rows: Row[],
  rules: TableSortRule[],
  numericKeys: Set<string>
): Row[] {
  if (!rules || rules.length === 0) return rows;

  const decorated = rows.map((r, i) => ({ r, i }));

  decorated.sort((A, B) => {
    for (const rule of rules) {
      const key = rule.key;
      const order: SortOrder = rule.order ?? "asc";
      const dir = order === "desc" ? -1 : 1;

      const av = A.r[key];
      const bv = B.r[key];

      const cmp = compareValues(av, bv, numericKeys.has(key));
      if (cmp !== 0) return cmp * dir;
    }
    return A.i - B.i;
  });

  return decorated.map((x) => x.r);
}

export function TableInput<T extends object>({
  field,
  data,
  onChangeData,
}: Props<T>) {
  const rowsPath = field.path;
  const rows = toRows(getByPath(data, rowsPath));

  const columns = useMemo(() => {
    const cfg = field.table?.columns;
    return cfg && cfg.length > 0 ? cfg : inferColumns(rows);
  }, [field.table?.columns, rows]);

  const numericKeys = useMemo(() => {
    const set = new Set<string>();
    for (const c of columns) {
      if (c.kind === "number") set.add(c.key);
      else if (c.kind === "string") continue;
      else if (guessNumericColumn(rows, c.key)) set.add(c.key);
    }
    return set;
  }, [columns, rows]);

  const itemLabel = field.table?.itemLabel ?? "row";
  const minWidth = field.table?.minTableWidthPx ?? 860;

  const [query, setQuery] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows.map((r, idx) => ({ r, idx }));

    return rows
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => {
        for (const c of columns) {
          const v = r[c.key];
          if (v === undefined || v === null) continue;
          if (String(v).toLowerCase().includes(q)) return true;
        }
        return false;
      });
  }, [rows, query, columns]);

  function commit(nextRows: Row[]) {
    const sortBy = field.table?.sortBy ?? [];
    const sorted =
      sortBy.length > 0 ? sortRowsStable(nextRows, sortBy, numericKeys) : nextRows;

    const next = structuredClone(data) as T;
    setByPath(next, rowsPath, sorted);
    onChangeData(next);
  }

  // sorted json when table loads
  const didNormalizeRef = useRef(false);

  useEffect(() => {
    if (didNormalizeRef.current) return;

    const sortBy = field.table?.sortBy ?? [];
    if (sortBy.length === 0) {
      didNormalizeRef.current = true;
      return;
    }

    const sorted = sortRowsStable(rows, sortBy, numericKeys);

    const sameOrder =
      sorted.length === rows.length &&
      sorted.every((r, i) => {
        const a = rows[i];
        if (!a) return false;
        const keys = new Set([...Object.keys(a), ...Object.keys(r)]);
        for (const k of keys) {
          if (a[k] !== r[k]) return false;
        }
        return true;
      });

    didNormalizeRef.current = true;

    if (!sameOrder) commit(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateCell(rowIndex: number, key: string, raw: string) {
    const next = rows.slice();
    const current = next[rowIndex] ?? {};
    const isNum = numericKeys.has(key);

    let v: Cell = raw;
    if (raw.trim() === "") v = undefined;
    else if (isNum) {
      const n = Number(raw);
      v = Number.isFinite(n) ? n : raw;
    }

    next[rowIndex] = { ...current, [key]: v };
    commit(next);
  }

  function removeRow(rowIndex: number) {
    const next = rows.slice();
    next.splice(rowIndex, 1);
    commit(next);
  }

  function addRow() {
    const blank: Row = {};
    for (const c of columns) {
      blank[c.key] = numericKeys.has(c.key) ? undefined : "";
    }
    commit([blank, ...rows]);
  }

  function replaceFromBulk() {
    commit(parseBulk(bulkText, columns, numericKeys));
    setBulkText("");
    setBulkOpen(false);
  }

  function appendFromBulk() {
    commit([...rows, ...parseBulk(bulkText, columns, numericKeys)]);
    setBulkText("");
    setBulkOpen(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 sm:w-72"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-xs text-neutral-500">{rows.length} total</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBulkOpen((v) => !v)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
          >
            Bulk paste
          </button>

          <button
            type="button"
            onClick={addRow}
            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            + Add {itemLabel}
          </button>
        </div>
      </div>

      {bulkOpen && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="text-xs font-semibold text-neutral-900">
            Bulk paste (CSV or tab-separated)
          </div>
          <div className="mt-1 text-[11px] text-neutral-600">
            You can paste <b>with</b> an optional header row. Columns detected:{" "}
            <code>{columns.map((c) => c.key).join(", ")}</code>
          </div>

          <textarea
            className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            rows={5}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`${columns.map((c) => c.key).join(", ")}\n…`}
          />

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={replaceFromBulk}
              className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800"
            >
              Replace list
            </button>
            <button
              type="button"
              onClick={appendFromBulk}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
            >
              Append
            </button>
            <button
              type="button"
              onClick={() => setBulkOpen(false)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="w-full overflow-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full border-collapse text-sm" style={{ minWidth }}>
          <thead className="bg-neutral-50">
            <tr className="border-b border-neutral-200">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500"
                >
                  {c.label ?? c.key}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(({ r, idx }) => (
              <tr key={idx} className="border-b border-neutral-100">
                {columns.map((c) => {
                  const v = r[c.key];
                  const isNum = numericKeys.has(c.key);
                  const isTextarea = c.kind === "textarea";
                  const value = v === undefined || v === null ? "" : String(v);

                  return (
                    <td key={c.key} className="px-3 py-2">
                      {isTextarea ? (
                        <textarea
                          className="w-full resize-y rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                          rows={3}
                          value={value}
                          placeholder={c.placeholder}
                          onChange={(e) => updateCell(idx, c.key, e.target.value)}
                        />
                      ) : (
                        <input
                          type={isNum ? "number" : "text"}
                          className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                          value={value}
                          placeholder={c.placeholder}
                          onChange={(e) => updateCell(idx, c.key, e.target.value)}
                        />
                      )}
                    </td>
                  );
                })}

                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-sm text-neutral-500"
                  colSpan={columns.length + 1}
                >
                  No rows match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-neutral-500">
        Tip: if you want stable column order, set <code>field.table.columns</code>.
      </p>
    </div>
  );
}
