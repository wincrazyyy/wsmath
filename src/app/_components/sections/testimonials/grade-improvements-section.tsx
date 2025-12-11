// src/app/_components/sections/testimonials/grade-improvements-section.tsx

const studentsJson = [
  { "name": "Marcus", "year": 2025, "from": 6, "to": 7 },
  { "name": "Miriam", "year": 2025, "from": 6, "to": 7 },
  { "name": "Sophia", "year": 2025, "from": 4, "to": 6 },
  { "name": "Josephine", "year": 2025, "from": 4, "to": 6 },
  { "name": "James", "year": 2024, "from": 1, "to": 7, "months": 24 },
  { "name": "Jasmine", "year": 2023, "from": 1, "to": 6 },
  { "name": "Joy", "year": 2022, "from": 5, "to": 7 },
  { "name": "Ethan", "year": 2022, "from": 5, "to": 7 },
  { "name": "Cici", "year": 2022, "from": 6, "to": 7 },
  { "name": "Alice", "year": 2022, "from": 6, "to": 7 },
  { "name": "Mary", "year": 2022, "from": 7, "to": 7 },
  { "name": "Fiona", "year": 2022, "from": 3, "to": 6, "months": 3 },
  { "name": "Janice", "year": 2021, "from": 5, "to": 7 },
  { "name": "Hebe", "year": 2021, "from": 5, "to": 7 },
  { "name": "Vera", "year": 2021, "from": 6, "to": 7 },
  { "name": "Ivy", "year": 2021, "from": 6, "to": 7 },
  { "name": "Taylor", "year": 2019, "from": 6, "to": 7 },
  { "name": "Anthony", "year": 2019, "from": 5, "to": 6 },
  { "name": "Mickey", "year": 2018, "from": 7, "to": 7 },
  { "name": "Lucia", "year": 2018, "from": 3, "to": 6, "months": 3 },
  { "name": "Evelyn", "year": 2018, "from": 5, "to": 6 }
];

type HeatmapCell = {
  count: number;
  tooltip?: string;
};

type HeatmapRow = {
  label: string;
  description?: string;
  grade6: HeatmapCell;
  grade7: HeatmapCell;
};

type Student = {
  name: string;
  year: number;
  from: number;
  to: number;
  months?: number;
};

function buildHeatmapRows(data: Student[]): HeatmapRow[] {
  const buckets: { [key: string]: { grade6: Student[]; grade7: Student[] } } = {
    maintained: { grade6: [], grade7: [] },
    plus1: { grade6: [], grade7: [] },
    plus2: { grade6: [], grade7: [] },
    plus3: { grade6: [], grade7: [] },
    plus4: { grade6: [], grade7: [] },
  };

  for (const s of data) {
    const diff = s.to - s.from;

    let key: string;
    if (diff === 0) key = "maintained";
    else if (diff === 1) key = "plus1";
    else if (diff === 2) key = "plus2";
    else if (diff === 3) key = "plus3";
    else key = "plus4";

    if (s.to === 6) buckets[key].grade6.push(s);
    if (s.to === 7) buckets[key].grade7.push(s);
  }

  const makeTooltip = (list: Student[]) =>
    list
      .slice()
      .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
      .map(
        (s) =>
          `${s.name} (${s.year})${s.months ? ` — ${s.months} months` : ""}`
      )
      .join(", ");

  return [
    {
      label: "➖ Maintained",
      description: "Predicted = Final",
      grade6: {
        count: buckets.maintained.grade6.length,
        tooltip: makeTooltip(buckets.maintained.grade6),
      },
      grade7: {
        count: buckets.maintained.grade7.length,
        tooltip: makeTooltip(buckets.maintained.grade7),
      },
    },
    {
      label: "↗️ +1 grade",
      description: "e.g. 5 → 6, 6 → 7",
      grade6: {
        count: buckets.plus1.grade6.length,
        tooltip: makeTooltip(buckets.plus1.grade6),
      },
      grade7: {
        count: buckets.plus1.grade7.length,
        tooltip: makeTooltip(buckets.plus1.grade7),
      },
    },
    {
      label: "⤴️ +2 grades",
      description: "e.g. 4 → 6, 5 → 7",
      grade6: {
        count: buckets.plus2.grade6.length,
        tooltip: makeTooltip(buckets.plus2.grade6),
      },
      grade7: {
        count: buckets.plus2.grade7.length,
        tooltip: makeTooltip(buckets.plus2.grade7),
      },
    },
    {
      label: "📈 +3 grades",
      description: "e.g. 3 → 6, 4 → 7",
      grade6: {
        count: buckets.plus3.grade6.length,
        tooltip: makeTooltip(buckets.plus3.grade6),
      },
      grade7: {
        count: buckets.plus3.grade7.length,
        tooltip: makeTooltip(buckets.plus3.grade7),
      },
    },
    {
      label: "🚀 4+ grades",
      description: "Massive jumps (1 → 6/7)",
      grade6: {
        count: buckets.plus4.grade6.length,
        tooltip: makeTooltip(buckets.plus4.grade6),
      },
      grade7: {
        count: buckets.plus4.grade7.length,
        tooltip: makeTooltip(buckets.plus4.grade7),
      },
    },
  ];
}

const HEATMAP_ROWS = buildHeatmapRows(studentsJson);

const TOTAL_TO_7 = studentsJson.filter(s => s.to === 7).length;
const TOTAL_TO_6 = studentsJson.filter(s => s.to === 6).length;
const BIG_JUMPS  = studentsJson.filter(s => s.to - s.from >= 3).length;
const FAST_TRACK = studentsJson.filter(s => s.months && s.months <= 3).length;

function TooltipCell({ count, tooltip }: { count: number; tooltip?: string }) {
  return (
    <div className="relative group h-10 w-full">
      {/* the TRIGGER must be on the same element as the tooltip */}
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


export function GradeImprovementsSection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      {/* Header + summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Math HL · AAHL · AIHL
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Grade improvements
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            How students move from school predictions to final IBDP results.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-indigo-50 ring-1 ring-indigo-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-indigo-700 font-semibold">
              ⭐ Reached grade 7
            </div>
            <div className="text-lg font-semibold text-indigo-800">
              {TOTAL_TO_7}
            </div>
          </div>
          <div className="rounded-xl bg-sky-50 ring-1 ring-sky-200 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-sky-700 font-semibold">
              📘 Reached grade 6
            </div>
            <div className="text-lg font-semibold text-sky-800">
              {TOTAL_TO_6}
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 ring-1 ring-rose-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-rose-700 font-semibold">
              🔥 Major jumps (≥3 grades)
            </div>
            <div className="text-lg font-semibold text-rose-800">
              {BIG_JUMPS}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-300 px-3 py-2">
            <div className="text-[12px] uppercase tracking-wide text-amber-700 font-semibold">
              ⚡ Fast-track (≈3 months)
            </div>
            <div className="text-lg font-semibold text-amber-800">
              {FAST_TRACK}
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
                Final grade 6
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Final grade 7
              </th>
            </tr>
          </thead>
          <tbody>
            {HEATMAP_ROWS.map((row, index) => (
              <tr
                key={row.label}
                className={`border-t border-slate-100 ${
                  index === HEATMAP_ROWS.length - 1
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
                  <TooltipCell count={row.grade6.count} tooltip={row.grade6.tooltip} />
                </td>
                <td className="px-3 py-2">
                  <TooltipCell count={row.grade7.count} tooltip={row.grade7.tooltip} />
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
