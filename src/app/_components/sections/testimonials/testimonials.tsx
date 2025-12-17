// src/app/_components/sections/testimonials/testimonials.tsx
"use client";

import testimonialsContent from "@/app/_lib/content/json/testimonials.json";
import type {
  TestimonialsConfig,
  Testimonial,
} from "@/app/_lib/content/types/testimonials.types";

import { SectionReveal } from "../../ui/section/section-reveal";

import { TestimonialsHeader } from "./testimonials-header";
import { StudentVoicesVideo } from "./student-voices-video";
import { FeaturedTestimonialsGrid } from "./featured-testimonials-grid";
import { TestimonialCarousel } from "./testimonial-carousel";

export function Testimonials() {
  const data = testimonialsContent as TestimonialsConfig;
  const {
    header,
    featured = [],
    carousel = [],
  } = data;

  return (
    <>
      <TestimonialsHeader header={header} />

      <SectionReveal>
        <StudentVoicesVideo />

        {featured.length > 0 && (
          <FeaturedTestimonialsGrid items={featured as Testimonial[]} />
        )}

        {carousel.length > 0 && (
          <div className="mt-8">
            <TestimonialCarousel items={carousel as Testimonial[]} />
          </div>
        )}
      </SectionReveal>
    </>
  );
}