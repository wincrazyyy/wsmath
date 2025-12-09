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

export function CoursesCovered({
  items = DEFAULT_COURSES,
  title = "Courses covered",
  className = "",
}: CoursesCoveredProps) {
  return (
    <section className={`mt-8 ${className}`} aria-label={title}>
      <div className="flex items-center gap-3">
        <h3 className="text-[0.95rem] font-semibold text-neutral-900 md:text-base">
          {title}
        </h3>
        <div className="h-px w-10 rounded-full bg-neutral-200" />
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((c) => {
          const isIB = c.startsWith("IBDP");

          const dot = (
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
          );

          if (isIB) {
            return (
              <li
                key={c}
                className="inline-flex rounded-md bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 p-[1px]"
              >
                <span className="inline-flex items-center gap-2 rounded-[5px] bg-white px-2.5 py-1 text-xs font-medium text-neutral-800">
                  {dot}
                  {c}
                </span>
              </li>
            );
          }

          return (
            <li
              key={c}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700"
            >
              {dot}
              {c}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
