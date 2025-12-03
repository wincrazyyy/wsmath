import Link from "next/link";

export default function AdminIndexPage() {
  return (
    <main className="mx-auto max-w-5xl px-4">
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
        Admin dashboard
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Choose a section to edit your site copy. Changes are reflected in the JSON preview for each page.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Link
          href="/admin/home"
          className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
        >
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Home content</h2>
            <p className="mt-1 text-xs text-neutral-600">
              Edit hero name, subtitle, tagline, and proof pills.
            </p>
          </div>
          <span className="mt-3 inline-flex items-center text-[11px] font-medium text-violet-600">
            Open editor
            <span className="ml-1 text-xs">↗</span>
          </span>
        </Link>

        <Link
          href="/admin/about"
          className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
        >
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">About section</h2>
            <p className="mt-1 text-xs text-neutral-600">
              Edit About lead, bullets, image, stats, and courses.
            </p>
          </div>
          <span className="mt-3 inline-flex items-center text-[11px] font-medium text-violet-600">
            Open editor
            <span className="ml-1 text-xs">↗</span>
          </span>
        </Link>

        <Link
          href="/admin/testimonials"
          className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
        >
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Testimonials</h2>
            <p className="mt-1 text-xs text-neutral-600">
              Manage featured and carousel testimonials.
            </p>
          </div>
          <span className="mt-3 inline-flex items-center text-[11px] font-medium text-violet-600">
            Open editor
            <span className="ml-1 text-xs">↗</span>
          </span>
        </Link>
      </div>
    </main>
  );
}
