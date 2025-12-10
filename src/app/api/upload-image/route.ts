// src/app/api/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  // btoa is available in edge runtimes
  return btoa(binary);
}

// Simple PNG signature check: 89 50 4E 47 0D 0A 1A 0A
function isPngBytes(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const targetPath = formData.get("targetPath");

    if (!(file instanceof Blob) || typeof targetPath !== "string") {
      return NextResponse.json(
        { error: "Missing file or targetPath" },
        { status: 400 },
      );
    }

    // Basic safety guard – no directory traversal
    if (targetPath.includes("..")) {
      return NextResponse.json(
        { error: "Invalid targetPath" },
        { status: 400 },
      );
    }

    // Enforce PNG-only uploads
    const contentType = file.type;

    if (contentType !== "image/png") {
      return NextResponse.json(
        {
          error: "Invalid file type",
          detail: `Only PNG images are allowed (got ${contentType || "unknown"}).`,
        },
        { status: 400 },
      );
    }

    // Enforce .png extension on the target path as well
    if (!targetPath.toLowerCase().endsWith(".png")) {
      return NextResponse.json(
        {
          error: "Invalid targetPath",
          detail: "Target path must end with .png when uploading PNG images.",
        },
        { status: 400 },
      );
    }

    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const token = process.env.GITHUB_TOKEN;
    const branch = process.env.GITHUB_BRANCH ?? "main";

    if (!owner || !repo || !token) {
      return NextResponse.json(
        { error: "Server misconfigured: missing GitHub env vars" },
        { status: 500 },
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    };

    const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

    // Read file into memory
    const arrayBuffer = await file.arrayBuffer();

    // Double-check file *content* really is PNG
    if (!isPngBytes(arrayBuffer)) {
      return NextResponse.json(
        {
          error: "Invalid image content",
          detail: "Uploaded file is not a valid PNG image.",
        },
        { status: 400 },
      );
    }

    // Compute base64 of the file
    const base64 = arrayBufferToBase64(arrayBuffer);

    // Check if file already exists to get its sha (required for update)
    let existingSha: string | undefined = undefined;
    const getResp = await fetch(
      `${apiBase}/contents/${encodeURIComponent(targetPath)}?ref=${branch}`,
      { headers },
    );

    if (getResp.ok) {
      const existingJson = (await getResp.json()) as { sha?: string };
      if (existingJson.sha) {
        existingSha = existingJson.sha;
      }
    } else if (getResp.status !== 404) {
      const text = await getResp.text();
      return NextResponse.json(
        { error: "Failed to check existing file", detail: text },
        { status: 500 },
      );
    }

    // PUT via Contents API
    const commitMessage = `Update ${targetPath} via WSMath admin upload`;

    const putResp = await fetch(
      `${apiBase}/contents/${encodeURIComponent(targetPath)}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: commitMessage,
          content: base64,
          branch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      },
    );

    if (!putResp.ok) {
      const text = await putResp.text();
      return NextResponse.json(
        { error: "Failed to upload image", detail: text },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Server error", detail: message },
      { status: 500 },
    );
  }
}
