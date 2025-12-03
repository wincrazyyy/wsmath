// app/_components/cta-ribbon.tsx
import { WhatsAppButton } from "./whatsapp-button";
import aboutContent from "@/app/_lib/content/about.json";

export function CtaRibbon() {
  const { ctaRibbon } = aboutContent;
  const heading =
    ctaRibbon?.heading ??
    "Limited 1:1 slots — start boosting IBDP results now";
  const subheading =
    ctaRibbon?.subheading ??
    "Premium, outcomes-driven coaching for AAHL/AISL/AASL/AIHL.";

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      <div className="relative isolate px-6 py-8 sm:px-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 opacity-[0.08]" />
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
          {heading}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">{subheading}</p>

        <div className="mt-5">
          <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
        </div>
      </div>
    </section>
  );
}
