/*
 * The testimonials video (#students .tm-video), ported from the original site's player (main:
 * src/components/sections/voices/video-frame.tsx and embed.ts).
 *
 * - The Loom player isn't in the page until it's wanted. It mounts, autoplaying muted, the first time the frame has
 *   been at least 40% on screen for 300 ms: it starts when the reader reaches it, never unseen at the foot of the page,
 *   and a reader flicking past doesn't load it. Browsers only allow autoplay without a click when it's muted.
 * - A click on the preview mounts it at once and plays it with sound (the click is the gesture browsers ask for).
 * - Under prefers-reduced-motion nothing starts by itself: the preview is a still and the video plays on a click.
 * - Without JavaScript the preview is a plain link to the video on Loom; modified clicks still open it there.
 * - Once mounted the player stays, so scrolling away and back never restarts it.
 *
 * The embed URL needs `autoplay=1` (a bare /embed/ link was measured not to autoplay) and the frame needs
 * `allow="autoplay"`, or the URL is ignored. The hide_* parameters drop Loom's title and share bar. `scene_player`
 * (read by Loom's embed script, not in its docs) swaps the reactions-and-comment bar, which otherwise takes ~60px
 * of the frame's height and pillarboxes the 16:9 video, for slim overlaid controls (pause, sound, scrubber, full
 * screen). If Loom drops it, the default player comes back, letterboxed but working.
 *
 * Focus guard. Loom's player takes focus twice unasked: about three seconds after it loads (after which Space and the
 * arrows drive the player instead of scrolling the page), and when the video ends, when its end card focuses a
 * "Reply" box, which scrolls the page back to the player from wherever the reader is. So focus that lands on the
 * frame without the reader's consent is handed back and the scroll restored. Consent is a Tab press in the last
 * 250 ms, the pointer over the frame, the click that started it, or on a touch screen the frame being on screen (a tap
 * inside a cross-origin frame reaches this page as nothing at all). A cross-origin frame taking focus fires no event
 * here, so the guard compares document.activeElement once per animation frame; the parent's scroll can land a frame or
 * two late, so it keeps restoring it for 400 ms after a hand-back unless the reader does something; and it gives up
 * after 12 hand-backs per on-screen spell rather than fight the player forever.
 */

const START_THRESHOLD = 0.4;
const START_DWELL_MS = 300;
const TAB_GRACE_MS = 250;
const SETTLE_MS = 400;
const MAX_CORRECTIONS = 12;
const ALLOW = 'autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write';

/** `https://www.loom.com/share/<id>` → the embed URL, or null for anything that isn't a Loom share link. */
function embedUrl(share: string, muted: boolean): string | null {
  let url: URL;
  try {
    url = new URL(share);
  } catch {
    return null;
  }
  if (!/(^|\.)loom\.com$/.test(url.hostname) || !url.pathname.startsWith('/share/')) return null;
  url.pathname = url.pathname.replace(/^\/share\//, '/embed/');
  const params: Record<string, string> = {
    autoplay: '1',
    hideEmbedTopBar: 'true',
    hide_owner: 'true',
    hide_share: 'true',
    hide_title: 'true',
    scene_player: 'true',
  };
  if (muted) params.muted = 'true';
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

export function initVideo(root: HTMLElement): void {
  const frame = root.querySelector<HTMLElement>('.tm-frame');
  const start = root.querySelector<HTMLAnchorElement>('.tm-start');
  const title = root.querySelector<HTMLElement>('.tm-video-title')?.textContent?.trim() || 'Video';
  if (!frame || !start || !embedUrl(start.href, true)) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let player: HTMLIFrameElement | null = null;
  let consentUntil = 0;

  const mount = (withSound: boolean): void => {
    if (player) return;
    const src = embedUrl(start.href, !withSound);
    if (!src) return;
    stopWatching();
    player = document.createElement('iframe');
    player.src = src;
    player.title = title;
    player.allow = ALLOW;
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    const hadFocus = document.activeElement === start;
    frame.append(player);
    // The reader started it (or was sitting on it): focus follows into the player.
    if (withSound || hadFocus) {
      consentUntil = performance.now() + 1000;
      player.focus();
    }
    start.hidden = true;
    guard(player, () => performance.now() < consentUntil);
  };

  start.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    mount(true);
  });

  // Scroll trigger: the frame itself in view for a beat, then mount, once. The frame is measured again when the beat
  // ends, because on a busy main thread the observer's "gone again" report can arrive after the timer.
  const inView = (): boolean => {
    const r = frame.getBoundingClientRect();
    const seen = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    return r.height > 0 && seen / r.height >= START_THRESHOLD;
  };
  let dwell = 0;
  const io = new IntersectionObserver(
    (entries) => {
      window.clearTimeout(dwell);
      if (!entries.some((en) => en.intersectionRatio >= START_THRESHOLD)) return;
      dwell = window.setTimeout(() => inView() && mount(false), START_DWELL_MS);
    },
    { threshold: [0, START_THRESHOLD] },
  );
  const watch = (): void => {
    if (!player && !motion.matches) io.observe(frame);
  };
  function stopWatching(): void {
    window.clearTimeout(dwell);
    io.disconnect();
  }
  const onMotion = (): void => {
    stopWatching();
    watch();
  };
  motion.addEventListener('change', onMotion);
  watch();
}

/** Hand focus back to the page when the player takes it without the reader's consent (see the header). */
function guard(frame: HTMLIFrameElement, startedByReader: () => boolean): void {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  let visible = false;
  let corrections = 0;
  let settleUntil = 0;
  let lastTabAt = Number.NEGATIVE_INFINITY;
  let restX = window.scrollX, restY = window.scrollY;
  let lastX = restX, lastY = restY;
  let yielded = false;
  let pointerOver = false;

  frame.addEventListener('pointerenter', () => (pointerOver = true));
  frame.addEventListener('pointerleave', () => (pointerOver = false));
  const opts = { capture: true, passive: true } as const;
  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Tab') lastTabAt = performance.now();
      settleUntil = 0;
    },
    opts,
  );
  for (const type of ['pointerdown', 'touchstart', 'wheel'] as const) window.addEventListener(type, () => (settleUntil = 0), opts);

  const onScreenNow = (): boolean => {
    const r = frame.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  };

  const handBack = (): void => {
    frame.blur();
    // blur() alone can leave activeElement on the frame; a momentarily focusable <body> parks focus at the top of the
    // tab order without inventing a visible target.
    if (document.activeElement === frame) {
      const body = document.body;
      const had = body.hasAttribute('tabindex');
      if (!had) body.setAttribute('tabindex', '-1');
      body.focus({ preventScroll: true });
      if (!had) body.removeAttribute('tabindex');
    }
  };
  const restore = (): void => window.scrollTo({ left: restX, top: restY, behavior: 'instant' });

  const tick = (): void => {
    requestAnimationFrame(tick);
    const now = performance.now();
    const x = window.scrollX, y = window.scrollY;
    const moved = x !== lastX || y !== lastY;
    lastX = x;
    lastY = y;

    if (document.activeElement !== frame) {
      yielded = false;
      if (now < settleUntil) {
        if (x !== restX || y !== restY) restore();
      } else {
        restX = x;
        restY = y;
      }
      return;
    }
    if (yielded) return;

    const tabbed = now - lastTabAt < TAB_GRACE_MS;
    const touched = coarse && (visible || (!moved && onScreenNow()));
    if (startedByReader() || tabbed || pointerOver || touched || corrections >= MAX_CORRECTIONS) {
      yielded = true;
      return;
    }
    corrections += 1;
    handBack();
    restore();
    settleUntil = now + SETTLE_MS;
  };

  new IntersectionObserver(
    (entries) => {
      visible = entries.some((en) => en.isIntersecting);
      // Each on-screen spell gets a fresh allowance of hand-backs.
      if (visible) {
        corrections = 0;
        return;
      }
      // Scrolled away with focus still in the player: give the page its keys back, so the end card's later grab is a
      // fresh steal rather than an invisible move inside a focused frame.
      if (document.activeElement === frame) handBack();
    },
    { threshold: 0.1 },
  ).observe(frame);
  requestAnimationFrame(tick);
}
