// functions/api/update-content.js

/**
 * Cloudflare Pages Function
 *
 * POST /api/update-content
 *
 * Expects JSON body:
 * {
 *   "slug": "about",          // without .json
 *   "content": { ...json }    // the full JSON object to write
 * }
 *
 * It will update: <CONTENT_BASE_PATH>/<slug>.json
 * in your GitHub repo using the Contents API.
 */

function toBase64(str) {
  // Proper UTF-8 → base64 for GitHub API
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const onRequestPost = async ({ request, env }) => {
  try {
    const url = new URL(request.url);

    // Optional: lock to certain slugs if you want
    // e.g. only allow ["home", "about", "testimonials", "misc"]

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const { slug, content } = body;

    if (!slug || typeof slug !== "string") {
      return new Response("Missing or invalid 'slug'", { status: 400 });
    }

    if (content === undefined) {
      return new Response("Missing 'content'", { status: 400 });
    }

    const owner = env.GITHUB_REPO_OWNER;
    const repo = env.GITHUB_REPO_NAME;
    const basePath = env.CONTENT_BASE_PATH || "app/_lib/content";
    const path = `${basePath.replace(/\/$/, "")}/${slug}.json`;

    if (!env.GITHUB_TOKEN || !owner || !repo) {
      console.error("Missing required env vars");
      return new Response("Server misconfigured", { status: 500 });
    }

    const githubHeaders = {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    };

    // 1) Fetch existing file to get its SHA
    const getResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
        path
      )}`,
      { headers: githubHeaders }
    );

    if (!getResp.ok) {
      const txt = await getResp.text();
      console.error("Failed to fetch existing file from GitHub:", txt);
      return new Response("Failed to fetch existing file from GitHub", {
        status: 500,
      });
    }

    const existing = await getResp.json();
    const sha = existing.sha;

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
        headers: githubHeaders,
        body: JSON.stringify({
          message: `Update ${slug}.json via WSMath admin`,
          content: newContentBase64,
          sha,
        }),
      }
    );

    if (!putResp.ok) {
      const txt = await putResp.text();
      console.error("GitHub update failed:", txt);
      return new Response("Failed to update file in GitHub", {
        status: 500,
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("update-content error:", err);
    return new Response("Server error", { status: 500 });
  }
};
