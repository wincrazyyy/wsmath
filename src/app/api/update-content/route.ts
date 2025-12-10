// src/app/api/update-content/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type BatchPayload = {
  updates: {
    slug: string;        // "home" | "about" | "testimonials" | "misc"
    content: unknown;    // the JSON blob for that file
  }[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BatchPayload;

    if (!body.updates || body.updates.length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const token = process.env.GITHUB_TOKEN;
    const basePath =
      process.env.CONTENT_BASE_PATH ?? "src/app/_lib/content";
    const branch = process.env.GITHUB_BRANCH ?? "main";

    if (!owner || !repo || !token) {
      return NextResponse.json(
        { error: "Server misconfigured: missing GitHub env vars" },
        { status: 500 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    };

    // Get current HEAD commit for the branch
    const refResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      { headers }
    );
    if (!refResp.ok) {
      const text = await refResp.text();
      return NextResponse.json(
        { error: "Failed to fetch branch ref", detail: text },
        { status: 500 }
      );
    }
    const refJson = (await refResp.json()) as {
      object: { sha: string };
    };
    const currentCommitSha = refJson.object.sha;

    // Get the commit to find its tree
    const commitResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits/${currentCommitSha}`,
      { headers }
    );
    if (!commitResp.ok) {
      const text = await commitResp.text();
      return NextResponse.json(
        { error: "Failed to fetch commit", detail: text },
        { status: 500 }
      );
    }
    const commitJson = (await commitResp.json()) as {
      tree: { sha: string };
    };
    const baseTreeSha = commitJson.tree.sha;

    // Build tree entries for each updated file (GitHub will create blobs)
    const treeEntries = body.updates.map(({ slug, content }) => {
      const path = `${basePath.replace(/\/$/, "")}/${slug}.json`;
      const fileContent = JSON.stringify(content, null, 2);
      return {
        path,
        mode: "100644",
        type: "blob",
        content: fileContent,
      };
    });

    // Create a new tree
    const treeResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeEntries,
        }),
      }
    );
    if (!treeResp.ok) {
      const text = await treeResp.text();
      return NextResponse.json(
        { error: "Failed to create tree", detail: text },
        { status: 500 }
      );
    }
    const treeJson = (await treeResp.json()) as { sha: string };
    const newTreeSha = treeJson.sha;

    // Create a new commit pointing to that tree
    const commitMessage =
      body.updates.length === 1
        ? `Update ${body.updates[0]!.slug}.json via WSMath admin`
        : `Batch update content via WSMath admin`;

    const newCommitResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
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
      }
    );
    if (!newCommitResp.ok) {
      const text = await newCommitResp.text();
      return NextResponse.json(
        { error: "Failed to create commit", detail: text },
        { status: 500 }
      );
    }
    const newCommitJson = (await newCommitResp.json()) as { sha: string };
    const newCommitSha = newCommitJson.sha;

    // Move the branch ref to point to the new commit
    const updateRefResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
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
      }
    );
    if (!updateRefResp.ok) {
      const text = await updateRefResp.text();
      return NextResponse.json(
        { error: "Failed to update branch ref", detail: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Server error", detail: message },
      { status: 500 }
    );
  }
}
