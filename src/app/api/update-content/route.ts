// src/app/api/update-content/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type ContentUpdate = {
  slug: string;      // "home" | "about" | "testimonials" | "misc" | ...
  content: unknown;  // the JSON blob for that file
};

type ImageUpdate = {
  /** Path inside the repo, e.g. "public/hero.png" */
  targetPath: string;
  /** Base64-encoded PNG file content (no data URI prefix) */
  contentBase64: string;
};

type BatchPayload = {
  updates: ContentUpdate[];
  images?: ImageUpdate[];
};

// ---------- helpers for PNG validation & base64 ----------

function base64ToUint8Array(base64: string): Uint8Array {
  // atob is available in edge runtimes
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Simple PNG signature check: 89 50 4E 47 0D 0A 1A 0A
function isPngBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

// Create a text blob (for JSON files)
async function createTextBlob(
  apiBase: string,
  headers: Record<string, string>,
  content: string,
): Promise<string> {
  const resp = await fetch(`${apiBase}/git/blobs`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      encoding: "utf-8",
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to create JSON blob: ${text}`);
  }

  const json = (await resp.json()) as { sha: string };
  return json.sha;
}

// Create a PNG blob from base64
async function createPngBlob(
  apiBase: string,
  headers: Record<string, string>,
  targetPath: string,
  contentBase64: string,
): Promise<string> {
  if (targetPath.includes("..")) {
    throw new Error(`Invalid targetPath: ${targetPath}`);
  }

  if (!targetPath.startsWith("public/")) {
    throw new Error(
      `Image targetPath must start with "public/". Got: ${targetPath}`,
    );
  }

  if (!targetPath.toLowerCase().endsWith(".png")) {
    throw new Error(
      `Target path must end with .png (got ${targetPath}).`,
    );
  }

  let bytes: Uint8Array;
  try {
    bytes = base64ToUint8Array(contentBase64);
  } catch {
    throw new Error("contentBase64 is not valid base64.");
  }

  if (!isPngBytes(bytes)) {
    throw new Error("Uploaded file is not a valid PNG image.");
  }

  const resp = await fetch(`${apiBase}/git/blobs`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: contentBase64,
      encoding: "base64",
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to create image blob: ${text}`);
  }

  const json = (await resp.json()) as { sha: string };
  return json.sha;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BatchPayload;

    if (!body.updates || body.updates.length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 },
      );
    }

    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const token = process.env.GITHUB_TOKEN;
    // Default to the actual JSON folder by default
    const rawBasePath =
      process.env.CONTENT_BASE_PATH ?? "src/app/_lib/content";

    // Ensure we always write JSON into a "json" subfolder
    const basePathRoot = rawBasePath.replace(/\/$/, ""); // strip trailing slash

    const jsonBasePath = basePathRoot.endsWith("/json")
      ? basePathRoot
      : `${basePathRoot}/json`;
  
    const branch = process.env.GITHUB_BRANCH ?? "main";

    if (!owner || !repo || !token) {
      return NextResponse.json(
        { error: "Server misconfigured: missing GitHub env vars" },
        { status: 500 },
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    };

    const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

    // 1) Get current HEAD commit for the branch
    const refResp = await fetch(
      `${apiBase}/git/refs/heads/${branch}`,
      { headers },
    );
    if (!refResp.ok) {
      const text = await refResp.text();
      return NextResponse.json(
        { error: "Failed to fetch branch ref", detail: text },
        { status: 500 },
      );
    }
    const refJson = (await refResp.json()) as {
      object: { sha: string };
    };
    const currentCommitSha = refJson.object.sha;

    // 2) Get the commit to find its tree
    const commitResp = await fetch(
      `${apiBase}/git/commits/${currentCommitSha}`,
      { headers },
    );
    if (!commitResp.ok) {
      const text = await commitResp.text();
      return NextResponse.json(
        { error: "Failed to fetch commit", detail: text },
        { status: 500 },
      );
    }
    const commitJson = (await commitResp.json()) as {
      tree: { sha: string };
    };
    const baseTreeSha = commitJson.tree.sha;

    // 3) Build tree entries for updated JSON files (via blobs)
    const jsonTreeEntries: {
      path: string;
      mode: "100644";
      type: "blob";
      sha: string;
    }[] = [];

    for (const { slug, content } of body.updates) {
      const path = `${jsonBasePath.replace(/\/$/, "")}/${slug}.json`;
      const fileContent = JSON.stringify(content, null, 2);
      const sha = await createTextBlob(apiBase, headers, fileContent);
      jsonTreeEntries.push({
        path,
        mode: "100644",
        type: "blob",
        sha,
      });
    }

    // 4) Build tree entries for images (via blobs)
    const imageTreeEntries: {
      path: string;
      mode: "100644";
      type: "blob";
      sha: string;
    }[] = [];

    if (body.images && body.images.length > 0) {
      for (const img of body.images) {
        const { targetPath, contentBase64 } = img;

        if (!targetPath || !contentBase64) {
          return NextResponse.json(
            {
              error: "Invalid image payload (targetPath/contentBase64)",
            },
            { status: 400 },
          );
        }

        const sha = await createPngBlob(
          apiBase,
          headers,
          targetPath,
          contentBase64,
        );

        imageTreeEntries.push({
          path: targetPath,
          mode: "100644",
          type: "blob",
          sha,
        });
      }
    }

    // 5) Create a new tree including JSON & image entries
    const treeResp = await fetch(
      `${apiBase}/git/trees`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: [...jsonTreeEntries, ...imageTreeEntries],
        }),
      },
    );
    if (!treeResp.ok) {
      const text = await treeResp.text();
      return NextResponse.json(
        { error: "Failed to create tree", detail: text },
        { status: 500 },
      );
    }
    const treeJson = (await treeResp.json()) as { sha: string };
    const newTreeSha = treeJson.sha;

    const hasMultiple =
      body.updates.length + (body.images?.length ?? 0) > 1;

    const commitMessage =
      hasMultiple
        ? `Batch update content via WSMath admin`
        : body.updates.length === 1
          ? `Update ${body.updates[0]!.slug}.json via WSMath admin`
          : `Update assets via WSMath admin`;

    // 6) Create a new commit pointing to that tree
    const newCommitResp = await fetch(
      `${apiBase}/git/commits`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: commitMessage,
          tree: newTreeSha,
          parents: [currentCommitSha],
        }),
      },
    );
    if (!newCommitResp.ok) {
      const text = await newCommitResp.text();
      return NextResponse.json(
        { error: "Failed to create commit", detail: text },
        { status: 500 },
      );
    }
    const newCommitJson = (await newCommitResp.json()) as { sha: string };
    const newCommitSha = newCommitJson.sha;

    // 7) Move the branch ref to point to the new commit
    const updateRefResp = await fetch(
      `${apiBase}/git/refs/heads/${branch}`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sha: newCommitSha,
          force: false,
        }),
      },
    );
    if (!updateRefResp.ok) {
      const text = await updateRefResp.text();
      return NextResponse.json(
        { error: "Failed to update branch ref", detail: text },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Server error", detail: message },
      { status: 500 },
    );
  }
}
