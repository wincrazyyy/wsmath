// app/_components/layout/footer.tsx
import Image from "next/image";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              {/* Swap for WSMath logo */}
              <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
                <Image
                  src="/icon.svg"
                  alt="WSMath"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                  priority={false}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">WSMath</p>
                <p className="text-xs text-neutral-500">
                  International Mathematics Exam Strategist - 國際數學科考試軍師
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Results-driven tutoring for IBDP, A-Level, and IGCSE students.
              Structured learning, exam strategy, and measurable progress.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600">
              <span className="font-medium text-neutral-900">WSMath</span>
              <span aria-hidden>•</span>
              <a
                href="#content"
                className="transition hover:text-neutral-900"
              >
                Back to top
              </a>
            </div>
          </div>

          {/* Programs */}
          <div>
            <p className="text-sm font-semibold text-neutral-900">Programs</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href="#packages"
                  className="text-neutral-600 transition hover:text-neutral-900"
                >
                  1-to-1 Coaching
                </a>
              </li>
              <li>
                <a
                  href="#packages"
                  className="text-neutral-600 transition hover:text-neutral-900"
                >
                  Group Classes
                </a>
              </li>
              <li>
                <a
                  href="#results"
                  className="text-neutral-600 transition hover:text-neutral-900"
                >
                  Results & Case Studies
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-neutral-600 transition hover:text-neutral-900"
                >
                  Student Testimonials
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-sm font-semibold text-neutral-900">Resources</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href="#about"
                  className="text-neutral-600 transition hover:text-neutral-900"
                >
                  About WSMath
                </a>
              </li>
              <li>
                {/* placeholder section for now */}
                <a
                  href="#faq"
                  className="text-neutral-600 transition hover:text-neutral-900"
                >
                  FAQs
                </a>
              </li>
              <li>
                {/* placeholder section for now */}
                <a
                  href="#contact"
                  className="text-neutral-600 transition hover:text-neutral-900"
                >
                  Contact
                </a>
              </li>
              <li>
                {/* placeholder section for now */}
                <a
                  href="#privacy"
                  className="text-neutral-600 transition hover:text-neutral-900"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact / CTA */}
          <div>
            <p className="text-sm font-semibold text-neutral-900">Get in touch</p>
            <p className="mt-4 text-sm text-neutral-600">
              For availability, pricing, and course placement, reach out to
              schedule an initial consultation.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Enquire now
              </a>
              <a
                href="#packages"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                View packages
              </a>
            </div>

            <div className="mt-5 space-y-2 text-xs text-neutral-500">
              <p>
                <span className="font-medium text-neutral-700">Time zone:</span>{" "}
                Hong Kong / Global online
              </p>
              <p>
                <span className="font-medium text-neutral-700">Platform:</span>{" "}
                Zoom · iPad + Apple Pencil recommended
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/* WSMath watermark */}
          <div className="text-sm">
            <p className="font-semibold text-neutral-900">
              © {year} WSMath. All rights reserved.
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              WSMath is a premium tutoring brand. Results vary by student
              commitment and starting level.
            </p>
          </div>

          {/* XiniDev watermark */}
          <div className="text-xs text-neutral-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">
              <span className="font-medium text-neutral-700">Built by</span>
              <a
                href="https://xini.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-900 transition hover:underline"
              >
                XiniDev
              </a>

              <span className="text-neutral-400" aria-hidden>
                •
              </span>

              <span>Next.js + Tailwind</span>

              <span className="text-neutral-300" aria-hidden>
                |
              </span>

              <a
                href="https://github.com/XiniDev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="XiniDev on GitHub"
                title="XiniDev on GitHub"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2C6.477 2 2 6.56 2 12.196c0 4.514 2.865 8.34 6.84 9.694.5.096.682-.22.682-.49 0-.24-.008-.88-.013-1.726-2.782.622-3.369-1.37-3.369-1.37-.455-1.173-1.11-1.486-1.11-1.486-.908-.637.069-.624.069-.624 1.004.072 1.532 1.053 1.532 1.053.892 1.557 2.34 1.107 2.91.846.09-.66.35-1.11.636-1.365-2.22-.26-4.555-1.134-4.555-5.045 0-1.114.39-2.025 1.03-2.739-.103-.26-.446-1.31.098-2.73 0 0 .84-.274 2.75 1.046A9.35 9.35 0 0 1 12 6.84c.85.004 1.705.118 2.505.345 1.909-1.32 2.748-1.046 2.748-1.046.546 1.42.203 2.47.1 2.73.64.714 1.028 1.625 1.028 2.739 0 3.922-2.338 4.782-4.566 5.036.359.315.678.936.678 1.887 0 1.362-.012 2.46-.012 2.796 0 .273.18.59.688.489C19.138 20.533 22 16.71 22 12.196 22 6.56 17.523 2 12 2z" />
    </svg>
  );
}
