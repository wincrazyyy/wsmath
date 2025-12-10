// app/admin/_components/json-editor-image-multi.tsx
"use client";

import { useState } from "react";
import type { FieldConfig } from "../_lib/fields";
import { getByPath, setByPath } from "../_lib/json-path";
import type { ImageUploadTarget } from "../_lib/image-upload-targets";
import {
  toStringArray,
  normalizeDirPublic,
  getBasePath,
} from "../_lib/json-editor-helpers";

type MultiImageUploadInputProps<T extends object> = {
  field: FieldConfig;
  target: ImageUploadTarget;
  data: T;
  onChangeData: (next: T) => void;
};

export function MultiImageUploadInput<T extends object>({
  field,
  target,
  data,
  onChangeData,
}: MultiImageUploadInputProps<T>) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const rawPages = getByPath(data, field.path);
  const currentPages = toStringArray(rawPages);

  // Derive sibling JSON keys: pagesDir, pagesFormat
  const basePath = getBasePath(field.path);
  const pagesDirValue = getByPath(data, `${basePath}.pagesDir`);
  const pagesFormatValue = getByPath(data, `${basePath}.pagesFormat`);

  const dirPublic = normalizeDirPublic(pagesDirValue, "/leaflets");
  const dirRepo = `public${dirPublic}`;
  const baseFormat =
    typeof pagesFormatValue === "string" && pagesFormatValue.trim().length > 0
      ? pagesFormatValue.trim()
      : "";

  const handleFilesChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);

    // Frontend validation: all PNGs only
    const invalid = selectedFiles.filter((file) => {
      const name = file.name.toLowerCase();
      const type = file.type;
      const looksLikePng =
        type === "image/png" || name.endsWith(".png");
      return !looksLikePng;
    });

    if (invalid.length > 0) {
      setStatus("error");
      setError(
        `Only PNG images (.png) are supported. Invalid: ${invalid
          .map((f) => f.name)
          .join(", ")}`,
      );
      e.target.value = "";
      return;
    }

    if (!dirPublic || !dirRepo) {
      setStatus("error");
      setError(
        "pagesDir is not set correctly in JSON. Please set something like '/leaflets' before uploading.",
      );
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setStatus("idle");
    setError(null);

    try {
      const uploadedPublicPaths: string[] = [];

      // We preserve selection order; filenames follow pagesFormat if provided
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        let fileName: string;
        if (baseFormat) {
          // e.g. "group-leaflet-page-" + 1 + ".png"
          fileName = `${baseFormat}${i + 1}.png`;
        } else {
          // fallback: use original filename
          fileName = file.name;
        }

        const repoPath = `${dirRepo}/${fileName}`;
        const publicPath = `${dirPublic}/${fileName}`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("targetPath", repoPath);

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

        uploadedPublicPaths.push(publicPath);
      }

      const next = structuredClone(data) as T;
      setByPath(next, field.path, uploadedPublicPaths);
      onChangeData(next);

      setStatus("success");
    } catch (err) {
      console.error("Multi image upload error:", err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Unknown upload error.",
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {currentPages.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {currentPages.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="relative h-16 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${field.label} page ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-neutral-600">
        <p className="font-medium text-neutral-800">
          Current pages:{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
            {currentPages.length} file
            {currentPages.length === 1 ? "" : "s"}
          </code>
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">
          Folder (pagesDir):{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
            {dirPublic}
          </code>
        </p>
        {baseFormat && (
          <p className="mt-1 text-[11px] text-neutral-500">
            File format prefix (pagesFormat):{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {baseFormat}
            </code>
          </p>
        )}
        {target.note && (
          <p className="mt-1 text-[11px] text-neutral-500">
            {target.note}
          </p>
        )}
        <p className="mt-1 text-[11px] text-neutral-500">
          Uploading will overwrite the list at{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
            {field.path}
          </code>
          .
        </p>
      </div>

      {/* Multi-file input */}
      <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 hover:border-violet-300 hover:bg-violet-50">
        <input
          type="file"
          accept="image/png"
          multiple
          className="hidden"
          onChange={handleFilesChange}
          disabled={isUploading}
        />
        {isUploading ? "Uploading pages…" : "Upload & replace pages"}
      </label>

      {/* Status */}
      {status === "success" && (
        <p className="text-[11px] text-emerald-600">
          Pages uploaded and JSON updated.
        </p>
      )}
      {status === "error" && (
        <p className="text-[11px] text-red-600">
          {error || "Failed to upload images."}
        </p>
      )}
    </div>
  );
}
