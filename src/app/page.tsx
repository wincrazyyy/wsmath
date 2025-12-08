// app/page.tsx
import { SmoothScroll } from "./_components/smooth-scroll";
import { BackgroundGlow } from "./_components/background-glow";
import { Nav } from "./_components/nav";
import { Hero } from "./_components/hero";
import { ProofPills } from "./_components/proof-pills";
import { About } from "./_components/about";
import { CtaRibbon } from "./_components/cta-ribbon";
import { PackagesSection } from "./_components/packages-section";
import { Testimonials } from "./_components/testimonials";
import { WhatsAppCta } from "./_components/whatsapp-cta";
import { SiteFooter } from "./_components/footer";
import { FloatingCta } from "./_components/floating-cta";

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
          <PackagesSection />
        </section>

        <section
          id="testimonials"
          className="container mx-auto max-w-5xl px-4 pb-16"
        >
          <Testimonials />
        </section>

        <section className="container mx-auto max-w-5xl px-4 pb-20">
          <WhatsAppCta />
        </section>

        <SiteFooter />
        <FloatingCta />
      </div>
    </main>
  );
}
