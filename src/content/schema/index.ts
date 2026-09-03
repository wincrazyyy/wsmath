/**
 * The single source of truth for content types.
 *
 * Zod schemas here generate three things that can never drift from each other:
 *   1. the TypeScript types every section component is typed against,
 *   2. the runtime validation `src/lib/content.ts` runs at build time,
 *   3. `content.schema.json` at the repo root, which the editor renders
 *      as an editing form (editor contract §3.2).
 *
 * Keep it generic. The editor knows nothing about heroes or testimonials — it
 * renders whatever this schema declares.
 */
import { z } from "zod";

import {
  CourseGroups,
  Faqs,
  GradeScales,
  IaCourse,
  Packages,
  Programmes,
  Schools,
  Students,
  Testimonials,
  WhatsappPrefills,
} from "./collections";
import { Pages } from "./pages";
import { Settings } from "./settings";

export * from "./media";
export * from "./settings";
export * from "./collections";
export * from "./pages";

/**
 * One entry per JSON file in `src/content/`. The key is the property name used
 * everywhere in code; `file` is the name on disk.
 */
export const CONTENT_DOCUMENTS = {
  settings: { file: "settings.json", schema: Settings, title: "Settings" },
  pages: { file: "pages.json", schema: Pages, title: "Page copy" },
  gradeScales: { file: "grade-scales.json", schema: GradeScales, title: "Grade scales" },
  programmes: { file: "programmes.json", schema: Programmes, title: "Programmes" },
  students: { file: "students.json", schema: Students, title: "Students" },
  testimonials: { file: "testimonials.json", schema: Testimonials, title: "Testimonials" },
  packages: { file: "packages.json", schema: Packages, title: "Packages" },
  courseGroups: { file: "course-groups.json", schema: CourseGroups, title: "Course groups" },
  faqs: { file: "faqs.json", schema: Faqs, title: "FAQs" },
  schools: { file: "schools.json", schema: Schools, title: "Schools" },
  iaCourse: { file: "ia-course.json", schema: IaCourse, title: "Maths IA course" },
  whatsappPrefills: { file: "whatsapp-prefills.json", schema: WhatsappPrefills, title: "WhatsApp messages" },
} as const;

export type ContentDocumentKey = keyof typeof CONTENT_DOCUMENTS;

export const CONTENT_DOCUMENT_KEYS = Object.keys(CONTENT_DOCUMENTS) as readonly ContentDocumentKey[];

/**
 * The whole content set as one schema. Used to generate `content.schema.json`;
 * `parseContent` validates document by document so it can report which file is
 * at fault.
 */
export const SiteContentSchema = z
  .strictObject({
    settings: Settings,
    pages: Pages,
    gradeScales: GradeScales,
    programmes: Programmes,
    students: Students,
    testimonials: Testimonials,
    packages: Packages,
    courseGroups: CourseGroups,
    faqs: Faqs,
    schools: Schools,
    iaCourse: IaCourse,
    whatsappPrefills: WhatsappPrefills,
  })
  .meta({
    id: "WSMathContent",
    title: "WSMath content",
    description:
      "Every editable word, number and image on wsmath.com. One property per file in src/content/.",
  });

export type SiteContentShape = z.infer<typeof SiteContentSchema>;
