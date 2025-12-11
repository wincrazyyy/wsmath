// app/admin/_components/json-editor-image-single.tsx
"use client";

import { useState } from "react";
import type { FieldConfig } from "../_lib/fields";
import { getByPath, setByPath } from "../_lib/json-path";
import type { ImageUploadTarget } from "../_lib/image-upload-targets";
import { buildRepoPathFromPublic } from "../_lib/json-editor-helpers";
import { queueImageUpload } from "../_lib/pending-image-uploads";

type ImageUploadInputProps<T extends object> = {
  field: FieldConfig;
  target: ImageUploadTarget;
  data: T;
  onChangeData: (next: T) => void;
};

export function ImageUploadInput<T extends object>({
  field,
  target,
  data,
  onChangeData,
}: ImageUploadInputProps<T>) {
  const [status, setStatus] = useState<"idle" | "queued" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const raw = getByPath(data, field.path);
  const publicPath =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "";
  const repoPath = publicPath ? buildRepoPathFromPublic(publicPath) : "";

  const previewSrc = publicPath || "/placeholder.png"; // simple fallback

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend validation: PNG only
    const name = file.name.toLowerCase();
    const type = file.type;
    const looksLikePng =
      type === "image/png" || name.endsWith(".png");

    if (!looksLikePng) {
      setStatus("error");
      setError("Only PNG images (.png) are supported.");
      e.target.value = "";
      return;
    }

    if (!publicPath || !repoPath) {
      setStatus("error");
      setError(
        "JSON field for this image is empty or invalid. Please set a valid path like '/hero.png' in JSON.",
      );
      e.target.value = "";
      return;
    }

    // Queue the upload (no network call yet)
    queueImageUpload({
      repoPath,
      publicPath,
      file,
    });

    // Keep JSON path as-is (it already holds the public path)
    const next = structuredClone(data) as T;
    setByPath(next, field.path, publicPath);
    onChangeData(next);

    setStatus("queued");
    setError(null);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={field.label}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 text-xs text-neutral-600">
          <p className="font-medium text-neutral-800">
            JSON path:{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {field.path}
            </code>
          </p>
          <p className="mt-1 text-[11px] text-neutral-500">
            Current public path:{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {publicPath || "(not set)"}
            </code>
          </p>
          {target.note && (
            <p className="mt-1 text-[11px] text-neutral-500">
              {target.note}
            </p>
          )}
          <p className="mt-1 text-[11px] text-neutral-500">
            Selected file will be uploaded to{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {repoPath || "N/A"}
            </code>{" "}
            when you click <strong>Save</strong>.
          </p>
        </div>
      </div>

      {/* File input */}
      <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 hover:border-violet-300 hover:bg-violet-50">
        <input
          type="file"
          accept="image/png"
          className="hidden"
          onChange={handleFileChange}
        />
        {"Select PNG & queue upload"}
      </label>

      {/* Status */}
      {status === "queued" && (
        <p className="text-[11px] text-emerald-600">
          Image queued. Changes will be committed when you click Save.
        </p>
      )}
      {status === "error" && (
        <p className="text-[11px] text-red-600">
          {error || "Failed to queue image."}
        </p>
      )}
    </div>
  );
}
