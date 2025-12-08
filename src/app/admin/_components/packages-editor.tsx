// app/admin/_components/packages-editor.tsx
"use client";

import { useMemo, useState } from "react";
import type { FieldConfig } from "../_lib/fields";
import { PACKAGES_FIELDS } from "../_lib/packages-fields";
import { getByPath, setByPath } from "../_lib/json-path";

type SubTab = "overview" | "private" | "group";

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
  const [activeTab, setActiveTab] = useState<SubTab>("overview");

  const overviewFields = useMemo(
    () =>
      PACKAGES_FIELDS.filter(
        (f) =>
          f.path === "title" ||
          f.path === "subtitle" ||
          f.path === "topBadge" ||
          f.path.startsWith("comparison.")
      ),
    []
  );

  const privateFields = useMemo(
    () => PACKAGES_FIELDS.filter((f) => f.path.startsWith("private.")),
    []
  );

  const groupFields = useMemo(
    () => PACKAGES_FIELDS.filter((f) => f.path.startsWith("group.")),
    []
  );

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

  const renderSection = (fields: FieldConfig[]) => (
    <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
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
  );

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        Course options &amp; pricing
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        Edit the section heading, comparison copy, 1-to-1 premium package,
        and group course (including leaflet pages).
      </p>

      {/* Sub-tabs inside Packages */}
      <div className="mt-6 inline-flex rounded-full border border-neutral-200 bg-white p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`rounded-full px-4 py-1.5 transition ${
            activeTab === "overview"
              ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
              : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Overview & comparison
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

      {activeTab === "overview" && renderSection(overviewFields)}
      {activeTab === "private" && renderSection(privateFields)}
      {activeTab === "group" && renderSection(groupFields)}

      {/* JSON preview */}
      <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            JSON preview
          </h3>
          <p className="text-[11px] text-neutral-500">
            Backed by <code>src/app/_lib/content/packages.json</code>.
          </p>
        </div>
        <pre className="mt-3 max-h-80 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
