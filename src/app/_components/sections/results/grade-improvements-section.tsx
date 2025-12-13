// src/app/_components/sections/testimonials/grade-improvements-section.tsx

import {
  ResultItemConfig,
  GradeScale,
  Student,
} from "@/app/_lib/content/types/results.types";

// -----------------------------------------------------------------------------
// Single JSON-style config object (easy to move to results.json later)
// -----------------------------------------------------------------------------

const GRADE_IMPROVEMENTS_CONFIG = {
  text: {
    header: {
      title: "Grade improvements",
      description:
        "How students move from school predictions to final exam results.",
    },
    summaryCards: {
      top: { icon: "⭐", labelPrefix: "Reached" },
      second: { icon: "📘", labelPrefix: "Reached" },
      bigJumps: { icon: "🔥", label: "Major jumps (≥3 grades)" },
      fastTrack: { icon: "⚡", label: "Fast-track (≈3 months)" },
    },
    heatmapRows: [
      { key: "maintained", label: "➖ Maintained", description: "Predicted = Final" },
      { key: "plus1", label: "↗️ +1 grade", description: "Small step up" },
      { key: "plus2", label: "⤴️ +2 grades", description: "Solid improvement" },
      { key: "plus3", label: "📈 +3 grades", description: "Big jump" },
      { key: "plus4", label: "🚀 4+ grades", description: "Massive jumps" },
    ],
    table: {
      improvementColumnLabel: "Improvement",
    },
    footerNote: "👆 Hover on each cell to see the students.",
  },

  gradeDisplay: {
    prefix: "grade ", // 👈 CHANGE THIS IN ONE PLACE ANYTIME
  },

  scales: {
    ib: {
      type: "numeric",
      order: [1, 2, 3, 4, 5, 6, 7],
      labels: {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
      },
    },
    letters: {
      type: "letters",
      order: ["F", "E", "D", "C", "B", "A", "A*"],
      labels: {
        1: "F",
        2: "E",
        3: "D",
        4: "C",
        5: "B",
        6: "A",
        7: "A*",
      },
    },
  },
} as const;


type BucketKey = "maintained" | "plus1" | "plus2" | "plus3" | "plus4";

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

// Convenience aliases
const TEXT = GRADE_IMPROVEMENTS_CONFIG.text;
const GRADE_SCALES = GRADE_IMPROVEMENTS_CONFIG.scales;

// -----------------------------------------------------------------------------
// Grade helpers
// -----------------------------------------------------------------------------

// Normalise grade to a numeric scale 1..7 so we can compute improvements.
function normalizeGrade(grade: number | string, scale: GradeScale): number {
  const config = GRADE_SCALES[scale];

  if (config.type === "numeric") {
    // IB-style 1–7
    if (typeof grade === "number") {
      return (config.order as readonly number[]).includes(grade) ? grade : 0;
    }

    const n = Number(grade);
    return Number.isFinite(n) &&
      (config.order as readonly number[]).includes(n)
      ? n
      : 0;
  }
  // Letter scale: F < E < D < C < B < A < A*
  if (typeof grade === "number") {
    // In case you accidentally pass numeric here, trust it's already 1..7
    return grade;
  }

  const s = String(grade).toUpperCase();
  // Extract the letter part from things like "B(6)"
  const match = s.match(/[A-F]\*?/); // A, B, C, D, E, F, optionally with *
  const letter = match ? match[0] : s;

  const idx = config.order.indexOf(letter as (typeof config.order)[number]);
  return idx >= 0 ? idx + 1 : 0; // 1..7
}

// Map a normalised score (1–7) back to a display grade string based on scale.
function formatDisplayGrade(score: number, scale: GradeScale): string {
  const { labels } = GRADE_IMPROVEMENTS_CONFIG.scales[scale];
  const prefix = GRADE_IMPROVEMENTS_CONFIG.gradeDisplay.prefix; // e.g. "grade "

  const label = (labels as Record<number, string>)[score];
  return prefix + (label ?? score);
}


function buildHeatmapRows(
  data: Student[],
  scale: GradeScale,
  isLeftFinal: (g: Student["to"]) => boolean,
  isRightFinal: (g: Student["to"]) => boolean
): HeatmapRow[] {
  const buckets: Record<BucketKey, { left: Student[]; right: Student[] }> = {
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

    let key: BucketKey;
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

  // Build rows from config so labels/descriptions live in one place
  return TEXT.heatmapRows.map((rowCfg) => {
    const key = rowCfg.key as BucketKey;
    const bucket = buckets[key];

    return {
      label: rowCfg.label,
      description: rowCfg.description,
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

  // Treat score 7 as "top" and 6 as "second top" on the normalised scale,
  // regardless of whether it's IB or letters.
  const isRightFinal = (g: Student["to"]) =>
    normalizeGrade(g, gradeScale) === 7;
  const isLeftFinal = (g: Student["to"]) =>
    normalizeGrade(g, gradeScale) === 6;

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

  const leftGradeLabel = formatDisplayGrade(6, gradeScale); // second top
  const rightGradeLabel = formatDisplayGrade(7, gradeScale); // top

  const leftColumnLabel = `Final ${leftGradeLabel}`;
  const rightColumnLabel = `Final ${rightGradeLabel}`;

  const { header, summaryCards, table, footerNote } = TEXT;

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
              {summaryCards.top.icon} {summaryCards.top.labelPrefix}{" "}
              {rightGradeLabel}
            </div>
            <div className="text-lg font-semibold text-indigo-800">
              {totalTop}
            </div>
          </div>
          <div className="rounded-xl bg-sky-50 ring-1 ring-sky-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-sky-700 font-semibold">
              {summaryCards.second.icon} {summaryCards.second.labelPrefix}{" "}
              {leftGradeLabel}
            </div>
            <div className="text-lg font-semibold text-sky-800">
              {totalSecond}
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 ring-1 ring-rose-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-rose-700 font-semibold">
              {summaryCards.bigJumps.icon} {summaryCards.bigJumps.label}
            </div>
            <div className="text-lg font-semibold text-rose-800">
              {bigJumps}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-amber-700 font-semibold">
              {summaryCards.fastTrack.icon} {summaryCards.fastTrack.label}
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
                {table.improvementColumnLabel}
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
