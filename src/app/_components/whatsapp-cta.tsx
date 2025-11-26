// app/_components/whatsapp-cta.tsx
import Image from "next/image";
import { WhatsAppButton } from "./whatsapp-button";

export function WhatsAppCta() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight">Start your IBDP Math coaching</h2>
          <p className="mt-2 text-neutral-600">
            Premium 1-to-1 Zoom lessons with iPad + Apple&nbsp;Pencil + GoodNotes. Outcome-driven plans.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              50%+ Level&nbsp;7 track record
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              17,000+ hours • 200+ students
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600" />
              AAHL / AASL / AIHL / AISL
            </li>
          </ul>

          {/* WhatsApp button */}
          <div className="mt-5">
            <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
          </div>

          <p className="mt-2 text-xs text-neutral-500">
            Fast replies. Share course (AAHL/AISL/etc.) and target score to get started.
          </p>
        </div>

        <div className="relative shrink-0">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-violet-500/25 to-sky-400/20 blur-2xl" />
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 p-[2px] shadow-xl">
            <div className="rounded-[14px] bg-white p-5">
              <Image src="/icon.svg" alt="WSMath logo" width={160} height={160} className="h-20 w-20 md:h-32 md:w-32" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
