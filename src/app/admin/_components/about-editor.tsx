// app/admin/_components/about-editor.tsx
"use client";

import { useState } from "react";
import type { FieldConfig } from "../_lib/fields";
import {
  ABOUT_HEADER_FIELDS,
  ABOUT_HERO_FIELDS,
  ABOUT_STATS_COURSES_FIELDS,
  ABOUT_CTA_FIELDS,
} from "../_lib/about-fields";
import { getByPath, setByPath } from "../_lib/json-path";

type SubTab = "header" | "hero" | "statsCourses" | "cta";

type AboutEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function AboutEditor<T extends object>({
  data,
  onChangeData,
}: AboutEditorProps<T>) {
  const [activeTab, setActiveTab] = useState<SubTab>("header");

  let fields: FieldConfig[] = ABOUT_HEADER_FIELDS;
  let panelTitle = "About – section header";
  let panelDescription =
    "Edit the eyebrow, title, subtitle, chips, and right-hand summary card.";

  if (activeTab === "hero") {
    fields = ABOUT_HERO_FIELDS;
    panelTitle = "About – hero image & cards";
    panelDescription =
      "Edit the horizontal hero image, lower eyebrow, and the two cards overlapping the image.";
  } else if (activeTab === "statsCourses") {
    fields = ABOUT_STATS_COURSES_FIELDS;
    panelTitle = "About – stats & courses";
    panelDescription =
      "Edit the stats pills and the list of courses covered by WSMath.";
  } else if (activeTab === "cta") {
    fields = ABOUT_CTA_FIELDS;
    panelTitle = "About – CTA ribbon";
    panelDescription =
      "Edit the CTA ribbon heading and subheading shown under the About section.";
  }

  const handleChange = (field: FieldConfig, rawValue: string) => {
    const next = structuredClone(data) as T;

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

    // string[]
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

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-neutral-900">About</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Edit the About header, hero image band, stats, courses, and CTA ribbon
        in separate tabs.
      </p>

      {/* Sub-tabs inside About editor */}
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
          onClick={() => setActiveTab("hero")}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "hero"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Hero image & cards
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("statsCourses")}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "statsCourses"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Stats & courses
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
          CTA ribbon
        </button>
      </div>

      {/* Active tab panel – 2-column layout */}
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {panelTitle}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              {panelDescription}
            </p>
          </div>
          <p className="text-[11px] text-neutral-400">
            Backed by{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5">
              src/app/_lib/content/json/about.json
            </code>
          </p>
        </div>

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
      </div>

      {/* JSON preview */}
      <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            JSON preview
          </h3>
          <p className="text-[11px] text-neutral-500">
            This is the full <code>about.json</code> as it will be saved.
          </p>
        </div>
        <pre className="mt-3 max-h-80 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
