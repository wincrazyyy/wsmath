// app/_components/sections/testimonials/testimonials.tsx
"use client";

import testimonialsContent from "@/app/_lib/content/json/testimonials.json";
import type {
  TestimonialsConfig,
  Testimonial,
} from "@/app/_lib/content/types/testimonials.types";

import { SectionHeader } from "../../ui/section/section-header";
import { StudentVoicesVideo } from "./student-voices-video";
import { FeaturedTestimonialsGrid } from "./featured-testimonials-grid";
import { TestimonialCarousel } from "./testimonial-carousel";
import { TestimonialsCta } from "./testimonials-cta";

export function Testimonials() {
  const data = testimonialsContent as TestimonialsConfig;

  const featured: Testimonial[] = data.featured ?? [];
  const carousel: Testimonial[] = data.carousel ?? [];

  return (
    <>
      <SectionHeader
        align="center"
        eyebrow={data.eyebrow}
        title={data.title}
        subtitle={data.subtitle}
      />

      <StudentVoicesVideo />

      {/* Featured grid */}
      {featured.length > 0 && (
        <FeaturedTestimonialsGrid items={featured} />
      )}

      {/* Carousel below featured */}
      {carousel.length > 0 && (
        <div className="mt-10">
          <TestimonialCarousel items={carousel} />
        </div>
      )}

      {/* CTA at the bottom */}
      <div className="container my-16 max-w-5xl">
        <TestimonialsCta />
      </div>
    </>
  );
}
