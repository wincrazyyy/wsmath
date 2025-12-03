import { SmoothScroll } from "./_components/smooth-scroll";
import { BackgroundGlow } from "./_components/background-glow";
import { Nav } from "./_components/nav";
import { Hero } from "./_components/hero";
import { ProofPills } from "./_components/proof-pills";
import { About } from "./_components/about";
import { Testimonials, type Testimonial } from "./_components/testimonials";
import { TestimonialCarousel } from "./_components/testimonial-carousel";
import { CtaRibbon } from "./_components/cta-ribbon";
import { WhatsAppCta } from "./_components/whatsapp-cta";
import { SiteFooter } from "./_components/footer";
import { FloatingCta } from "./_components/floating-cta";

const testimonials: Testimonial[] = [
  {
    name: "Yuki W.",
    role: "IBDP AAHL — Level 7",
    quote:
      "Winson’s targeted drills and weekly plans took me from a predicted 5 to a solid 7 before finals.",
    avatarSrc: "/avatars/yuki.jpg",
  },
  {
    name: "Alex L.",
    role: "A-Level Math & FM — A* A*",
    quote:
      "Crystal-clear exam strategies. I always knew exactly what to practice each week.",
    avatarSrc: "/avatars/alex.jpg",
  },
  {
    name: "Parent of Darren",
    role: "HKU Medicine (MBBS) admit",
    quote:
      "Professional, strict on pacing, and genuinely invested in outcomes. Worth every bit.",
    avatarSrc: "/avatars/parent-darren.jpg",
  },
  {
    name: "Sabrina C.",
    role: "IBDP AISL — 7",
    quote:
      "Online lessons with iPad + GoodNotes were more effective than any face-to-face class I tried.",
    avatarSrc: "/avatars/sabrina.jpg",
  },
  {
    name: "Bobby K.",
    role: "IBDP AASL — 7",
    quote:
      "I love the lessons Winson has to offer! The way he teaches is very easy to understand and he is always very patient with me.",
    avatarSrc: "/avatars/bobby.jpg",
  },
  {
    name: "Jonathan G.",
    role: "IBDP AAHL — 6",
    quote:
      "Winson helped me improve my math skills and gain confidence. His lessons are engaging and effective.",
    avatarSrc: "/avatars/jonathan.jpg",
  },
  {
    name: "James P.",
    role: "IBDP AASL — 6",
    quote:
      "Winson's teaching methods are exceptional. He breaks down complex concepts into simple, understandable parts.",
    avatarSrc: "/avatars/bobby.jpg",
  },
  {
    name: "Pauline S.",
    role: "A-Level Math & FM — A* A*",
    quote:
      "Winson is an amazing tutor! He is very patient and explains concepts clearly. I saw significant improvement in my grades.",
    avatarSrc: "/avatars/pauline.jpg",
  },
];
const featuredNames = new Set(["Yuki W.", "Pauline S.", "Parent of Darren", "James P."]);
const featured = testimonials.filter(t => featuredNames.has(t.name));
const carouselItems = testimonials.filter(t => !featuredNames.has(t.name));

export default function Home() {
  return (
    <main className="min-h-dvh bg-white text-neutral-900 antialiased">
      <SmoothScroll /> {/* enable smooth scrolling */}
      {/* gradient blobs sit below content but above white bg */}
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

        <section id="testimonials" className="container mx-auto max-w-5xl px-4 pb-16">
          <Testimonials items={featured} />
          {carouselItems.length > 0 && <TestimonialCarousel items={carouselItems} />}
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
