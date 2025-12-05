"use client";

import { useState } from "react";
import type { FieldConfig } from "../_lib/fields";
import { getByPath, setByPath } from "../_lib/json-path";

type JsonEditorProps<T extends object> = {
  title: string;
  description?: string;
  /** The JSON blob imported from the content file */
  initialData: T;
  /** Field definitions (paths + labels) */
  fields: FieldConfig[];
  /** Shown above the JSON preview for guidance */
  jsonFileHint?: string;
  /**
   * Optional slug used for saving via /api/update-content.
   * If not provided, we'll try to derive it from jsonFileHint
   * (e.g. "app/_lib/content/about.json" => "about").
   */
  slug?: string;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function JsonEditor<T extends object>({
  title,
  description,
  initialData,
  fields,
  jsonFileHint = "",
  slug,
}: JsonEditorProps<T>) {
  const [data, setData] = useState<T>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Resolve slug: prefer explicit prop, otherwise derive from jsonFileHint
  const resolvedSlug = (() => {
    if (slug) return slug;
    if (!jsonFileHint) return "";
    const parts = jsonFileHint.split("/");
    const last = parts[parts.length - 1] || "";
    return last.replace(/\.json$/i, "");
  })();

  const handleChange = (field: FieldConfig, rawValue: string) => {
    const next = structuredClone(data) as T;

    if (field.type === "string" || field.type === "textarea") {
      setByPath(next, field.path, rawValue);
    } else if (field.type === "string[]") {
      const arr = rawValue
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      setByPath(next, field.path, arr);
    }

    setData(next);
    // Reset save status when user edits again
    if (saveStatus !== "idle") {
      setSaveStatus("idle");
      setSaveError(null);
    }
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

  const handleSave = async () => {
    if (!resolvedSlug) {
      setSaveStatus("error");
      setSaveError(
        "No slug resolved. Provide a `slug` prop or a valid `jsonFileHint` like app/_lib/content/about.json."
      );
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");
    setSaveError(null);

    try {
      const resp = await fetch("/api/update-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: resolvedSlug,
          content: data,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        console.error("Save failed:", text);
        setSaveStatus("error");
        setSaveError(text || "Failed to save changes.");
      } else {
        setSaveStatus("success");
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setSaveError("Network or server error while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-neutral-600">{description}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {jsonFileHint && (
              <p className="text-[11px] text-neutral-500">
                Editing: <code>{jsonFileHint}</code>
              </p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !resolvedSlug}
              className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
            {saveStatus === "success" && (
              <p className="text-[11px] text-emerald-600">
                Saved. Cloudflare will redeploy with the new content shortly.
              </p>
            )}
            {saveStatus === "error" && (
              <p className="text-[11px] text-red-600">
                {saveError || "Failed to save changes."}
              </p>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="mt-8 grid gap-6">
          {fields.map((field) => (
            <section
              key={field.path}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    {field.label}
                  </h2>
                  {field.description && (
                    <p className="mt-1 text-xs text-neutral-600">
                      {field.description}
                    </p>
                  )}
                </div>
                <code className="rounded bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">
                  {field.path}
                </code>
              </div>

              <div className="mt-3">{renderFieldInput(field)}</div>
            </section>
          ))}
        </div>

        {/* JSON preview */}
        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              JSON preview
            </h2>
            {jsonFileHint && (
              <p className="text-[11px] text-neutral-500">
                Live edits are saved to <code>{jsonFileHint}</code> via
                <code> /api/update-content</code>.
              </p>
            )}
          </div>
          <pre className="mt-3 max-h-80 overflow-auto bg-neutral-900 p-3 text-[0.75rem] leading-relaxed text-neutral-50">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
