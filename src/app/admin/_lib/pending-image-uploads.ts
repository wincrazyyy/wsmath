// src/app/admin/_lib/pending-image-uploads.ts

export type QueuedImageUpload =
  | {
      kind: "upload";
      repoPath: string; // e.g. "public/hero.png"
      publicPath: string; // e.g. "/hero.png"
      file: File;
      previewUrl?: string; // object URL for client-side preview
    }
  | {
      kind: "delete";
      repoPath: string; // e.g. "public/hero.png"
      publicPath: string; // e.g. "/hero.png"
    };

type QueuedUpload = Extract<QueuedImageUpload, { kind: "upload" }>;

const queue: QueuedImageUpload[] = [];

// ✅ Type guard: makes TS understand narrowing after filter()
function isUpload(q: QueuedImageUpload): q is QueuedUpload {
  return q.kind === "upload";
}

// Internal helper to revoke an existing preview URL if any
function revokePreview(q: QueuedImageUpload) {
  if (isUpload(q) && q.previewUrl) {
    URL.revokeObjectURL(q.previewUrl);
    q.previewUrl = undefined;
  }
}

function removeExisting(repoPath: string) {
  const idx = queue.findIndex((q) => q.repoPath === repoPath);
  if (idx !== -1) {
    revokePreview(queue[idx]!);
    queue.splice(idx, 1);
  }
}

export function queueImageUpload(entry: {
  repoPath: string;
  publicPath: string;
  file: File;
}) {
  removeExisting(entry.repoPath);

  const previewUrl = URL.createObjectURL(entry.file);

  queue.push({
    kind: "upload",
    repoPath: entry.repoPath,
    publicPath: entry.publicPath,
    file: entry.file,
    previewUrl,
  });
}

export function queueImageUploads(
  entries: { repoPath: string; publicPath: string; file: File }[],
) {
  entries.forEach(queueImageUpload);
}

export function queueImageDelete(entry: { repoPath: string; publicPath: string }) {
  removeExisting(entry.repoPath);

  queue.push({
    kind: "delete",
    repoPath: entry.repoPath,
    publicPath: entry.publicPath,
  });
}

export function getQueuedImageUploads(): QueuedImageUpload[] {
  return [...queue];
}

export function clearQueuedImageUploads() {
  for (const q of queue) revokePreview(q);
  queue.length = 0;
}

/**
 * Get preview URL for a specific public path, if it has been queued.
 * e.g. "/hero.png"
 */
export function getPreviewUrlForPublicPath(publicPath: string): string | null {
  const item = queue.find((q) => q.publicPath === publicPath);
  if (!item) return null;
  if (!isUpload(item)) return null;
  return item.previewUrl ?? null;
}

/**
 * Get preview URLs for all queued images inside a given public folder.
 * e.g. dirPublic = "/leaflets" → returns previews for "/leaflets/....png"
 */
export function getQueuedPreviewsForDir(dirPublic: string): string[] {
  const prefix = dirPublic.endsWith("/") ? dirPublic : `${dirPublic}/`;

  // filter() now narrows to QueuedUpload[] thanks to the type guard
  return queue
    .filter((q) => q.publicPath.startsWith(prefix))
    .filter(isUpload)
    .filter((q) => !!q.previewUrl)
    .map((q) => q.previewUrl!);
}
