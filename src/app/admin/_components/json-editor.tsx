"use client";

import { useState } from "react";
import type { FieldConfig } from "../_lib/fields";
import { getByPath, setByPath } from "../_lib/json-path";
import {
  IMAGE_UPLOAD_TARGETS,
  type ImageUploadTarget,
} from "../_lib/image-upload-targets";

type JsonEditorProps<T extends object> = {
  title: string;
  description?: string;
  /** Current JSON value (controlled by parent) */
  data: T;
  /** Field definitions (paths + labels) */
  fields: FieldConfig[];
  /** Shown above the JSON preview for guidance */
  jsonFileHint?: string;
  /** Called whenever any field changes */
  onChangeData: (next: T) => void;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

// ---------------- Image upload input ----------------

type ImageUploadInputProps<T extends object> = {
  field: FieldConfig;
  target: ImageUploadTarget;
  data: T;
  onChangeData: (next: T) => void;
};

function ImageUploadInput<T extends object>({
  field,
  target,
  data,
  onChangeData,
}: ImageUploadInputProps<T>) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const raw = getByPath(data, field.path);
  const currentPublicPath =
    typeof raw === "string" && raw.trim().length > 0
      ? raw
      : target.publicPath;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus("idle");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetPath", target.targetPath);

      const resp = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const json = await resp.json().catch(() => null);
        const msg =
          json?.error || json?.detail || "Failed to upload image.";
        throw new Error(msg);
      }

      // Update JSON to use the known public path
      const next = structuredClone(data) as T;
      setByPath(next, field.path, target.publicPath);
      onChangeData(next);

      setStatus("success");
    } catch (err) {
      console.error("Image upload error:", err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Unknown upload error.",
      );
    } finally {
      setIsUploading(false);
      // Clear the input value so the same file can be re-selected
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPublicPath}
            alt={field.label}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 text-xs text-neutral-600">
          <p className="font-medium text-neutral-800">
            Current path:{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {target.publicPath}
            </code>
          </p>
          {target.note && (
            <p className="mt-1 text-[11px] text-neutral-500">
              {target.note}
            </p>
          )}
          <p className="mt-1 text-[11px] text-neutral-500">
            Uploading will replace{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {target.targetPath}
            </code>{" "}
            in the repo.
          </p>
        </div>
      </div>

      {/* File input */}
      <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 hover:border-violet-300 hover:bg-violet-50">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading ? "Uploading…" : "Upload & replace image"}
      </label>

      {/* Status */}
      {status === "success" && (
        <p className="text-[11px] text-emerald-600">
          Image uploaded. A new commit was created and the path is fixed to{" "}
          <code>{target.publicPath}</code>.
        </p>
      )}
      {status === "error" && (
        <p className="text-[11px] text-red-600">
          {error || "Failed to upload image."}
        </p>
      )}
    </div>
  );
}

// ---------------- Main editor ----------------

export function JsonEditor<T extends object>({
  title,
  description,
  data,
  fields,
  jsonFileHint = "",
  onChangeData,
}: JsonEditorProps<T>) {
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

    onChangeData(next);
  };

  const renderFieldInput = (field: FieldConfig) => {
    const uploadTarget = IMAGE_UPLOAD_TARGETS[field.path as string];

    // Special case: image-backed field – only allow upload, no free text
    if (uploadTarget) {
      return (
        <ImageUploadInput<T>
          field={field}
          target={uploadTarget}
          data={data}
          onChangeData={onChangeData}
        />
      );
    }

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
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      )}

      {/* Fields */}
      <div className="mt-6 grid gap-6">
        {fields.map((field) => (
          <section
            key={field.path}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  {field.label}
                </h3>
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
      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            JSON preview
          </h3>
          {jsonFileHint && (
            <p className="text-[11px] text-neutral-500">
              Backed by <code>{jsonFileHint}</code>
            </p>
          )}
        </div>
        <pre className="mt-3 max-h-80 overflow-auto bg-neutral-900 p-3 text-[0.75rem] leading-relaxed text-neutral-50">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
