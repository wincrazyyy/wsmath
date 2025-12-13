// src/app/_components/sections/testimonials/grade-improvements-section.tsx

import {
  GradeImprovementsHeaderConfig,
  SummaryCardsConfig,
  ResultItemConfig,
  StudentGrade,
  Student,
  HeatmapCell,
  HeatmapTableConfig,
  ScalesMapConfig,
} from "@/app/_lib/content/types/results.types";

import { TooltipCell } from "./tooltip-cell";

// Map a display grade string to a normalised score based on scale (>0 if found).
function normalizeGrade(grade: StudentGrade, syllabusScale: string[]): number {
  grade = grade.toString();
  for (let i = 0; i < syllabusScale.length; i++) {
    if (syllabusScale[i].includes(grade)) {
      return i + 1;
    }
  }
  return 0; // grade not found
}

// Get the top grade for a given scale
function getTopGrade(syllabusScale: string[]): string {
  return syllabusScale.at(-1) as string;
}

// Get the second top grade for a given scale
function getSecondGrade(syllabusScale: string[]): string {
  return syllabusScale.at(-2) as string;
}

// Replace "#" in text with the given grade
function hashToGrade(text: string, grade: string): string {
  return text.replace("#", grade);
}

type HeatmapRow = {
  label: string;
  description?: string;
  left: HeatmapCell;
  right: HeatmapCell;
};

function buildHeatmapRows(
  data: Student[],
  table: HeatmapTableConfig,
  syllabusScale: string[],
  isLeftFinal: (g: Student["to"]) => boolean,
  isRightFinal: (g: Student["to"]) => boolean
): HeatmapRow[] {
  const buckets: { left: Student[]; right: Student[] }[] = [];
  const totalRows = table.heatmapKeys.length;
  for (let i = 0; i < totalRows; i++) {
    buckets.push({ left: [], right: [] });
  }

  for (const s of data) {
    const fromScore = normalizeGrade(s.from, syllabusScale);
    const toScore = normalizeGrade(s.to, syllabusScale);

    const diff = toScore - fromScore;
    if (diff < 0) continue;

    const rowNumber = diff >= totalRows ? totalRows - 1 : diff;

    if (isLeftFinal(s.to)) buckets[rowNumber].left.push(s);
    if (isRightFinal(s.to)) buckets[rowNumber].right.push(s);
  }

  const makeTooltip = (list: Student[]) =>
    list
      .slice()
      .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name))
      .map(
        (s) =>
          `${s.name} (${s.year})${
            typeof s.months === "number" ? ` — ${s.months} months` : ""
          }`
      )
      .join(", ");

  // Build rows from config so labels/descriptions live in one place
  return table.heatmapKeys.map((row, index) => {
    const bucket = buckets[index];

    return {
      label: row.label,
      description: row.description,
      left: {
        count: bucket.left.length,
        tooltip: makeTooltip(bucket.left),
      },
      right: {
        count: bucket.right.length,
        tooltip: makeTooltip(bucket.right),
      },
    };
  });
}

interface GradeImprovementsSectionProps {
  header: GradeImprovementsHeaderConfig;
  summaryCards: SummaryCardsConfig;
  resultItem: ResultItemConfig;
  students: Student[];
  table: HeatmapTableConfig;
  scales: ScalesMapConfig;
  footerNote?: string;
}

export function GradeImprovementsSection({
  header,
  summaryCards,
  resultItem,
  students,
  table,
  scales,
  footerNote,
}: GradeImprovementsSectionProps) {
  const { programLabel, subtitle, gradeScale } = resultItem;
  const syllabusScale = scales[gradeScale];

  const isRightFinal = (g: Student["to"]) =>
    normalizeGrade(g, syllabusScale) ===
    normalizeGrade(getTopGrade(syllabusScale), syllabusScale);
  const isLeftFinal = (g: Student["to"]) =>
    normalizeGrade(g, syllabusScale) ===
    normalizeGrade(getSecondGrade(syllabusScale), syllabusScale);

  const heatmapRows = buildHeatmapRows(
    students,
    table,
    syllabusScale,
    isLeftFinal,
    isRightFinal
  );

  const totalTop = students.filter((s) => isRightFinal(s.to)).length;
  const totalSecond = students.filter((s) => isLeftFinal(s.to)).length;

  const bigJumps = students.filter((s) => {
    const diff =
      normalizeGrade(s.to, syllabusScale) -
      normalizeGrade(s.from, syllabusScale);
    return diff >= 3;
  }).length;

  const fastTrack = students.filter(
    (s) => typeof s.months === "number" && s.months <= 3
  ).length;

  return (
    <section className="space-y-5">
      {/* Header + summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            {programLabel} · {subtitle}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {header.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{header.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="flex flex-col justify-between rounded-xl bg-indigo-50 ring-1 ring-indigo-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-indigo-700 font-semibold">
              {hashToGrade(summaryCards.top, getTopGrade(syllabusScale))}
            </div>
            <div className="text-lg font-semibold text-indigo-800">
              {totalTop}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-sky-50 ring-1 ring-sky-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-sky-700 font-semibold">
              {hashToGrade(
                summaryCards.second,
                getSecondGrade(syllabusScale)
              )}
            </div>
            <div className="text-lg font-semibold text-sky-800">
              {totalSecond}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-rose-50 ring-1 ring-rose-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-rose-700 font-semibold">
              {summaryCards.bigJumps}
            </div>
            <div className="text-lg font-semibold text-rose-800">
              {bigJumps}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-amber-50 ring-1 ring-amber-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-amber-700 font-semibold">
              {summaryCards.fastTrack}
            </div>
            <div className="text-lg font-semibold text-amber-800">
              {fastTrack}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="mt-1 rounded-xl border border-slate-100 overflow-visible">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="w-40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {table.keyColumn}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {hashToGrade(
                  table.leftColumn,
                  getSecondGrade(syllabusScale)
                )}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {hashToGrade(table.rightColumn, getTopGrade(syllabusScale))}
              </th>
            </tr>
          </thead>
          <tbody>
            {heatmapRows.map((row, index) => (
              <tr
                key={row.label}
                className={`border-t border-slate-100 ${
                  index === heatmapRows.length - 1 ? "bg-indigo-50/40" : ""
                }`}
              >
                <td className="px-3 py-2 align-top">
                  <div className="text-xs font-medium text-slate-800">
                    {row.label}
                  </div>
                  {row.description && (
                    <div className="text-[11px] text-slate-500">
                      {row.description}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  <TooltipCell
                    count={row.left.count}
                    tooltip={row.left.tooltip}
                  />
                </td>
                <td className="px-3 py-2">
                  <TooltipCell
                    count={row.right.count}
                    tooltip={row.right.tooltip}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footerNote && (
        <p className="mt-1 text-[11px] text-slate-400">{footerNote}</p>
      )}
    </section>
  );
}
