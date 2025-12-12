// src/app/_components/sections/testimonials/grade-improvements-section.tsx

import { 
  ResultItemConfig,
  GradeScale,
  Student,
 } from "@/app/_lib/content/types/results.types";

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

// ---------- Grade helpers ----------

// Normalise grade to a numeric scale so we can compute improvements.
function normalizeGrade(grade: number | string, scale: GradeScale): number {
  if (scale === "ib") {
    if (typeof grade === "number") return grade;
    const n = Number(grade);
    return Number.isFinite(n) ? n : 0;
  }

  // Letter scale: F < E < D < C < B < A < A*
  if (typeof grade === "number") return grade;

  const s = String(grade).toUpperCase();
  const match = s.match(/[A-F]\*?/); // A, B, C, D, E, F, optionally with *
  const letter = match ? match[0] : s;
  const ORDER = ["F", "E", "D", "C", "B", "A", "A*"];
  const idx = ORDER.indexOf(letter);
  return idx >= 0 ? idx + 1 : 0;
}

function buildHeatmapRows(
  data: Student[],
  scale: GradeScale,
  isLeftFinal: (g: Student["to"]) => boolean,
  isRightFinal: (g: Student["to"]) => boolean
): HeatmapRow[] {
  const buckets: {
    [key: string]: { left: Student[]; right: Student[] };
  } = {
    maintained: { left: [], right: [] },
    plus1: { left: [], right: [] },
    plus2: { left: [], right: [] },
    plus3: { left: [], right: [] },
    plus4: { left: [], right: [] },
  };

  for (const s of data) {
    const fromScore = normalizeGrade(s.from, scale);
    const toScore = normalizeGrade(s.to, scale);

    const diff = toScore - fromScore;

    let key: keyof typeof buckets;
    if (diff <= 0) key = "maintained";
    else if (diff === 1) key = "plus1";
    else if (diff === 2) key = "plus2";
    else if (diff === 3) key = "plus3";
    else key = "plus4";

    if (isLeftFinal(s.to)) buckets[key].left.push(s);
    if (isRightFinal(s.to)) buckets[key].right.push(s);
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

  return [
    {
      label: "➖ Maintained",
      description: "Predicted = Final",
      left: {
        count: buckets.maintained.left.length,
        tooltip: makeTooltip(buckets.maintained.left),
      },
      right: {
        count: buckets.maintained.right.length,
        tooltip: makeTooltip(buckets.maintained.right),
      },
    },
    {
      label: "↗️ +1 grade",
      description: "Small step up",
      left: {
        count: buckets.plus1.left.length,
        tooltip: makeTooltip(buckets.plus1.left),
      },
      right: {
        count: buckets.plus1.right.length,
        tooltip: makeTooltip(buckets.plus1.right),
      },
    },
    {
      label: "⤴️ +2 grades",
      description: "Solid improvement",
      left: {
        count: buckets.plus2.left.length,
        tooltip: makeTooltip(buckets.plus2.left),
      },
      right: {
        count: buckets.plus2.right.length,
        tooltip: makeTooltip(buckets.plus2.right),
      },
    },
    {
      label: "📈 +3 grades",
      description: "Big jump",
      left: {
        count: buckets.plus3.left.length,
        tooltip: makeTooltip(buckets.plus3.left),
      },
      right: {
        count: buckets.plus3.right.length,
        tooltip: makeTooltip(buckets.plus3.right),
      },
    },
    {
      label: "🚀 4+ grades",
      description: "Massive jumps",
      left: {
        count: buckets.plus4.left.length,
        tooltip: makeTooltip(buckets.plus4.left),
      },
      right: {
        count: buckets.plus4.right.length,
        tooltip: makeTooltip(buckets.plus4.right),
      },
    },
  ];
}

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

// type GradeImprovementsSectionProps = {
//   programLabel: string;
//   subtitle: string;
//   students: Student[];
//   gradeScale: GradeScale; // "ib" | "letters"
// };

type GradeImprovementsSectionProps = {
  resultItem: ResultItemConfig;
  students: Student[];
};

export function GradeImprovementsSection({
  resultItem,
  students
}: GradeImprovementsSectionProps) {
  const { programLabel, subtitle, gradeScale } = resultItem;

  const isRightFinal = (g: Student["to"]) =>
    normalizeGrade(g, gradeScale) === 7; // 7 or A*
  const isLeftFinal = (g: Student["to"]) =>
    normalizeGrade(g, gradeScale) === 6; // 6 or A

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
      normalizeGrade(s.to, gradeScale) -
      normalizeGrade(s.from, gradeScale);
    return diff >= 3;
  }).length;

  const fastTrack = students.filter(
    (s) => typeof s.months === "number" && s.months <= 3
  ).length;

  const leftGradeLabel =
    gradeScale === "ib" ? "grade 6" : "grade A";
  const rightGradeLabel =
    gradeScale === "ib" ? "grade 7" : "grade A*";

  const leftColumnLabel =
    gradeScale === "ib" ? "Final grade 6" : "Final grade A";
  const rightColumnLabel =
    gradeScale === "ib" ? "Final grade 7" : "Final grade A*";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      {/* Header + summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            {programLabel} · {subtitle}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Grade improvements
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            How students move from school predictions to final exam
            results.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-indigo-50 ring-1 ring-indigo-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-indigo-700 font-semibold">
              ⭐ Reached {rightGradeLabel}
            </div>
            <div className="text-lg font-semibold text-indigo-800">
              {totalTop}
            </div>
          </div>
          <div className="rounded-xl bg-sky-50 ring-1 ring-sky-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-sky-700 font-semibold">
              📘 Reached {leftGradeLabel}
            </div>
            <div className="text-lg font-semibold text-sky-800">
              {totalSecond}
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 ring-1 ring-rose-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-rose-700 font-semibold">
              🔥 Major jumps (≥3 grades)
            </div>
            <div className="text-lg font-semibold text-rose-800">
              {bigJumps}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-amber-700 font-semibold">
              ⚡ Fast-track (≈3 months)
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
                Improvement
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {leftColumnLabel}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {rightColumnLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {heatmapRows.map((row, index) => (
              <tr
                key={row.label}
                className={`border-t border-slate-100 ${
                  index === heatmapRows.length - 1
                    ? "bg-indigo-50/40"
                    : ""
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

      <p className="mt-3 text-[11px] text-slate-400">
        👆 Hover on each cell to see the students.
      </p>
    </section>
  );
}
