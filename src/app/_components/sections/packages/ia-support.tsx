"use client";

type Topic = { title: string; desc: string };

const LESSON_STRUCTURE: string[] = [
  "Customizes IA topics to align with individual student interests",
  "Integrates knowledge beyond standard curriculum for enhanced grades",
  "Guides students to produce high-quality, unique essays efficiently within lesson time",
  "Achieved successful outcomes for over 60 students from 2020 to 2024",
  "Effectively boosts Predicted Grades and makes a positive impression on teachers",
  "Minimized the need for extra work outside of lessons",
];

const IA_TOPICS: Topic[] = [
  {
    title: "Ancient Math in Modern Times",
    desc: "Uncover how modern techniques breathe new life into solving ancient mathematical puzzles",
  },
  {
    title: "Sports and Mathematics",
    desc: "Explore the relationship between athletic performance and mathematical principles, like optimizing sports equipment",
  },
  {
    title: "Environmental Math",
    desc: "Tackle environmental challenges and natural phenomena with insightful mathematical analysis",
  },
  {
    title: "Mathematics in Society",
    desc: "Explore socio-economic issues through mathematical methodologies, understanding the world in numbers",
  },
  {
    title: "Geometry in Everyday Life",
    desc: "Investigate common objects through a mathematical lens, revealing hidden geometrical wonders",
  },
  {
    title: "Artistic Math",
    desc: "Unleash creativity through mathematical patterns and designs, blending art with equations",
  },
  {
    title: "Astronomy and Mathematics",
    desc: "Delve into the celestial realm, using math to model the complex interactions of planets and stars",
  },
  {
    title: "Practical Problem-Solving",
    desc: "Apply math to everyday scenarios, from game strategies to efficient division of resources",
  },
  {
    title: "Math in Engineering",
    desc: "From designing roller coasters to solving structural problems, discover the application of math in engineering",
  },
];

export function IaSupport() {
  return (
    <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            IA Guidance
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">
            Math IA Support
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">
            A structured, topic-driven guidance format to help students produce a clear,
            original IA efficiently.
          </p>
        </div>

        <a
          href="#"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
        >
          Ask about IA support
        </a>
      </div>

      {/* Top -> bottom layout */}
      <div className="mt-6 space-y-6">
        {/* Lesson structure (top) */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-sm font-semibold text-neutral-900">Lesson structure</div>
          <ul className="mt-3 space-y-2">
            {LESSON_STRUCTURE.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-neutral-700">
                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Topics (bottom) */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-sm font-semibold text-neutral-900">
            Available topic directions
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {IA_TOPICS.map((t) => (
              <div key={t.title} className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="text-sm font-semibold text-neutral-900">{t.title}</div>
                <div className="mt-1 text-xs text-neutral-600">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage note */}
      <p className="mt-4 text-xs text-neutral-500">
        Covered in Solo 1-to-1 lessons (no separate IA package required).
      </p>
    </div>
  );
}
