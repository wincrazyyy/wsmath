// app/_lib/content/types/testimonials.types.ts

export type TestimonialsHeaderConfig = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export type Testimonial = {
  name: string;
  role?: string;
  quote: string;
  avatarSrc?: string;
};

export type StudentVoicesVideoConfig = {
  eyebrow: string;
  heading: string;
  subheading: string;
  src: string;
  poster: string;
};

export type TestimonialsCtaConfig = {
  heading: string;
  subheading: string;
  bullets: string[];
  note?: string;
  logoSrc: string;
};

export type TestimonialsConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  video: StudentVoicesVideoConfig;
  featured: Testimonial[];
  carousel: Testimonial[];
  testimonialsCta: TestimonialsCtaConfig;
};
