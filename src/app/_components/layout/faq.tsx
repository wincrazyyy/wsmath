// app/_components/sections/faq/faq.tsx
"use client";

const FAQS = [
  {
    q: "Who is WSMath for?",
    a: "IBDP (AA/AI SL/HL), A-Level/IAL, and IGCSE students who want a structured, exam-focused plan and measurable grade improvement.",
  },
  {
    q: "How are lessons run?",
    a: "Live Zoom lessons with active problem-solving. I teach the concept, then we apply it immediately using targeted past-paper questions and markscheme thinking. Homework is assigned after each lesson.",
  },
  {
    q: "How many hours per week do I need for a Level 6 / 7?",
    a: "As a baseline: Level 6 typically needs ~6 hours/week total (lessons + practice), and Level 7 ~7 hours/week. Your exact plan depends on your current level and timeline.",
  },
  {
    q: "Do you teach in English or Chinese?",
    a: "Lessons can be bilingual for understanding, but exam training is always English: questions, key terms, and written solutions are practised in the style required by the markscheme.",
  },
  {
    q: "What if my foundation is weak?",
    a: "That’s common. We rebuild fundamentals by topic first, then move to past papers once the basics are stable. You’ll also get a clear weekly practice plan.",
  },
  {
    q: "Do you offer trial lessons?",
    a: "Usually no — my teaching is a system (diagnosis → plan → practice → feedback loops), so a single lesson doesn’t represent the real experience or results.",
  },
  {
    q: "Group class vs 1-to-1 — what’s the difference?",
    a: "Group is the most cost-effective way to follow a full structure and routine. 1-to-1 is fully personalised with faster feedback and more targeted pacing.",
  },
  {
    q: "What do I need to prepare?",
    a: "iPad + Apple Pencil + GoodNotes is ideal for fast, interactive work. A stable internet connection and willingness to practise between lessons matter most.",
  },
];

export function Faq() {
  return (
    <>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-neutral-500">
              FAQ
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
              Questions parents and students ask most
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Clear expectations. Clear structure. Clear results.
            </p>
          </div>

          <div className="hidden sm:block h-10 w-10 rounded-full border border-neutral-200 bg-neutral-50" />
        </div>

        <div className="mt-6 space-y-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-neutral-200 bg-white px-4 py-3 open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-sm font-medium text-neutral-900">
                  {item.q}
                </span>
                <span className="text-neutral-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
