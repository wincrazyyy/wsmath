import type { JSX } from "react";
import type {
  CourseGroupKey,
  CoursesSectionConfig,
  CoursesSectionGroupConfig,
} from "@/app/_lib/content/types/about.types";

type CoursesCoveredProps = {
  items?: readonly string[];
  section?: CoursesSectionConfig;
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

// Fallback config if coursesSection is missing in JSON
const DEFAULT_SECTION: CoursesSectionConfig = {
  title: "Courses covered",
  strapline: "IBDP · A-LEVEL · IGCSE",
  intro:
    "Full syllabus coverage from pre-IB / IGCSE all the way to IBDP final exams.",
  groups: [
    { key: "ib", title: "IB programmes", caption: "IBDP · IBMYP", emphasize: true },
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
  ],
};

function classifyCourse(name: string): CourseGroupKey {
  if (name.startsWith("IBDP") || name.startsWith("IBMYP")) return "ib";
  if (name.startsWith("A-Level")) return "alevel";
  return "igcse"; // everything else in your JSON is IGCSE
}

// Strip “A-Level ” / “IGCSE ” from labels (keep IB as is)
function formatCourseLabel(group: CourseGroupKey, raw: string): string {
  if (group === "alevel" && raw.startsWith("A-Level ")) {
    return raw.slice("A-Level ".length);
  }
  if (group === "igcse" && raw.startsWith("IGCSE ")) {
    return raw.slice("IGCSE ".length);
  }
  return raw;
}

export function CoursesCovered({
  items = DEFAULT_COURSES,
  section,
  className = "",
}: CoursesCoveredProps) {
  const cfg = section ?? DEFAULT_SECTION;

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
    <section className={`mt-10 ${className}`} aria-label={cfg.title}>
      {/* Section heading */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-neutral-900 md:text-lg">
            {cfg.title}
          </h3>
          <div className="h-px w-10 rounded-full bg-neutral-200" />
        </div>
        {cfg.strapline && (
          <p className="hidden text-[11px] font-medium tracking-[0.22em] text-neutral-400 sm:block">
            {cfg.strapline}
          </p>
        )}
      </div>

      {/* Shell with soft gradient background */}
      <div className="mt-4 rounded-3xl border border-neutral-200 bg-gradient-to-br from-indigo-50 via-sky-50 to-violet-50 p-[1px]">
        <div className="rounded-[1.35rem] bg-white/80 px-4 py-5 shadow-sm backdrop-blur-sm sm:px-6 sm:py-6">
          {cfg.intro && (
            <p className="max-w-2xl text-xs text-neutral-600 sm:text-sm">
              {cfg.intro}
            </p>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {cfg.groups.map((meta) => {
              const courses = grouped[meta.key];
              if (courses.length === 0) return null;

              const baseWrapper =
                "relative h-full transition-transform duration-200 ease-out hover:-translate-y-1.5";

              if (meta.emphasize) {
                // IB card – glowing border
                return (
                  <div key={meta.key} className="h-full">
                    <div
                      className={`${baseWrapper} rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 p-[1.5px] shadow-[0_0_0_1px_rgba(129,140,248,0.35)]`}
                    >
                      <div className="h-full rounded-[1rem] border border-indigo-100 bg-white p-4 shadow-sm sm:p-5">
                        <Header meta={meta} flagship />
                        <CourseList
                          groupKey={meta.key}
                          courses={courses}
                          dot={dot}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal cards
              return (
                <div key={meta.key} className="h-full">
                  <div
                    className={`${baseWrapper} rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5`}
                  >
                    <Header meta={meta} />
                    <CourseList
                      groupKey={meta.key}
                      courses={courses}
                      dot={dot}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

type HeaderProps = {
  meta: CoursesSectionGroupConfig;
  flagship?: boolean;
};

function Header({ meta, flagship }: HeaderProps) {
  return (
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

      {flagship && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase text-white shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
          Flagship
        </span>
      )}
    </div>
  );
}

type CourseListProps = {
  groupKey: CourseGroupKey;
  courses: string[];
  dot: JSX.Element;
};

function CourseList({ groupKey, courses, dot }: CourseListProps) {
  return (
    <ul className="mt-4 space-y-1.5">
      {courses.map((raw) => {
        const label = formatCourseLabel(groupKey, raw);
        return (
          <li
            key={raw}
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[0.7rem] font-medium text-neutral-800"
          >
            {dot}
            <span className="leading-snug">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
