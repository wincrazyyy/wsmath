// app/_components/whatsapp-cta.tsx
import Image from "next/image";
import miscContent from "@/app/_lib/content/misc.json";
import { WhatsAppButton } from "./whatsapp-button";

const { whatsappCta } = miscContent;

export function WhatsAppCta() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* Left: text + button */}
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

          <div className="mt-5">
            <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
          </div>

          {whatsappCta.note && (
            <p className="mt-2 text-xs text-neutral-500">
              {whatsappCta.note}
            </p>
          )}
        </div>

        {/* Right: clean image only, shorter, cropped from top */}
        <div className="relative shrink-0 w-full max-w-xs md:max-w-sm lg:max-w-md">
          <div className="relative aspect-[8/5] overflow-hidden rounded-2xl">
            <Image
              src={whatsappCta.logoSrc}
              alt="WSMath visual"
              fill
              priority
              className="object-cover object-[0%_15%]"
              sizes="(min-width: 1024px) 280px, (min-width: 768px) 40vw, 80vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
