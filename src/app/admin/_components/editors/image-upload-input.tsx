// app/admin/_components/editors/image-upload-input.tsx
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
  forcedPublicPath?: string;
  forcedFileName?: string;
};

function isPng(file: File) {
  const name = file.name.toLowerCase();
  return file.type === "image/png" || name.endsWith(".png");
}

function isMp4(file: File) {
  const name = file.name.toLowerCase();
  // Some browsers may give empty type for local files, so check extension too
  return file.type === "video/mp4" || name.endsWith(".mp4");
}

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

  const kind = target.kind ?? "image";
  const accept =
    target.accept ?? (kind === "video" ? "video/mp4" : "image/png");

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

  const previewSrc = queuedPreview || targetPublicPath || "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend validation
    const ok =
      kind === "video" ? isMp4(file) :
      /* kind === "image" */ isPng(file);

    if (!ok) {
      setStatus("error");
      setError(
        kind === "video"
          ? "Only MP4 videos (.mp4) are supported."
          : "Only PNG images (.png) are supported."
      );
      e.target.value = "";
      return;
    }

    if (!targetPublicPath || !repoPath) {
      setStatus("error");
      setError(
        "This media field has no target path. Set a JSON value (e.g. '/video/student-voices.mp4') or provide a forcedPublicPath for indexed fields.",
      );
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setStatus("idle");
    setError(null);

    try {
      const finalFile =
        forcedFileName && forcedFileName.trim().length > 0
          ? new File([file], forcedFileName, { type: file.type || (kind === "video" ? "video/mp4" : "image/png") })
          : file;

      // 1) Update JSON state to the targetPublicPath
      const next = structuredClone(data) as T;
      setByPath(next, field.path, targetPublicPath);
      onChangeData(next);

      // 2) Queue file for save-all (function name is image-ish, but works fine if backend accepts any file)
      queueImageUpload({
        repoPath,
        publicPath: targetPublicPath,
        file: finalFile,
      });

      setStatus("success");
    } catch (err) {
      console.error("Upload queue error:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown upload error.");
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
          {kind === "video" ? (
            previewSrc ? (
              <video
                src={previewSrc}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
                No video
              </div>
            )
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc || "/placeholder.png"}
              alt={field.label}
              className="h-full w-full object-cover"
            />
          )}
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
            <p className="mt-1 text-[11px] text-neutral-500">{target.note}</p>
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
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading
          ? kind === "video"
            ? "Preparing video…"
            : "Preparing image…"
          : kind === "video"
            ? "Choose video (MP4)"
            : "Choose image (PNG)"}
      </label>

      {/* Status */}
      {status === "success" && (
        <p className="text-[11px] text-emerald-600">
          {kind === "video" ? "Video" : "Image"} queued. Remember to click
          &quot;Save all changes&quot; to commit.
        </p>
      )}
      {status === "error" && (
        <p className="text-[11px] text-red-600">
          {error || "Failed to queue upload."}
        </p>
      )}
    </div>
  );
}
