// app/_lib/content/types/testimonials.types.ts

export type TestimonialsHeaderConfig = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export type Testimonial = {
  name: string;
  role?: string;
  university?: string;
  quote: string;
  avatarSrc?: string;
  useDefaultAvatar?: boolean;
};

export type StudentVoicesVideoConfig = {
  eyebrow: string;
  heading: string;
  subheading: string;
  src: string;
  poster: string;
};

export type TestimonialsConfig = {
  header: TestimonialsHeaderConfig;
  video: StudentVoicesVideoConfig;
  featured: Testimonial[];
  carousel: Testimonial[];
};
