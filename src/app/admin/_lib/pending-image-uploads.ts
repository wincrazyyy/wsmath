"use client";

export type QueuedImageUpload = {
  /** Path in the repo, e.g. "public/hero.png" */
  repoPath: string;
  /** Public URL, e.g. "/hero.png" */
  publicPath: string;
  /** The actual file selected in the browser */
  file: File;
};

let queue: QueuedImageUpload[] = [];

/**
 * Add or replace a single queued image upload.
 * If another entry with the same repoPath exists, it is replaced.
 */
export function queueImageUpload(entry: QueuedImageUpload) {
  queue = queue.filter((item) => item.repoPath !== entry.repoPath);
  queue.push(entry);
}

/**
 * Add or replace multiple image uploads.
 */
export function queueImageUploads(entries: QueuedImageUpload[]) {
  for (const entry of entries) {
    queueImageUpload(entry);
  }
}

/**
 * Get a snapshot of all queued uploads.
 */
export function getQueuedImageUploads(): QueuedImageUpload[] {
  return [...queue];
}

/**
 * Clear the queue after a successful save.
 */
export function clearQueuedImageUploads() {
  queue = [];
}
