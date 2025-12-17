// app/page.tsx
import { SmoothScroll } from "@/app/_components/ui/smooth-scroll";
import { BackgroundGlow } from "@/app/_components/layout/background-glow";
import { Nav } from "@/app/_components/layout/nav";
import { Home } from "./_components/sections/home/home";
import { About } from "@/app/_components/sections/about/about";
import { Packages } from "@/app/_components/sections/packages/packages";
import { Testimonials } from "@/app/_components/sections/testimonials/testimonials";
import { Results } from "@/app/_components/sections/results/results";
import { SiteFooter } from "@/app/_components/layout/footer";
import { FloatingCta } from "@/app/_components/ui/floating-cta";

export default function Page() {
  return (
    <main className="min-h-dvh bg-white text-neutral-900 antialiased">
      <SmoothScroll />
      <BackgroundGlow />
      <div className="relative z-10">
        <header className="container mx-auto max-w-5xl px-4">
          <Nav />
        </header>

        <section className="container mx-auto max-w-5xl px-4 pt-6" id="content">
          <Home />
        </section>

        <section id="about" className="container mx-auto max-w-5xl px-4 py-4">
          <About />
        </section>

        <section
          id="packages"
          className="container mx-auto max-w-5xl px-4 py-4"
        >
          <Packages />
        </section>

        <section
          id="testimonials"
          className="container mx-auto max-w-5xl px-4 py-6"
        >
          <Testimonials />
        </section>

        <section
          id="results"
          className="container mx-auto max-w-5xl px-4 pb-16"
        >
          <Results />
        </section>

        <SiteFooter />
        <FloatingCta />
      </div>
    </main>
  );
}
