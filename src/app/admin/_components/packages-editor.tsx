// app/admin/_components/packages-editor.tsx
"use client";

import { useState } from "react";
import type { FieldConfig } from "../_lib/fields";
import { PACKAGES_FIELDS } from "../_lib/packages-fields";
import { getByPath, setByPath } from "../_lib/json-path";

type SubTab = "header" | "comparison" | "private" | "group";

type PackagesEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function PackagesEditor<T extends object>({
  data,
  onChangeData,
}: PackagesEditorProps<T>) {
  const [activeTab, setActiveTab] = useState<SubTab>("header");

  // Pick fields + panel copy based on active tab (same pattern as AboutEditor)
  let fields: FieldConfig[] = PACKAGES_FIELDS.filter((f) =>
    f.path.startsWith("header.")
  );
  let panelTitle = "Packages – section header";
  let panelDescription =
    "Edit the eyebrow, title, subtitle, chips, and right-hand summary card for the packages section.";

  if (activeTab === "comparison") {
    fields = PACKAGES_FIELDS.filter((f) =>
      f.path.startsWith("comparison.")
    );
    panelTitle = "Packages – comparison strip";
    panelDescription =
      "Edit the labels and copy for the pricing comparison strip between 1-to-1 and group.";
  } else if (activeTab === "private") {
    fields = PACKAGES_FIELDS.filter((f) =>
      f.path.startsWith("private.")
    );
    panelTitle = "Packages – private 1-to-1 package";
    panelDescription =
      "Edit the private coaching card: badge, rate, description, bullet points, and the intensive 8-lesson block.";
  } else if (activeTab === "group") {
    fields = PACKAGES_FIELDS.filter((f) =>
      f.path.startsWith("group.")
    );
    panelTitle = "Packages – group package & leaflet";
    panelDescription =
      "Edit the group course card and the leaflet preview (pages and auto-advance timing).";
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
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      );
    }

    if (field.type === "textarea") {
      const value = typeof raw === "string" ? raw : "";
      return (
        <textarea
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
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
        className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        rows={5}
        value={arr.join("\n")}
        onChange={(e) => handleChange(field, e.target.value)}
      />
    );
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        Course options &amp; pricing
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        Edit the packages header, comparison strip, premium 1-to-1 package, and
        group course (including the leaflet preview) in separate tabs.
      </p>

      {/* Sub-tabs inside Packages (mirrors AboutEditor style) */}
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
          onClick={() => setActiveTab("comparison")}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "comparison"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Comparison strip
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("private")}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "private"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Private package (1-to-1)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("group")}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "group"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Group package & leaflet
        </button>
      </div>

      {/* Active tab panel – 2-column layout, like AboutEditor */}
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
              src/app/_lib/content/json/packages.json
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
            This is the full <code>packages.json</code> as it will be saved.
          </p>
        </div>
        <pre className="mt-3 max-h-80 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
