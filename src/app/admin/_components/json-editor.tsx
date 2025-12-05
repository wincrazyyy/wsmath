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
};

export function JsonEditor<T extends object>({
  title,
  description,
  initialData,
  fields,
  jsonFileHint = "",
}: JsonEditorProps<T>) {
  const [data, setData] = useState<T>(initialData);

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

    setData(next);
  };

  const renderFieldInput = (field: FieldConfig) => {
    const value = getByPath(data, field.path);

    if (field.type === "string") {
      return (
        <input
          type="text"
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          value={value ?? ""}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          rows={4}
          value={value ?? ""}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      );
    }

    // string[]
    return (
      <textarea
        className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        rows={5}
        value={(value as string[] | undefined)?.join("\n") ?? ""}
        onChange={(e) => handleChange(field, e.target.value)}
      />
    );
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-neutral-600">{description}</p>
        )}

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
                Copy into <code>{jsonFileHint}</code> or hook this to an API
                later.
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
