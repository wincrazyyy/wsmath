// app/_components/sections/about/about-stats.tsx

type AboutStatsProps = {
  stats: string[];
};

export function AboutStats({ stats }: AboutStatsProps) {
  if (!stats?.length) return null;

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {stats.map((t) => (
        <span
          key={t}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-sm sm:inline-flex sm:w-auto sm:justify-start"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
          {t}
        </span>
      ))}
    </div>
  );
}
