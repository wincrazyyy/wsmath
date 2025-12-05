import { NextRequest, NextResponse } from "next/server";

// Required by next-on-pages: run this route on the Edge runtime
export const runtime = "edge";

function toBase64(str: string): string {
  // UTF-8 safe base64 encoding for Edge (no Node Buffer)
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is available in Edge/Workers
  return btoa(binary);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, content } = body as { slug?: string; content?: unknown };

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'slug'" },
        { status: 400 }
      );
    }

    if (content === undefined) {
      return NextResponse.json(
        { error: "Missing 'content'" },
        { status: 400 }
      );
    }

    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const token = process.env.GITHUB_TOKEN;
    const basePath =
      process.env.CONTENT_BASE_PATH ?? "app/_lib/content";

    if (!owner || !repo || !token) {
      return NextResponse.json(
        { error: "Server misconfigured: missing GitHub env vars" },
        { status: 500 }
      );
    }

    const path = `${basePath.replace(/\/$/, "")}/${slug}.json`;

    // 1) Fetch existing file to get its SHA
    const existingResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
        path
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!existingResp.ok) {
      const text = await existingResp.text();
      return NextResponse.json(
        {
          error: "Failed to fetch existing file from GitHub",
          detail: text,
        },
        { status: 500 }
      );
    }

    const existing = (await existingResp.json()) as { sha?: string };
    const sha = existing.sha;

    if (!sha) {
      return NextResponse.json(
        { error: "No SHA found for existing file" },
        { status: 500 }
      );
    }

    // 2) Prepare new content
    const newContentString = JSON.stringify(content, null, 2);
    const newContentBase64 = toBase64(newContentString);

    // 3) Update file via GitHub Contents API
    const putResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
        path
      )}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Update ${slug}.json via WSMath admin`,
          content: newContentBase64,
          sha,
        }),
      }
    );

    if (!putResp.ok) {
      const text = await putResp.text();
      return NextResponse.json(
        { error: "Failed to update file in GitHub", detail: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Server error", detail: message },
      { status: 500 }
    );
  }
}
