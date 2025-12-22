import Image from "next/image";
import miscContent from "@/app/_lib/content/json/misc.json";
import type { MiscConfig } from "@/app/_lib/content/types/misc.types";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { footer } = miscContent as MiscConfig;

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
                <Image
                  src={footer.brand.iconSrc}
                  alt="WSMath"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                  priority={false}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {footer.brand.name}
                </p>
                <p className="text-xs text-neutral-500">{footer.brand.tagline}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              {footer.brand.description}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600">
              <span className="font-medium text-neutral-900">{footer.brand.name}</span>
              <span aria-hidden>•</span>
              <a
                href={footer.brand.backToTop.href}
                className="transition hover:text-neutral-900"
              >
                {footer.brand.backToTop.label}
              </a>
            </div>
          </div>

          {/* Columns */}
          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-neutral-900">{col.title}</p>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}`}>
                    <a
                      href={l.href}
                      className="text-neutral-600 transition hover:text-neutral-900"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA */}
          <div>
            <p className="text-sm font-semibold text-neutral-900">{footer.cta.title}</p>
            <p className="mt-4 text-sm text-neutral-600">{footer.cta.body}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={footer.cta.primary.href}
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {footer.cta.primary.label}
              </a>
              <a
                href={footer.cta.secondary.href}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                {footer.cta.secondary.label}
              </a>
            </div>

            <div className="mt-5 space-y-2 text-xs text-neutral-500">
              {footer.cta.meta.map((m) => (
                <p key={m.label}>
                  <span className="font-medium text-neutral-700">{m.label}</span>{" "}
                  {m.value}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold text-neutral-900">
              © {year} {footer.brand.name}. {footer.bottom.wsmath.rights}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {footer.bottom.wsmath.disclaimer}
            </p>
          </div>

          <div className="text-xs text-neutral-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">
              <span className="font-medium text-neutral-700">
                {footer.bottom.builder.label}
              </span>

              <a
                href={footer.bottom.builder.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-900 transition hover:underline"
              >
                {footer.bottom.builder.name}
              </a>

              <span className="text-neutral-400" aria-hidden>
                •
              </span>

              <span>{footer.bottom.builder.stack}</span>

              <span className="text-neutral-300" aria-hidden>
                |
              </span>

              <a
                href={footer.bottom.builder.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${footer.bottom.builder.name} on GitHub`}
                title={`${footer.bottom.builder.name} on GitHub`}
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
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2C6.477 2 2 6.56 2 12.196c0 4.514 2.865 8.34 6.84 9.694.5.096.682-.22.682-.49 0-.24-.008-.88-.013-1.726-2.782.622-3.369-1.37-3.369-1.37-.455-1.173-1.11-1.486-1.11-1.486-.908-.637.069-.624.069-.624 1.004.072 1.532 1.053 1.532 1.053.892 1.557 2.34 1.107 2.91.846.09-.66.35-1.11.636-1.365-2.22-.26-4.555-1.134-4.555-5.045 0-1.114.39-2.025 1.03-2.739-.103-.26-.446-1.31.098-2.73 0 0 .84-.274 2.75 1.046A9.35 9.35 0 0 1 12 6.84c.85.004 1.705.118 2.505.345 1.909-1.32 2.748-1.046 2.748-1.046.546 1.42.203 2.47.1 2.73.64.714 1.028 1.625 1.028 2.739 0 3.922-2.338 4.782-4.566 5.036.359.315.678.936.678 1.887 0 1.362-.012 2.46-.012 2.796 0 .273.18.59.688.489C19.138 20.533 22 16.71 22 12.196 22 6.56 17.523 2 12 2z" />
    </svg>
  );
}
