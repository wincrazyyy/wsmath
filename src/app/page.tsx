// app/page.tsx
import { SmoothScroll } from "./_components/ui/smooth-scroll";
import { BackgroundGlow } from "./_components/layout/background-glow";
import { Nav } from "./_components/layout/nav";
import { Hero } from "./_components/sections/home/hero";
import { ProofPills } from "./_components/sections/home/proof-pills";
import { About } from "./_components/sections/about/about";
import { CtaRibbon } from "./_components/sections/about/cta-ribbon";
import { Packages } from "./_components/sections/packages/packages";
import { Testimonials } from "./_components/sections/testimonials/testimonials";
import { SiteFooter } from "./_components/layout/footer";
import { FloatingCta } from "./_components/ui/floating-cta";

export default function Home() {
  return (
    <main className="min-h-dvh bg-white text-neutral-900 antialiased">
      <SmoothScroll />
      <BackgroundGlow />
      <div className="relative z-10">
        <header className="container mx-auto max-w-5xl px-4">
          <Nav />
        </header>

        <section className="container mx-auto max-w-5xl px-4 pt-6" id="content">
          <Hero />
          <ProofPills />
        </section>

        <section id="about" className="container mx-auto max-w-5xl px-4 py-4">
          <About />
          <CtaRibbon />
        </section>

        {/* New packages section */}
        <section
          id="packages"
          className="container mx-auto max-w-5xl px-4 pb-6"
        >
          <Packages />
        </section>

        <section
          id="testimonials"
          className="container mx-auto max-w-5xl px-4 pb-16"
        >
          <Testimonials />
        </section>

        <SiteFooter />
        <FloatingCta />
      </div>
    </main>
  );
}
