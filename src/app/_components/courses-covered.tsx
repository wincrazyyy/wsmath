// app/_components/courses-covered.tsx
type CoursesCoveredProps = {
  /** Override the default list if you want */
  items?: string[];
  /** Optional custom section title */
  title?: string;
  className?: string;
};

const DEFAULT_COURSES = [
  "IBDP AAHL",
  "IBDP AASL",
  "IBDP AIHL",
  "IBDP AISL",
  "A-Level Math",
  "A-Level Further Math",
];

export function CoursesCovered({
  items = DEFAULT_COURSES,
  title = "Courses covered",
  className = "",
}: CoursesCoveredProps) {
  return (
    <div className={`mt-8 ${className}`}>
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((c) => {
          const isIB = c.startsWith("IBDP");
          return isIB ? (
            // Highlighted IB chip: gradient ring
            <span
              key={c}
              className="inline-flex rounded-md bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 p-[1px]"
            >
              <span className="inline-flex items-center gap-2 rounded-[5px] bg-white px-2.5 py-1 text-xs font-medium text-neutral-800">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                {c}
              </span>
            </span>
          ) : (
            // Default chip
            <span
              key={c}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              {c}
            </span>
          );
        })}
      </div>
    </div>
  );
}
