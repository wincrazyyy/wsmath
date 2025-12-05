import { NextRequest, NextResponse } from "next/server";

function toBase64(str: string) {
  return Buffer.from(str, "utf-8").toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, content } = body;

    if (!slug || !content) {
      return NextResponse.json({ error: "Missing slug or content" }, { status: 400 });
    }

    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;
    const token = process.env.GITHUB_TOKEN!;
    const basePath = process.env.CONTENT_BASE_PATH || "app/_lib/content";

    const path = `${basePath}/${slug}.json`;

    // Fetch existing file to get sha
    const existingResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
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
        { error: "Failed to fetch existing file", detail: text },
        { status: 500 }
      );
    }

    const existing = await existingResp.json();
    const sha = existing.sha;

    const newContent = JSON.stringify(content, null, 2);
    const encodedContent = toBase64(newContent);

    // PUT update
    const putResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Update ${slug}.json via WSMath Admin`,
          content: encodedContent,
          sha,
        }),
      }
    );

    if (!putResp.ok) {
      const text = await putResp.text();
      return NextResponse.json(
        { error: "Failed to update file", detail: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", detail: err.message },
      { status: 500 }
    );
  }
}
