// app/admin/_components/editors/json-editor-image-single.tsx
"use client";

import { useState } from "react";
import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { getByPath, setByPath } from "@/app/admin/_lib/json-path";
import type { ImageUploadTarget } from "@/app/admin/_lib/image-upload-targets";
import { buildRepoPathFromPublic } from "@/app/admin/_lib/json-editor-helpers";
import {
  queueImageUpload,
  getPreviewUrlForPublicPath,
} from "@/app/admin/_lib/pending-image-uploads";

type ImageUploadInputProps<T extends object> = {
  field: FieldConfig;
  target: ImageUploadTarget;
  data: T;
  onChangeData: (next: T) => void;
  forcedPublicPath?: string; // e.g. "/avatars/carousel-3.png"
  forcedFileName?: string;   // e.g. "carousel-3.png"
};

export function ImageUploadInput<T extends object>({
  field,
  target,
  data,
  onChangeData,
  forcedPublicPath,
  forcedFileName,
}: ImageUploadInputProps<T>) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const raw = getByPath(data, field.path);
  const jsonPublicPath =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "";

  const targetPublicPath = (forcedPublicPath ?? jsonPublicPath).trim();

  const repoPath = targetPublicPath
    ? buildRepoPathFromPublic(targetPublicPath)
    : "";

  const queuedPreview = targetPublicPath
    ? getPreviewUrlForPublicPath(targetPublicPath)
    : null;

  const previewSrc = queuedPreview || targetPublicPath || "/placeholder.png";

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

    if (!targetPublicPath || !repoPath) {
      setStatus("error");
      setError(
        "This image field has no target path. Set a JSON value (e.g. '/hero.png') or provide a forcedPublicPath for indexed fields.",
      );
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setStatus("idle");
    setError(null);

    try {
      // If forcedFileName is provided, rename the uploaded file to match
      const finalFile =
        forcedFileName && forcedFileName.trim().length > 0
          ? new File([file], forcedFileName, { type: file.type })
          : file;

      // 1) Update JSON state to the *targetPublicPath*
      const next = structuredClone(data) as T;
      setByPath(next, field.path, targetPublicPath);
      onChangeData(next);

      // 2) Queue image for save-all
      queueImageUpload({
        repoPath,
        publicPath: targetPublicPath,
        file: finalFile,
      });

      setStatus("success");
    } catch (err) {
      console.error("Image upload queue error:", err);
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
            Target public path:{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {targetPublicPath || "(not set)"}
            </code>
          </p>
          {target.note && (
            <p className="mt-1 text-[11px] text-neutral-500">
              {target.note}
            </p>
          )}
          <p className="mt-1 text-[11px] text-neutral-500">
            On save, this will overwrite file at{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
              {repoPath || "N/A"}
            </code>{" "}
            in the repo.
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
          disabled={isUploading}
        />
        {isUploading ? "Preparing image…" : "Choose image (PNG)"}
      </label>

      {/* Status */}
      {status === "success" && (
        <p className="text-[11px] text-emerald-600">
          Image queued. Remember to click &quot;Save all changes&quot; to
          commit.
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
