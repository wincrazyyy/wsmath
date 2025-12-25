// app/_components/sections/about/cta-ribbon.tsx
import aboutContent from "@/app/_lib/content/json/about.json";
import styles from "./cta-ribbon.module.css";

export function CtaRibbon() {
  const { ctaRibbon } = aboutContent;

  const heading = ctaRibbon.heading;
  const subheading = ctaRibbon.subheading;

  return (
    <section
      className={[
        styles.outer,
        "mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white",
      ].join(" ")}
    >
      <div
        className={[
          styles.inner,
          "relative isolate px-6 py-5 sm:px-10 sm:py-6",
        ].join(" ")}
      >
        {/* soft banner wash */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 opacity-[0.08]" />

        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
            {heading}
          </h2>
          <p className="text-sm text-neutral-600">{subheading}</p>
        </div>
      </div>
    </section>
  );
}
