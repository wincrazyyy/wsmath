// src/app/admin/_lib/pending-image-uploads.ts

export type QueuedImageUpload = {
  repoPath: string;   // e.g. "public/hero.png"
  publicPath: string; // e.g. "/hero.png"
  file: File;
  previewUrl?: string; // object URL for client-side preview
};

const queue: QueuedImageUpload[] = [];

// Internal helper to revoke an existing preview URL if any
function revokePreview(q: QueuedImageUpload) {
  if (q.previewUrl) {
    URL.revokeObjectURL(q.previewUrl);
    q.previewUrl = undefined;
  }
}

export function queueImageUpload(entry: {
  repoPath: string;
  publicPath: string;
  file: File;
}) {
  // Remove any existing entry for the same repoPath so we don't stack duplicates
  const existingIndex = queue.findIndex(
    (q) => q.repoPath === entry.repoPath,
  );
  if (existingIndex !== -1) {
    revokePreview(queue[existingIndex]!);
    queue.splice(existingIndex, 1);
  }

  const previewUrl = URL.createObjectURL(entry.file);

  queue.push({
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

export function getQueuedImageUploads(): QueuedImageUpload[] {
  // return a shallow copy so callers can't mutate internal state
  return [...queue];
}

export function clearQueuedImageUploads() {
  for (const q of queue) {
    revokePreview(q);
  }
  queue.length = 0;
}

/**
 * Get preview URL for a specific public path, if it has been queued.
 * e.g. "/hero.png"
 */
export function getPreviewUrlForPublicPath(
  publicPath: string,
): string | null {
  const item = queue.find((q) => q.publicPath === publicPath);
  return item?.previewUrl ?? null;
}

/**
 * Get preview URLs for all queued images inside a given public folder.
 * e.g. dirPublic = "/leaflets" → returns previews for "/leaflets/....png"
 */
export function getQueuedPreviewsForDir(
  dirPublic: string,
): string[] {
  const prefix = dirPublic.endsWith("/")
    ? dirPublic
    : `${dirPublic}/`;

  return queue
    .filter((q) => q.previewUrl && q.publicPath.startsWith(prefix))
    .map((q) => q.previewUrl!) ;
}
