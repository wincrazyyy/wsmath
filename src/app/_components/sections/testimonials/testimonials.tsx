// src/app/_components/sections/testimonials/testimonials.tsx
"use client";

import testimonialsContent from "@/app/_lib/content/json/testimonials.json";
import type {
  TestimonialsConfig,
  Testimonial,
} from "@/app/_lib/content/types/testimonials.types";

import { TestimonialsHeader } from "./testimonials-header";
import { StudentVoicesVideo } from "./student-voices-video";
import { FeaturedTestimonialsGrid } from "./featured-testimonials-grid";
import { TestimonialCarousel } from "./testimonial-carousel";
import { TestimonialsCta } from "./testimonials-cta";
import { GradeImprovementsSection } from "./grade-improvements-section";

export function Testimonials() {
  const data = testimonialsContent as TestimonialsConfig;
  const {
    eyebrow,
    title,
    subtitle,
    featured = [],
    carousel = [],
  } = data;

  const header = { eyebrow, title, subtitle };

  return (
    <>
      <TestimonialsHeader header={header} />

      <StudentVoicesVideo />

      {featured.length > 0 && (
        <FeaturedTestimonialsGrid items={featured as Testimonial[]} />
      )}

      {carousel.length > 0 && (
        <div className="mt-8">
          <TestimonialCarousel items={carousel as Testimonial[]} />
        </div>
      )}

      <div className="container mt-8 max-w-5xl space-y-10">
        <GradeImprovementsSection />
      </div>

      <div className="container my-16 max-w-5xl space-y-10">
        <TestimonialsCta />
      </div>
    </>
  );
}
