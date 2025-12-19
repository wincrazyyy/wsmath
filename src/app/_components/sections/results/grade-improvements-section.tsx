// src/app/_components/sections/testimonials/grade-improvements-section.tsx

import { ExpandCell } from "./expand-cell";

import {
  GradeImprovementsHeaderConfig,
  SummaryCardsConfig,
  ResultGroupConfig,
  StudentGrade,
  Student,
  MatrixHeaderConfig,
} from "@/app/_lib/content/types/results.types";

// Map a display grade string to a normalised score based on scale (>0 if found).
function normalizeGrade(grade: StudentGrade, syllabusScale: string[]): number {
  grade = grade.toString();
  for (let i = 0; i < syllabusScale.length; i++) {
    if (syllabusScale[i].includes(grade)) return i + 1;
  }
  return 0;
}

function getNthTopGrade(syllabusScale: string[], n: number): string | null {
  // n=1 => top, n=2 => second, ...
  const idx = syllabusScale.length - n;
  if (idx < 0 || idx >= syllabusScale.length) return null;
  return syllabusScale[idx] ?? null;
}

function shortGradeLabel(gradeLabel: string): string {
  // "7 (A*)" -> "7", "A*" -> "A*"
  return gradeLabel.split(/\s+/)[0] ?? gradeLabel;
}

function hashToGrade(text: string, grade: string): string {
  return text.replace("#", grade);
}

type Bucket4 = 0 | 1 | 2 | 3; // 0–1, 2, 3, 4+

type MatrixCell = {
  count: number;
  items: string[];
};

type MatrixRow = {
  gradeLabel: string;
  gradeScore: number;
  cells: [MatrixCell, MatrixCell, MatrixCell, MatrixCell];
};

function diffToBucket4(diff: number): Bucket4 {
  if (diff <= 1) return 0; // maintained or +1
  if (diff === 2) return 1;
  if (diff === 3) return 2;
  return 3; // 4+
}

function makeItems(list: Student[]): string[] {
  return list
    .slice()
    .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name))
    .map(
      (s) =>
        `${s.name} (${s.year})${
          typeof s.months === "number" ? ` — ${s.months} months` : ""
        }`,
    );
}

function buildTop4Matrix4Cols(students: Student[], syllabusScale: string[]): MatrixRow[] {
  const topLabels = [1, 2, 3, 4]
    .map((n) => getNthTopGrade(syllabusScale, n))
    .filter((x): x is string => !!x);

  const rowsMeta = topLabels
    .map((label) => {
      const g = shortGradeLabel(label);
      return { gradeLabel: g, gradeScore: normalizeGrade(g, syllabusScale) };
    })
    .filter((r) => r.gradeScore > 0);

  // buckets[rowIndex][colIndex] => Student[]
  const buckets: Student[][][] = rowsMeta.map(() => [[], [], [], []]);

  for (const s of students) {
    const fromScore = normalizeGrade(s.from, syllabusScale);
    const toScore = normalizeGrade(s.to, syllabusScale);
    const diff = toScore - fromScore;
    if (diff < 0) continue;

    const rowIndex = rowsMeta.findIndex((r) => r.gradeScore === toScore);
    if (rowIndex === -1) continue;

    const colIndex = diffToBucket4(diff);
    buckets[rowIndex][colIndex].push(s);
  }

  return rowsMeta.map((r, rowIndex) => {
    const mk = (colIndex: number): MatrixCell => {
      const list = buckets[rowIndex][colIndex] ?? [];
      return {
        count: list.length,
        items: list.length > 0 ? makeItems(list) : [],
      };
    };

    return {
      gradeLabel: r.gradeLabel,
      gradeScore: r.gradeScore,
      cells: [mk(0), mk(1), mk(2), mk(3)],
    };
  });
}

interface GradeImprovementsSectionProps {
  header: GradeImprovementsHeaderConfig;
  summaryCards: SummaryCardsConfig;
  resultItem: ResultGroupConfig;
  matrixHeader: MatrixHeaderConfig;
  footerNote?: string;
}

export function GradeImprovementsSection({
  header,
  summaryCards,
  resultItem,
  matrixHeader,
  footerNote,
}: GradeImprovementsSectionProps) {
  const { programLabel, students, gradeScale } = resultItem;
  const syllabusScale = gradeScale;

  const total = students.length;

  const topGradeRaw = getNthTopGrade(syllabusScale, 1) ?? "";
  const secondGradeRaw = getNthTopGrade(syllabusScale, 2) ?? "";

  const topGrade = topGradeRaw ? shortGradeLabel(topGradeRaw) : "";
  const secondGrade = secondGradeRaw ? shortGradeLabel(secondGradeRaw) : "";

  const topScore = topGrade ? normalizeGrade(topGrade, syllabusScale) : 0;
  const secondScore = secondGrade ? normalizeGrade(secondGrade, syllabusScale) : 0;

  const isTop = (g: Student["to"]) => normalizeGrade(g, syllabusScale) === topScore;
  const isSecondOrAbove = (g: Student["to"]) =>
    normalizeGrade(g, syllabusScale) >= secondScore;

  const totalTop = students.filter((s) => isTop(s.to)).length;
  const totalSecondOrAbove = students.filter((s) => isSecondOrAbove(s.to)).length;

  const pct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  const bigJumps = students.filter((s) => {
    const diff = normalizeGrade(s.to, syllabusScale) - normalizeGrade(s.from, syllabusScale);
    return diff >= 2;
  }).length;

  const improvements = students.filter((s) => {
    const diff = normalizeGrade(s.to, syllabusScale) - normalizeGrade(s.from, syllabusScale);
    return diff >= 1;
  }).length;

  const matrixRows = buildTop4Matrix4Cols(students, syllabusScale);

  return (
    <section className="space-y-5">
      {/* Header + summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            {programLabel}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{header.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{header.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="flex flex-col justify-between rounded-xl bg-indigo-50 ring-1 ring-indigo-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-indigo-700 font-semibold">
              {topGrade ? hashToGrade(summaryCards.top, topGrade) : summaryCards.top}
            </div>
            <div className="text-lg font-semibold text-indigo-800">
              {totalTop}
              <span className="ml-2 text-xs font-semibold text-indigo-600">({pct(totalTop)}%)</span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-sky-50 ring-1 ring-sky-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-sky-700 font-semibold">
              {secondGrade
                ? hashToGrade(summaryCards.second, secondGrade)
                : summaryCards.second}
            </div>
            <div className="text-lg font-semibold text-sky-800">
              {totalSecondOrAbove}
              <span className="ml-2 text-xs font-semibold text-sky-600">
                ({pct(totalSecondOrAbove)}%)
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-rose-50 ring-1 ring-rose-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-rose-700 font-semibold">
              {summaryCards.bigJumps}
            </div>
            <div className="text-lg font-semibold text-rose-800">
              {bigJumps}
              <span className="ml-2 text-xs font-semibold text-rose-600">({pct(bigJumps)}%)</span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-amber-50 ring-1 ring-amber-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-amber-700 font-semibold">
              {summaryCards.improvements}
            </div>
            <div className="text-lg font-semibold text-amber-800">
              {improvements}
              <span className="ml-2 text-xs font-semibold text-amber-600">
                ({pct(improvements)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-column matrix */}
      <div className="mt-1 rounded-xl border border-slate-100 bg-white">
        {/* mobile horizontal scroll */}
        <div className="relative overflow-x-auto">
          {/* scroll hint (only on small screens) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-white/0 sm:hidden" />

          <table className="min-w-[720px] w-full border-collapse text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="w-32 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {matrixHeader.keyColumn}
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {matrixHeader.col0to1}
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {matrixHeader.col2}
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {matrixHeader.col3}
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {matrixHeader.col4plus}
                </th>
              </tr>
            </thead>

            <tbody>
              {matrixRows.map((row) => (
                <tr
                  key={`${row.gradeScore}-${row.gradeLabel}`}
                  className="border-t border-slate-100"
                >
                  <td className="px-3 py-2 align-top">
                    <div className="text-xs font-semibold text-slate-900">
                      {row.gradeLabel}
                    </div>
                  </td>

                  {row.cells.map((cell, j) => (
                    <td key={j} className="px-3 py-2 align-top">
                      {cell.count > 0 ? (
                        <ExpandCell count={cell.count} items={cell.items} />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {matrixRows.length === 0 && (
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-3 text-sm text-slate-400" colSpan={5}>
                    No data to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* optional helper text for mobile */}
        <div className="px-3 pb-3 pt-2 text-[11px] text-slate-400 sm:hidden">
          Swipe left/right to view the full table.
        </div>
      </div>

      {footerNote && <p className="mt-1 text-[11px] text-slate-400">{footerNote}</p>}
    </section>
  );
}
