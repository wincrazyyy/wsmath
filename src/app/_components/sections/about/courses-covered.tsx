// app/_components/sections/about/courses-covered.tsx
type CoursesCoveredProps = {
  items?: readonly string[];
  title?: string;
  className?: string;
};

const DEFAULT_COURSES: readonly string[] = [
  "IBDP AAHL",
  "IBDP AASL",
  "IBDP AIHL",
  "IBDP AISL",
  "A-Level Math",
  "A-Level Further Math",
];

type CourseGroupKey = "ib" | "alevel" | "igcse";

type GroupMeta = {
  key: CourseGroupKey;
  title: string;
  caption?: string;
  emphasize?: boolean;
};

const GROUPS_META: GroupMeta[] = [
  {
    key: "ib",
    title: "IB programmes",
    caption: "IBDP · IBMYP",
    emphasize: true,
  },
  {
    key: "alevel",
    title: "A-Level programmes",
    caption: "Edexcel · CAIE · AQA · OCR",
  },
  {
    key: "igcse",
    title: "IGCSE programmes",
    caption: "Cambridge · Edexcel",
  },
];

function classifyCourse(name: string): CourseGroupKey {
  if (name.startsWith("IBDP") || name.startsWith("IBMYP")) return "ib";
  if (name.startsWith("A-Level")) return "alevel";
  return "igcse";
}

export function CoursesCovered({
  items = DEFAULT_COURSES,
  title = "Courses covered",
  className = "",
}: CoursesCoveredProps) {
  const grouped: Record<CourseGroupKey, string[]> = {
    ib: [],
    alevel: [],
    igcse: [],
  };

  for (const c of items) {
    grouped[classifyCourse(c)].push(c);
  }

  const dot = (
    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
  );

  return (
    <section className={`mt-10 ${className}`} aria-label={title}>
      {/* Section heading */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-neutral-900 md:text-lg">
            {title}
          </h3>
          <div className="h-px w-10 rounded-full bg-neutral-200" />
        </div>
        <p className="hidden text-[11px] font-medium tracking-[0.22em] text-neutral-400 sm:block">
          IBDP · A-LEVEL · IGCSE
        </p>
      </div>

      {/* Shell with soft gradient background */}
      <div className="mt-4 rounded-3xl border border-neutral-200 bg-gradient-to-br from-indigo-50 via-sky-50 to-violet-50 p-[1px]">
        <div className="rounded-[1.35rem] bg-white/80 px-4 py-5 shadow-sm backdrop-blur-sm sm:px-6 sm:py-6">
          <p className="max-w-2xl text-xs text-neutral-600 sm:text-sm">
            Full syllabus coverage from <span className="font-semibold">pre-IB / IGCSE</span>{" "}
            all the way to <span className="font-semibold">IBDP final exams</span>.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {GROUPS_META.filter((meta) => grouped[meta.key].length > 0).map(
              (meta) => (
                <div
                  key={meta.key}
                  className={`relative h-full rounded-2xl border bg-white p-4 text-xs shadow-sm sm:p-5 ${
                    meta.emphasize
                      ? "border-indigo-200/70 shadow-md"
                      : "border-neutral-200"
                  }`}
                >
                  {/* Top gradient bar for IB card – clipped by border radius */}
                  {meta.emphasize && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
                  )}

                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <h4
                        className={
                          meta.emphasize
                            ? "text-sm font-semibold text-neutral-900 sm:text-[0.95rem]"
                            : "text-[0.85rem] font-semibold text-neutral-900"
                        }
                      >
                        {meta.title}
                      </h4>
                      {meta.caption && (
                        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-neutral-400">
                          {meta.caption}
                        </p>
                      )}
                    </div>

                    {meta.emphasize && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase text-white shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                        Flagship
                      </span>
                    )}
                  </div>

                  {/* Stacked rows of course tags */}
                  <ul className="mt-4 space-y-1.5">
                    {grouped[meta.key].map((c) => (
                      <li
                        key={c}
                        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[0.7rem] font-medium text-neutral-800"
                      >
                        {dot}
                        <span className="leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
