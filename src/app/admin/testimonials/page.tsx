"use client";

import { useMemo, useState } from "react";
import testimonialsContent from "@/app/_lib/content/testimonials.json";
import { TESTIMONIALS_FIELDS } from "../_lib/testimonials-fields";
import type { FieldConfig } from "../_lib/fields";
import { getByPath, setByPath } from "../_lib/json-path";

type TestimonialsContent = typeof testimonialsContent;
type SectionKey = "featured" | "carousel";

type IndexFieldGroup = {
  index: number; // 0-based index
  fields: FieldConfig[]; // name / role / quote / avatar
};

function groupFieldsBySection(
  fields: FieldConfig[],
  section: SectionKey
): IndexFieldGroup[] {
  const filtered = fields.filter((f) => f.path.startsWith(`${section}[`));

  const map = new Map<number, FieldConfig[]>();

  for (const field of filtered) {
    const match = field.path.match(/\[(\d+)\]/);
    if (!match) continue;
    const idx = Number(match[1]);

    if (!map.has(idx)) map.set(idx, []);
    map.get(idx)!.push(field);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([index, fieldsForIndex]) => ({
      index,
      fields: fieldsForIndex.sort((a, b) => a.path.localeCompare(b.path)),
    }));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default function TestimonialsAdminPage() {
  const [data, setData] = useState<TestimonialsContent>(testimonialsContent);
  const [activeSection, setActiveSection] = useState<SectionKey>("featured");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const featuredGroups = useMemo(
    () => groupFieldsBySection(TESTIMONIALS_FIELDS, "featured"),
    []
  );
  const carouselGroups = useMemo(
    () => groupFieldsBySection(TESTIMONIALS_FIELDS, "carousel"),
    []
  );

  const currentGroups =
    activeSection === "featured" ? featuredGroups : carouselGroups;

  const handleChange = (field: FieldConfig, rawValue: string) => {
    const next = structuredClone(data) as TestimonialsContent;

    if (field.type === "string" || field.type === "textarea") {
      setByPath(next, field.path, rawValue);
    } else if (field.type === "string[]") {
      const arr = rawValue
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      setByPath(next, field.path, arr);
    }

    setData(next);
  };

  const renderFieldInput = (field: FieldConfig) => {
    const raw = getByPath(data, field.path);

    if (field.type === "string") {
      const value = typeof raw === "string" ? raw : "";
      return (
        <input
          type="text"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      );
    }

    if (field.type === "textarea") {
      const value = typeof raw === "string" ? raw : "";
      return (
        <textarea
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          rows={4}
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      );
    }

    const arr = toStringArray(raw);
    return (
      <textarea
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        rows={5}
        value={arr.join("\n")}
        onChange={(e) => handleChange(field, e.target.value)}
      />
    );
  };

  const sectionLabel =
    activeSection === "featured" ? "Featured testimonial" : "Carousel testimonial";

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Testimonials
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Edit featured testimonials (top of the page) and carousel testimonials
          (scrolling strip).
        </p>

        {/* Section tabs */}
        <div className="mt-6 inline-flex rounded-full border border-neutral-200 bg-white p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setActiveSection("featured");
              setActiveIndex(0);
            }}
            className={`rounded-full px-4 py-1.5 transition ${
              activeSection === "featured"
                ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Featured (top section)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSection("carousel");
              setActiveIndex(0);
            }}
            className={`rounded-full px-4 py-1.5 transition ${
              activeSection === "carousel"
                ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Carousel (scrolling strip)
          </button>
        </div>

        {/* Slot selector */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {activeSection === "featured" ? "Featured slots" : "Carousel slots"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {currentGroups.map(({ index }) => {
              const isActive = index === activeIndex;
              const label = index + 1;
              return (
                <button
                  key={`${activeSection}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border text-xs font-medium transition ${
                    isActive
                      ? "border-violet-500 bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active editor */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                {sectionLabel} #{activeIndex + 1}
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Fill in name, result, and quote. Leave all fields blank to
                “disable” this slot.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {currentGroups
              .find((g) => g.index === activeIndex)
              ?.fields.map((field) => (
                <section key={field.path}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-900">
                        {field.label}
                      </h3>
                      {field.description && (
                        <p className="mt-1 text-[11px] text-neutral-500">
                          {field.description}
                        </p>
                      )}
                    </div>
                    <code className="rounded bg-neutral-100 px-2 py-1 text-[10px] text-neutral-500">
                      {field.path}
                    </code>
                  </div>
                  <div className="mt-2">{renderFieldInput(field)}</div>
                </section>
              ))}
          </div>
        </div>

        {/* JSON preview */}
        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              JSON preview
            </h2>
            <p className="text-[11px] text-neutral-500">
              Copy into{" "}
              <code>app/_lib/content/testimonials.json</code> or hook this to an
              API later.
            </p>
          </div>
          <pre className="mt-3 max-h-80 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
