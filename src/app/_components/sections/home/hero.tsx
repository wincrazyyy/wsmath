// app/_components/sections/home/hero.tsx
import Image from "next/image";
import homeContent from "@/app/_lib/content/json/home.json";
import { WhatsAppButton } from "../../ui/whatsapp-button";

const hero = homeContent.hero;

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      {/* subtle grid + spotlight */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.06)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute -top-32 left-1/2 h-[48rem] w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-sky-400/20 blur-3xl [mask-image:radial-gradient(ellipse_at_center,black,transparent_55%)]" />
      </div>

      {/* Content */}
      <div className="relative grid grid-cols-1 place-items-center gap-10 px-8 py-16 sm:px-12 md:px-16 md:py-24 lg:grid-cols-2 lg:items-center">
        {/* Image */}
        <div className="relative order-1 mx-auto w-full aspect-[4/3] overflow-hidden rounded-2xl sm:max-w-[560px] md:max-w-[520px] lg:order-2 lg:mx-0 lg:max-w-none lg:aspect-[5/4]">
          <Image
            src={hero.imageSrc}
            alt="WSMath hero"
            fill
            priority
            className="object-contain object-top lg:object-cover"
            sizes="(min-width: 1024px) 48vw, (min-width: 768px) 70vw, 100vw"
          />
        </div>

        {/* Text */}
        <div className="order-2 max-w-xl text-center lg:order-1 lg:text-left">
          <h1 className="text-5xl font-extrabold leading-none tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">
              {hero.title}
            </span>
          </h1>
          <p className="mt-4 text-lg text-neutral-700 md:text-2xl">
            {hero.subtitle}
          </p>
          <p className="mt-2 text-sm text-neutral-600 md:text-base">
            {hero.tagline}
          </p>

          <div className="mt-5">
            <WhatsAppButton width={220} height={56} imgClassName="h-14 w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
