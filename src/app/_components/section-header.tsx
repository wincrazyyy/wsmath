interface SectionHeaderProps {
  title: string;
  subtitle: string;
  topBadge?: string;
}

export function SectionHeader({ title, subtitle, topBadge }: SectionHeaderProps) {
  return (
    <>
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-600 md:text-base">
            {subtitle}
          </p>
        </div>
        {topBadge && (
          <div className="hidden md:block">
            <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-50">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              {topBadge}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
    </>
  );
}
