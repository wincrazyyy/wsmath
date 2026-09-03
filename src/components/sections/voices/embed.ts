/**
 * Share link → autoplaying embed URL.
 *
 * The owner pastes whatever the host's UI hands them (`pages.voices.video.url`
 * is a Loom **share** link); the `/embed/` rewrite and every query parameter is
 * CODE, never content — `spec/video-live.md` §4.1. Nothing here may be baked
 * back into `pages.json`.
 *
 * Why the parameters exist at all: the live wsmath.com embed ships a *bare*
 * `…/embed/<id>` and does NOT autoplay — measured in real Chrome under the
 * strict autoplay policy (`spec/video-live.md` §3). The `<video>` element inside
 * that frame plays Loom's silent *thumbnail* loop behind a poster and a green
 * play button; `currentTime` never passes ~2 s. Adding `autoplay=1` flips
 * `currentSrc` to the real `blob:` media (1920×1080) and the clock advances.
 * Copying the live markup would reproduce the bug the client reported.
 *
 * `muted=true` is belt-and-braces: Loom force-mutes its own element when
 * autoplaying (and sets `playsinline`, so iOS will not hijack it fullscreen),
 * but stating it survives a Loom default change. Muted is what makes autoplay
 * legal without a user gesture; `volume` stays 1, so unmuting restores sound.
 *
 * The `hide*` set strips Loom's title/views/copy-link bar, which otherwise
 * fights the lacquer well it is inlaid into.
 */
import type { VideoProvider } from '@/content/schema';

/** Applied to every provider: the autoplay pair plus each host's chrome sheds. */
const PARAMS: Record<VideoProvider, Readonly<Record<string, string>>> = {
  loom: {
    autoplay: '1',
    muted: 'true',
    hideEmbedTopBar: 'true',
    hide_owner: 'true',
    hide_share: 'true',
    hide_title: 'true',
  },
  // Cloudflare Stream is the decided destination for this video (CLAUDE.md,
  // editor contract §6). Switching is a one-field edit in pages.json once uploaded.
  stream: {
    autoplay: 'true',
    muted: 'true',
    playsinline: 'true',
    preload: 'auto',
    controls: 'true',
  },
  youtube: { autoplay: '1', mute: '1', rel: '0', playsinline: '1' },
};

/** The parameter that must be dropped when the reader asked for less motion. */
const AUTOPLAY_KEY: Record<VideoProvider, string> = { loom: 'autoplay', stream: 'autoplay', youtube: 'autoplay' };

/** `https://www.loom.com/share/<id>` → `https://www.loom.com/embed/<id>`. */
function loomEmbedPath(pathname: string): string {
  return pathname.replace(/^\/share\//, '/embed/');
}

/**
 * Cloudflare Stream watch links (`…cloudflarestream.com/<uid>/watch`,
 * `watch.cloudflarestream.com/<uid>`) → the canonical iframe host.
 */
function streamEmbedUrl(url: URL): URL {
  const uid = url.pathname.split('/').filter(Boolean)[0];
  return uid === undefined ? url : new URL(`https://iframe.videodelivery.net/${uid}`);
}

/** `https://youtu.be/<id>` and `…/watch?v=<id>` → `…/embed/<id>`. */
function youtubeEmbedUrl(url: URL): URL {
  if (url.hostname === 'youtu.be') {
    const id = url.pathname.slice(1);
    return id === '' ? url : new URL(`https://www.youtube.com/embed/${id}`);
  }
  const v = url.searchParams.get('v');
  if (v !== null) {
    const embed = new URL(`https://www.youtube.com/embed/${v}`);
    url.searchParams.delete('v');
    for (const [key, value] of url.searchParams) embed.searchParams.set(key, value);
    return embed;
  }
  return url;
}

export interface ResolveEmbedOptions {
  /**
   * Drop the autoplay parameter. The band renders the autoplaying source in the
   * static HTML (so a reader without JavaScript still gets the behaviour the
   * client asked for) and swaps to this one when
   * `prefers-reduced-motion: reduce` is set — a 2½-minute video starting itself
   * is motion (`spec/video-live.md` §4.6).
   */
  readonly noAutoplay?: boolean;
}

/**
 * Build the embed `src` for a provider + share link. Returns the input
 * unchanged if it is not a URL we can parse — a broken link must degrade to a
 * dead frame, never throw the whole page away at build time.
 */
export function resolveEmbed(provider: VideoProvider, url: string, options: ResolveEmbedOptions = {}): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  let embed: URL;
  if (provider === 'loom') {
    embed = new URL(parsed.toString());
    embed.pathname = loomEmbedPath(parsed.pathname);
  } else if (provider === 'stream') {
    embed = streamEmbedUrl(parsed);
  } else {
    embed = youtubeEmbedUrl(parsed);
  }

  for (const [key, value] of Object.entries(PARAMS[provider])) embed.searchParams.set(key, value);
  if (options.noAutoplay === true) embed.searchParams.delete(AUTOPLAY_KEY[provider]);
  return embed.toString();
}
