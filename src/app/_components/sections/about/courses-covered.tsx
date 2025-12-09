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

function classifyCourse(name: string): CourseGroupKey | null {
  if (name.startsWith("IBDP") || name.startsWith("IBMYP")) return "ib";
  if (name.startsWith("A-Level")) return "alevel";
  if (name.startsWith("IGCSE")) return "igcse";
  return null;
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
    const key = classifyCourse(c);
    if (key) grouped[key].push(c);
  }

  const dot = (
    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
  );

  return (
    <section className={`mt-8 ${className}`} aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[0.95rem] font-semibold text-neutral-900 md:text-base">
            {title}
          </h3>
          <div className="h-px w-12 rounded-full bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300" />
        </div>
        <p className="hidden text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 md:block">
          IB · A-Level · IGCSE
        </p>
      </div>

      {/* Fancy container */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-gradient-to-br from-indigo-50/70 via-sky-50/60 to-white p-4 shadow-sm md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {GROUPS_META.map((meta) => {
            const courses = grouped[meta.key];
            if (courses.length === 0) return null;

            const isIB = meta.key === "ib";

            return (
              <div
                key={meta.key}
                className={[
                  "relative h-full rounded-xl border bg-white/90 p-4 text-xs shadow-sm backdrop-blur",
                  isIB
                    ? "border-transparent bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-[1.5px] shadow-md"
                    : "border-neutral-200",
                ].join(" ")}
              >
                {/* inner card for IB gradient border */}
                <div
                  className={
                    isIB
                      ? "h-full rounded-[0.75rem] bg-white/98 p-3.5"
                      : "h-full"
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h4
                      className={
                        "text-[0.8rem] font-semibold " +
                        (isIB ? "text-neutral-900" : "text-neutral-900")
                      }
                    >
                      {meta.title}
                    </h4>
                    {meta.caption && (
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[0.65rem] font-medium " +
                          (isIB
                            ? "bg-gradient-to-r from-indigo-50 via-violet-50 to-sky-50 text-violet-700"
                            : "bg-neutral-50 text-neutral-500")
                        }
                      >
                        {meta.caption}
                      </span>
                    )}
                  </div>

                  {isIB && (
                    <p className="mt-1 text-[0.7rem] text-neutral-500">
                      Core focus: AAHL · AASL · AIHL · AISL
                    </p>
                  )}

                  <ul className="mt-3 space-y-1.5">
                    {courses.map((c) => (
                      <li
                        key={c}
                        className={
                          "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[0.7rem] leading-snug " +
                          (isIB
                            ? "border-violet-100 bg-violet-50/80 text-neutral-900"
                            : "border-neutral-100 bg-neutral-50 text-neutral-800")
                        }
                      >
                        {dot}
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
