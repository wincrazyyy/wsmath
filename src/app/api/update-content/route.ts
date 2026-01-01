// src/app/api/update-content/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type ContentUpdate = {
  slug: string; // "home" | "about" | "testimonials" | "misc" | ...
  content: unknown; // the JSON blob for that file
};

type ImageUpdate = {
  /** Path inside the repo, e.g. "public/hero.png" */
  targetPath: string;

  /** Base64-encoded file content (NO data: prefix). Required for upsert. */
  contentBase64?: string;

  /** If true, delete this file from the repo (public folder). */
  delete?: boolean;
};

type BatchPayload = {
  updates: ContentUpdate[];
  images?: ImageUpdate[];
};

// ---------- helpers for base64 ----------

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ---------- signature checks ----------

function isPngBytes(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
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

function isJpegBytes(bytes: Uint8Array): boolean {
  // FF D8 FF ...
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isWebpBytes(bytes: Uint8Array): boolean {
  // "RIFF" .... "WEBP"
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function extOf(p: string): string {
  const m = p.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function isAllowedImageExt(ext: string): boolean {
  return ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp";
}

// ---------- helpers for GitHub blobs ----------

async function createTextBlob(
  apiBase: string,
  headers: Record<string, string>,
  content: string
): Promise<string> {
  const resp = await fetch(`${apiBase}/git/blobs`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ content, encoding: "utf-8" }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to create JSON blob: ${text}`);
  }

  const json = (await resp.json()) as { sha: string };
  return json.sha;
}

async function createImageBlob(
  apiBase: string,
  headers: Record<string, string>,
  targetPath: string,
  contentBase64: string
): Promise<string> {
  if (targetPath.includes("..")) {
    throw new Error(`Invalid targetPath: ${targetPath}`);
  }
  if (!targetPath.startsWith("public/")) {
    throw new Error(`Image targetPath must start with "public/". Got: ${targetPath}`);
  }

  const ext = extOf(targetPath);
  if (!isAllowedImageExt(ext)) {
    throw new Error(`Image extension not allowed: .${ext} (use png/jpg/jpeg/webp)`);
  }

  let bytes: Uint8Array;
  try {
    bytes = base64ToUint8Array(contentBase64);
  } catch {
    throw new Error("contentBase64 is not valid base64.");
  }

  const ok =
    (ext === "png" && isPngBytes(bytes)) ||
    ((ext === "jpg" || ext === "jpeg") && isJpegBytes(bytes)) ||
    (ext === "webp" && isWebpBytes(bytes));

  if (!ok) {
    throw new Error(`Uploaded file bytes do not match extension .${ext}.`);
  }

  const resp = await fetch(`${apiBase}/git/blobs`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
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
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const token = process.env.GITHUB_TOKEN;

    const rawBasePath = process.env.CONTENT_BASE_PATH ?? "src/app/_lib/content";
    const basePathRoot = rawBasePath.replace(/\/$/, "");
    const jsonBasePath = basePathRoot.endsWith("/json")
      ? basePathRoot
      : `${basePathRoot}/json`;

    const branch = process.env.GITHUB_BRANCH ?? "main";

    if (!owner || !repo || !token) {
      return NextResponse.json(
        { error: "Server misconfigured: missing GitHub env vars" },
        { status: 500 }
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    };

    const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

    // 1) Get current HEAD commit for the branch
    const refResp = await fetch(`${apiBase}/git/refs/heads/${branch}`, { headers });
    if (!refResp.ok) {
      const text = await refResp.text();
      return NextResponse.json(
        { error: "Failed to fetch branch ref", detail: text },
        { status: 500 }
      );
    }
    const refJson = (await refResp.json()) as { object: { sha: string } };
    const currentCommitSha = refJson.object.sha;

    // 2) Get the commit to find its tree
    const commitResp = await fetch(`${apiBase}/git/commits/${currentCommitSha}`, { headers });
    if (!commitResp.ok) {
      const text = await commitResp.text();
      return NextResponse.json(
        { error: "Failed to fetch commit", detail: text },
        { status: 500 }
      );
    }
    const commitJson = (await commitResp.json()) as { tree: { sha: string } };
    const baseTreeSha = commitJson.tree.sha;

    // 3) Build tree entries for updated JSON files (via blobs)
    const jsonTreeEntries: {
      path: string;
      mode: "100644";
      type: "blob";
      sha: string | null;
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

    // 4) Build tree entries for images (upsert/delete)
    const imageTreeEntries: {
      path: string;
      mode: "100644";
      type: "blob";
      sha: string | null;
    }[] = [];

    if (body.images && body.images.length > 0) {
      for (const img of body.images) {
        const targetPath = img?.targetPath;

        if (!targetPath) {
          return NextResponse.json({ error: "Invalid image payload (targetPath)" }, { status: 400 });
        }
        if (targetPath.includes("..") || !targetPath.startsWith("public/")) {
          return NextResponse.json({ error: `Invalid targetPath: ${targetPath}` }, { status: 400 });
        }

        // DELETE: sha null removes the file in the new tree
        if (img.delete) {
          imageTreeEntries.push({
            path: targetPath,
            mode: "100644",
            type: "blob",
            sha: null, // ✅ delete
          });
          continue;
        }

        // UPSERT
        if (!img.contentBase64) {
          return NextResponse.json(
            { error: "Invalid image payload (contentBase64 required unless delete=true)" },
            { status: 400 }
          );
        }

        const sha = await createImageBlob(apiBase, headers, targetPath, img.contentBase64);

        imageTreeEntries.push({
          path: targetPath,
          mode: "100644",
          type: "blob",
          sha,
        });
      }
    }

    // 5) Create a new tree including JSON & image entries
    const treeResp = await fetch(`${apiBase}/git/trees`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: [...jsonTreeEntries, ...imageTreeEntries],
      }),
    });

    if (!treeResp.ok) {
      const text = await treeResp.text();
      return NextResponse.json({ error: "Failed to create tree", detail: text }, { status: 500 });
    }

    const treeJson = (await treeResp.json()) as { sha: string };
    const newTreeSha = treeJson.sha;

    const hasMultiple = body.updates.length + (body.images?.length ?? 0) > 1;

    const commitMessage = hasMultiple
      ? `Batch update content via WSMath admin`
      : body.updates.length === 1
        ? `Update ${body.updates[0]!.slug}.json via WSMath admin`
        : `Update assets via WSMath admin`;

    // 6) Create a new commit pointing to that tree
    const newCommitResp = await fetch(`${apiBase}/git/commits`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: commitMessage,
        tree: newTreeSha,
        parents: [currentCommitSha],
      }),
    });

    if (!newCommitResp.ok) {
      const text = await newCommitResp.text();
      return NextResponse.json({ error: "Failed to create commit", detail: text }, { status: 500 });
    }

    const newCommitJson = (await newCommitResp.json()) as { sha: string };
    const newCommitSha = newCommitJson.sha;

    // 7) Move the branch ref to point to the new commit
    const updateRefResp = await fetch(`${apiBase}/git/refs/heads/${branch}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        sha: newCommitSha,
        force: false,
      }),
    });

    if (!updateRefResp.ok) {
      const text = await updateRefResp.text();
      return NextResponse.json({ error: "Failed to update branch ref", detail: text }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Server error", detail: message }, { status: 500 });
  }
}
