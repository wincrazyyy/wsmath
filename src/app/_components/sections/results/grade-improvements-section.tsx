// src/app/_components/sections/testimonials/grade-improvements-section.tsx

import {
  ResultItemConfig,
  Student,
  StudentGrade,
} from "@/app/_lib/content/types/results.types";

// -----------------------------------------------------------------------------
// Single JSON-style config object (easy to move to results.json later)
// -----------------------------------------------------------------------------

const gradeImprovementsConfig = {
  "header": {
    "title": "Grade improvements",
    "description": "How students move from school predictions to final exam results."
  },
  "summaryCards": {
    "top": "⭐ Final grade #",
    "second": "📘 Final grade #",
    "bigJumps": "🔥 Major jumps (≥3 grades)",
    "fastTrack": "⚡ Fast-track (≈3 months)"
  },
  "footerNote": "👆 Hover on each cell to see the students.",
  "table": {
    "legendColumn": "Improvement",
    "leftColumn": "Final Grade #",
    "rightColumn": "Final Grade #",
    "heatmapRows": [
      {
        "label": "➖ Maintained",
        "description": "Predicted = Final"
      },
      {
        "label": "↗️ +1 grade",
        "description": "Small step up"
      },
      {
        "label": "⤴️ +2 grades",
        "description": "Solid improvement"
      },
      {
        "label": "📈 +3 grades",
        "description": "Big jump"
      },
      {
        "label": "🚀 4+ grades",
        "description": "Massive jumps"
      }
    ]
  },
  "scales": {
    "ib": ["1", "2", "3", "4", "5", "6", "7"],
    "al": ["F", "E", "D", "C", "B", "A", "A*"],
    "igcse": ["U(1)", "G(2)", "F(3)", "E(4)", "D(5)", "C(6)", "B(7)", "A(8)", "A*(9)"]
  }
}

type HeatmapCell = {
  count: number;
  tooltip?: string;
};

type HeatmapRow = {
  label: string;
  description?: string;
  left: HeatmapCell;
  right: HeatmapCell;
};

// -----------------------------------------------------------------------------
// Grade helpers
// -----------------------------------------------------------------------------

// Map a display grade string to a normalised score based on scale (>0 if found).
function normalizeGrade(grade: StudentGrade, scale: string): number {
  grade = grade.toString();
  const syllabusScale = gradeImprovementsConfig.scales[scale as keyof typeof gradeImprovementsConfig.scales];
  for (let i = 0; i < syllabusScale.length; i++) {
    if (syllabusScale[i].includes(grade)) {
      return i + 1;
    }
  }
  return 0; // grade not found
}

// Get the top grade for a given scale
function getTopGrade(scale: string): string {
  const syllabusScale = gradeImprovementsConfig.scales[scale as keyof typeof gradeImprovementsConfig.scales];
  return syllabusScale[syllabusScale.length - 1];
}

// Get the second top grade for a given scale
function getSecondGrade(scale: string): string {
  const syllabusScale = gradeImprovementsConfig.scales[scale as keyof typeof gradeImprovementsConfig.scales];
  return syllabusScale[syllabusScale.length - 2];
}


// Replace "#" in text with the given grade
function hashToGrade(text: string, grade: string): string {
  return text.replace("#", grade);
}

function buildHeatmapRows(
  data: Student[],
  scale: string,
  isLeftFinal: (g: Student["to"]) => boolean,
  isRightFinal: (g: Student["to"]) => boolean
): HeatmapRow[] {
  const table = gradeImprovementsConfig.table;
  const buckets: { left: Student[]; right: Student[] }[] = [];
  const totalRows = table.heatmapRows.length;
  for (let i = 0; i < totalRows; i++) {
    buckets.push({ left: [], right: [] });
  }

  for (const s of data) {
    const fromScore = normalizeGrade(s.from, scale);
    const toScore = normalizeGrade(s.to, scale);

    const diff = toScore - fromScore;
    if (diff < 0) continue;

    let rowNumber = diff >= totalRows ? totalRows - 1 : diff;

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
  return table.heatmapRows.map((row, index) => {
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

// -----------------------------------------------------------------------------
// UI bits
// -----------------------------------------------------------------------------

function TooltipCell({ count, tooltip }: { count: number; tooltip?: string }) {
  return (
    <div className="relative group h-10 w-full">
      <div
        className={`flex h-full items-center rounded-lg px-3 text-xs font-medium ${
          count === 0
            ? "bg-slate-50 text-slate-300"
            : "bg-indigo-100 text-slate-900"
        }`}
      >
        {count > 0 ? `${count} student${count > 1 ? "s" : ""}` : "—"}
      </div>

      {tooltip && count > 0 && (
        <div
          className="
            absolute left-0 top-full 
            hidden group-hover:block 
            z-20 mt-1 w-full
            rounded-md bg-black/80 px-2 py-2 
            text-[11px] text-white leading-normal
            whitespace-normal break-words
          "
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

type GradeImprovementsSectionProps = {
  resultItem: ResultItemConfig;
  students: Student[];
};

export function GradeImprovementsSection({
  resultItem,
  students,
}: GradeImprovementsSectionProps) {
  const { programLabel, subtitle, gradeScale } = resultItem;

  const isRightFinal = (g: Student["to"]) =>
    normalizeGrade(g, gradeScale) === normalizeGrade(getTopGrade(gradeScale), gradeScale);
  const isLeftFinal = (g: Student["to"]) =>
    normalizeGrade(g, gradeScale) === normalizeGrade(getSecondGrade(gradeScale), gradeScale);

  const heatmapRows = buildHeatmapRows(
    students,
    gradeScale,
    isLeftFinal,
    isRightFinal
  );

  const totalTop = students.filter((s) => isRightFinal(s.to)).length;
  const totalSecond = students.filter((s) => isLeftFinal(s.to)).length;

  const bigJumps = students.filter((s) => {
    const diff =
      normalizeGrade(s.to, gradeScale) - normalizeGrade(s.from, gradeScale);
    return diff >= 3;
  }).length;

  const fastTrack = students.filter(
    (s) => typeof s.months === "number" && s.months <= 3
  ).length;

  const { header, summaryCards, footerNote, table } = gradeImprovementsConfig;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      {/* Header + summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            {programLabel} · {subtitle}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {header.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {header.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-indigo-50 ring-1 ring-indigo-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-indigo-700 font-semibold">
              {hashToGrade(summaryCards.top, getTopGrade(gradeScale))}
            </div>
            <div className="text-lg font-semibold text-indigo-800">
              {totalTop}
            </div>
          </div>
          <div className="rounded-xl bg-sky-50 ring-1 ring-sky-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-sky-700 font-semibold">
              {hashToGrade(summaryCards.second, getSecondGrade(gradeScale))}
            </div>
            <div className="text-lg font-semibold text-sky-800">
              {totalSecond}
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 ring-1 ring-rose-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-rose-700 font-semibold">
              {summaryCards.bigJumps}
            </div>
            <div className="text-lg font-semibold text-rose-800">
              {bigJumps}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-300 px-3 py-2">
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
      <div className="mt-5 rounded-xl border border-slate-100 overflow-visible">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="w-40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {table.legendColumn}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {hashToGrade(table.leftColumn, getSecondGrade(gradeScale))}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {hashToGrade(table.rightColumn, getTopGrade(gradeScale))}
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

      <p className="mt-3 text-[11px] text-slate-400">{footerNote}</p>
    </section>
  );
}
