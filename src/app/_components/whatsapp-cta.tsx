// app/_components/whatsapp-cta.tsx
import Image from "next/image";
import miscContent from "@/app/_lib/content/misc.json";
import { WhatsAppButton } from "./whatsapp-button";

const { whatsappCta } = miscContent;

export function WhatsAppCta() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight">
            {whatsappCta.heading}
          </h2>
          <p className="mt-2 text-neutral-600">
            {whatsappCta.subheading}
          </p>

          {whatsappCta.bullets?.length > 0 && (
            <ul className="mt-4 grid gap-2 text-sm text-neutral-700">
              {whatsappCta.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
                  {bullet}
                </li>
              ))}
            </ul>
          )}

          {/* WhatsApp button (href now comes from WhatsAppButton defaults) */}
          <div className="mt-5">
            <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
          </div>

          {whatsappCta.note && (
            <p className="mt-2 text-xs text-neutral-500">
              {whatsappCta.note}
            </p>
          )}
        </div>

        <div className="relative shrink-0">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-violet-500/25 to-sky-400/20 blur-2xl" />
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 p-[2px] shadow-xl">
            <div className="rounded-[14px] bg-white p-5">
              <Image
                src={whatsappCta.logoSrc}
                alt="WSMath logo"
                width={160}
                height={160}
                className="h-20 w-20 md:h-32 md:w-32"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
