// app/_components/layout/footer.tsx
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
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 bg-neutral-50">
                <span className="text-sm font-semibold text-neutral-900">
                  WS
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">WSMath</p>
                <p className="text-xs text-neutral-500">
                  Premium online math coaching
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
          {/* WSMath watermark (primary) */}
          <div className="text-sm">
            <p className="font-semibold text-neutral-900">
              © {year} WSMath. All rights reserved.
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              WSMath is a premium tutoring brand. Results vary by student
              commitment and starting level.
            </p>
          </div>

          {/* XiniDev watermark (secondary but clear) */}
          <div className="text-xs text-neutral-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">
              <span className="font-medium text-neutral-700">Built by</span>
              <span className="font-semibold text-neutral-900">XiniDev</span>
              <span className="text-neutral-400" aria-hidden>
                •
              </span>
              <span>Next.js + Tailwind</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
