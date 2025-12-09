// app/admin/_components/testimonials-editor.tsx
"use client";

import { useMemo, useState } from "react";
import testimonialsContent from "@/app/_lib/content/json/testimonials.json";
import {
  TESTIMONIALS_FIELDS,
  TESTIMONIALS_HEADER_FIELDS,
} from "../_lib/testimonials-fields";
import type { FieldConfig } from "../_lib/fields";
import { getByPath, setByPath } from "../_lib/json-path";

type TestimonialsContent = typeof testimonialsContent;
type SubTab = "header" | "video" | "featured" | "carousel" | "cta";

type IndexFieldGroup = {
  index: number; // 0-based index
  fields: FieldConfig[]; // name / role / quote / avatar
};

function groupFieldsBySection(
  fields: FieldConfig[],
  section: "featured" | "carousel"
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

type TestimonialsEditorProps = {
  data: TestimonialsContent;
  onChangeData: (next: TestimonialsContent) => void;
};

export function TestimonialsEditor({
  data,
  onChangeData,
}: TestimonialsEditorProps) {
  const [activeTab, setActiveTab] = useState<SubTab>("header");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const headerFields = TESTIMONIALS_HEADER_FIELDS;

  const videoFields = useMemo(
    () => TESTIMONIALS_FIELDS.filter((f) => f.path.startsWith("video.")),
    []
  );

  const ctaFields = useMemo(
    () =>
      TESTIMONIALS_FIELDS.filter((f) =>
        f.path.startsWith("testimonialsCta.")
      ),
    []
  );

  const featuredGroups = useMemo(
    () => groupFieldsBySection(TESTIMONIALS_FIELDS, "featured"),
    []
  );
  const carouselGroups = useMemo(
    () => groupFieldsBySection(TESTIMONIALS_FIELDS, "carousel"),
    []
  );

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

    onChangeData(next);
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

  const renderFieldGrid = (fields: FieldConfig[]) => (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <section key={field.path} className="md:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-neutral-900">
                {field.label}
              </h4>
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
  );

  const isSlotsTab = activeTab === "featured" || activeTab === "carousel";

  const sectionLabel =
    activeTab === "featured"
      ? "Featured testimonial"
      : activeTab === "carousel"
      ? "Carousel testimonial"
      : "";

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        Testimonials
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        Edit the testimonials header, student voices video, featured
        testimonials, carousel strip, and the WhatsApp CTA box.
      </p>

      {/* Sub-tabs inside testimonials (match About/Packages naming) */}
      <div className="mt-6 inline-flex rounded-full border border-neutral-200 bg-white p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("header")}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "header"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Section header
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("video")}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "video"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Student voices video
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("featured");
            setActiveIndex(0);
          }}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "featured"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Featured (top section)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("carousel");
            setActiveIndex(0);
          }}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "carousel"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Carousel (scrolling strip)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cta")}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "cta"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Testimonials CTA box
        </button>
      </div>

      {/* HEADER tab – like About/Packages header panels */}
      {activeTab === "header" && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Testimonials – section header
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                Edit the eyebrow, title, and subtitle for the Testimonials
                section heading.
              </p>
            </div>
            <p className="text-[11px] text-neutral-400">
              Backed by{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5">
                src/app/_lib/content/json/testimonials.json
              </code>
            </p>
          </div>

          {renderFieldGrid(headerFields)}
        </div>
      )}

      {/* Video tab */}
      {activeTab === "video" && (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Student voices video
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                Controls the heading, description, and media paths for the
                video shown under the Testimonials section.
              </p>
            </div>
          </div>

          {renderFieldGrid(videoFields)}
        </div>
      )}

      {/* CTA tab */}
      {activeTab === "cta" && (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Testimonials CTA box
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                Controls the heading, bullets, note, and logo for the CTA box
                displayed under the testimonials section.
              </p>
            </div>
          </div>

          {renderFieldGrid(ctaFields)}
        </div>
      )}

      {/* Featured / Carousel tabs (slots) */}
      {isSlotsTab && (
        <>
          {/* Slot selector */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {activeTab === "featured"
                ? "Featured slots"
                : "Carousel slots"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(activeTab === "featured"
                ? featuredGroups
                : carouselGroups
              ).map(({ index }) => {
                const isActive = index === activeIndex;
                const label = index + 1;
                return (
                  <button
                    key={`${activeTab}-${index}`}
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

          {/* Active editor for that slot */}
          <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  {sectionLabel} #{activeIndex + 1}
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Fill in name, result, and quote. Leave all fields blank to
                  “disable” this slot.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {(activeTab === "featured"
                ? featuredGroups
                : carouselGroups
              )
                .find((g) => g.index === activeIndex)
                ?.fields.map((field) => (
                  <section key={field.path}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-900">
                          {field.label}
                        </h4>
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
                    <div className="mt-2">
                      {renderFieldInput(field)}
                    </div>
                  </section>
                ))}
            </div>
          </div>
        </>
      )}

      {/* JSON preview */}
      <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            JSON preview
          </h3>
          <p className="text-[11px] text-neutral-500">
            Backed by{" "}
            <code>src/app/_lib/content/testimonials.json</code>.
          </p>
        </div>
        <pre className="mt-3 max-h-80 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
