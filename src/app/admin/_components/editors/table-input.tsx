"use client";

import { useMemo, useState } from "react";
import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { getByPath, setByPath } from "@/app/admin/_lib/json-path";

type StudentGrade = number | string;

type Student = {
  name: string;
  year: number;
  from: StudentGrade;
  to: StudentGrade;
  months?: number;
};

type Props<T extends object> = {
  field: FieldConfig;          // field.path points to "...students"
  data: T;
  onChangeData: (next: T) => void;
};

function toStudents(raw: unknown): Student[] {
  return Array.isArray(raw) ? (raw as Student[]) : [];
}

function toGradeScale(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const xs = raw.filter((x) => typeof x === "string") as string[];
  return xs.length ? xs : null;
}

function parseBulk(text: string): Student[] {
  // Accept CSV or TSV-ish:
  // name, year, from, to, months?
  // name \t year \t from \t to \t months?
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const out: Student[] = [];

  for (const line of lines) {
    const parts = line.includes("\t")
      ? line.split("\t").map((x) => x.trim())
      : line.split(",").map((x) => x.trim());

    if (parts.length < 4) continue;

    const [name, yearStr, from, to, monthsStr] = parts;

    const year = Number(yearStr);
    if (!name || !Number.isFinite(year)) continue;

    const months =
      monthsStr !== undefined && monthsStr !== ""
        ? Number(monthsStr)
        : undefined;

    out.push({
      name,
      year,
      from,
      to,
      ...(Number.isFinite(months as number) ? { months } : {}),
    });
  }

  return out;
}

export function TableInput<T extends object>({
  field,
  data,
  onChangeData,
}: Props<T>) {
  const studentsPath = field.path;

  // Try to discover sibling gradeScale: replace ".students" -> ".gradeScale"
  const gradeScalePath = studentsPath.replace(/\.students$/, ".gradeScale");
  const gradeScale = toGradeScale(getByPath(data, gradeScalePath));

  const students = toStudents(getByPath(data, studentsPath));

  const [query, setQuery] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;

    return students.filter((s) => {
      const name = String(s.name ?? "").toLowerCase();
      const year = String(s.year ?? "");
      return name.includes(q) || year.includes(q);
    });
  }, [students, query]);

  function commit(nextStudents: Student[]) {
    const next = structuredClone(data) as T;
    setByPath(next, studentsPath, nextStudents);
    onChangeData(next);
  }

  function updateRow(idx: number, patch: Partial<Student>) {
    const next = students.slice();
    next[idx] = { ...next[idx], ...patch };
    commit(next);
  }

  function removeRow(idx: number) {
    const next = students.slice();
    next.splice(idx, 1);
    commit(next);
  }

  function addRow() {
    commit([
      ...students,
      { name: "New student", year: new Date().getFullYear(), from: "", to: "" },
    ]);
  }

  function replaceFromBulk() {
    commit(parseBulk(bulkText));
    setBulkText("");
    setBulkOpen(false);
  }

  function appendFromBulk() {
    commit([...students, ...parseBulk(bulkText)]);
    setBulkText("");
    setBulkOpen(false);
  }

  const GradeInput = ({
    value,
    onChange,
  }: {
    value: StudentGrade;
    onChange: (v: StudentGrade) => void;
  }) => {
    if (gradeScale) {
      const v = value === undefined || value === null ? "" : String(value);
      return (
        <select
          className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          value={v}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {gradeScale.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        value={value === undefined || value === null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 6 or A*"
      />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 sm:w-72"
            placeholder="Search by name or year…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-xs text-neutral-500">
            {students.length} total
          </div>
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
            + Add student
          </button>
        </div>
      </div>

      {bulkOpen && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="text-xs font-semibold text-neutral-900">
            Bulk paste (CSV or tab-separated)
          </div>
          <div className="mt-1 text-[11px] text-neutral-600">
            Format: <code>name, year, from, to, months?</code>
          </div>

          <textarea
            className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            rows={5}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`Marcus, 2025, 6, 7\nFiona, 2022, 3, 6, 3`}
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
        <table className="min-w-[860px] w-full border-collapse text-sm">
          <thead className="bg-neutral-50">
            <tr className="border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Year
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                From
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                To
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Months
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => {
              const idx = students.indexOf(s); // ok for your use case
              return (
                <tr key={`${s.name}__${s.year}__${idx}`} className="border-b border-neutral-100">
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      value={s.name ?? ""}
                      onChange={(e) => updateRow(idx, { name: e.target.value })}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      value={Number.isFinite(s.year) ? s.year : ""}
                      onChange={(e) =>
                        updateRow(idx, { year: Number(e.target.value) })
                      }
                    />
                  </td>

                  <td className="px-3 py-2">
                    <GradeInput
                      value={s.from}
                      onChange={(v) => updateRow(idx, { from: v })}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <GradeInput
                      value={s.to}
                      onChange={(v) => updateRow(idx, { to: v })}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      value={typeof s.months === "number" ? s.months : ""}
                      placeholder="(optional)"
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        updateRow(idx, { months: v === "" ? undefined : Number(v) });
                      }}
                    />
                  </td>

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
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-sm text-neutral-500" colSpan={6}>
                  No students match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-neutral-500">
        Tip: keep names unique per programme group to avoid tooltip ambiguity.
      </p>
    </div>
  );
}
