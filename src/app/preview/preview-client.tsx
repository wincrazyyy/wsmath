'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';

import { PageView } from '@/components/page-view';
import { RenderBoundary } from './render-boundary';
import { CONTENT_DOCUMENT_KEYS, CONTENT_DOCUMENTS } from '@/content/schema';
import { ContentError, parseContent, type RawContentFiles, type SiteContent } from '@/lib/content';
import { TokenError } from '@/lib/tokens';

/**
 * The live-preview client (editor contract §3.3).
 *
 * ─────────────────────────── the message contract ───────────────────────────
 *
 * editor → preview
 *   { type: 'wsmath:content', files: RawContentFiles }
 *       One raw, unvalidated JSON document per file in `src/content/`, keyed by
 *       the property names in `content.schema.json`. The whole set, every time:
 *       validation is cross-document, so a partial draft cannot be checked.
 *
 * preview → editor (posted to `window.parent`)
 *   { type: 'wsmath:ready', documents: string[] }
 *       On mount. `documents` lists the keys this build expects, so the editor
 *       can tell an out-of-date preview from a malformed draft.
 *   { type: 'wsmath:rendered' }
 *       A draft validated and is now on screen.
 *   { type: 'wsmath:error', problems: string[] }
 *       A draft failed. The previous render is still on screen — the client
 *       keeps seeing their last good page while they fix the field.
 *
 * **Ordering.** `wsmath:rendered` is posted when a draft passes `parseContent`,
 * which is before React has finished drawing it. If the draft then throws
 * during render, `RenderBoundary` catches it and posts `wsmath:error`
 * afterwards. A consumer must therefore treat the *last* message for a draft as
 * authoritative, not the first. The alternative — a `rendered` that is never
 * corrected, followed by a blank iframe — is how an editor gets told a broken
 * draft is fine.
 *
 * **Origin.** Set `NEXT_PUBLIC_EDITOR_ORIGIN` and only that origin may post a
 * draft. Leave it unset and any origin may — which is what the editor-less
 * workflow needs today, and is why the default is permissive rather than
 * closed. A null-origin `srcdoc` iframe can otherwise repaint this page with an
 * injected payload; harmless while the preview stands alone, not harmless once
 * the editor frames it beside an authenticated editing session, because a
 * spoofed preview is how a client gets shown copy that will not deploy.
 *
 * Making it configuration rather than code means the editor launch is an env
 * var, not a rebuild. `.env.example` documents it alongside
 * `NEXT_PUBLIC_CTA_ENDPOINT`, which already follows this set-it-later pattern.
 */

/**
 * The single origin allowed to post a draft, or `''` for "any origin".
 * Read at module scope: `NEXT_PUBLIC_*` is inlined at build time, so this is a
 * constant in the bundle, not a runtime lookup.
 */
const EDITOR_ORIGIN = process.env.NEXT_PUBLIC_EDITOR_ORIGIN ?? '';

const CONTENT_MESSAGE = 'wsmath:content';
const READY_MESSAGE = 'wsmath:ready';
const RENDERED_MESSAGE = 'wsmath:rendered';
const ERROR_MESSAGE = 'wsmath:error';

interface ContentMessage {
  readonly type: typeof CONTENT_MESSAGE;
  readonly files: RawContentFiles;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Strict shape check. Anything that is not this exact envelope — a React
 * DevTools handshake, a Next.js dev-server ping, a stray frame — is ignored
 * without a trace.
 */
function isContentMessage(data: unknown): data is ContentMessage {
  if (!isRecord(data) || data.type !== CONTENT_MESSAGE) return false;
  const { files } = data;
  if (!isRecord(files)) return false;
  return CONTENT_DOCUMENT_KEYS.every((key) => files[key] !== undefined);
}

/** Turn whatever `parseContent` threw into a list a non-technical reader can act on. */
function describe(error: unknown): string[] {
  if (error instanceof ContentError) {
    return error.problems.length > 0 ? [...error.problems] : [error.message];
  }
  if (error instanceof TokenError) {
    return [`${error.location} → ${error.message}`];
  }
  if (error instanceof Error) return [error.message];
  return [String(error)];
}

function post(message: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  // Any origin: see the note above. Nothing sent back is sensitive — it is the
  // same content the page already renders in public.
  window.parent.postMessage(message, '*');
}

/**
 * The failure strip.
 *
 * Inline styles rather than a stylesheet: this belongs to the editor's editing
 * loop, never to the published page, and giving it a class in the design system
 * would invite it into a section. Colours still come from the tokens.
 */
const STRIP: CSSProperties = {
  position: 'fixed',
  insetInline: 0,
  bottom: 0,
  zIndex: 9999,
  maxHeight: '46vh',
  overflowY: 'auto',
  /* Extra left padding: a browser or dev-tools badge parks itself in that
     corner, and it must not sit on top of the first word of a problem. */
  padding: '14px 20px 16px 30px',
  background: 'var(--ink)',
  color: 'var(--paper)',
  borderTop: '3px solid var(--blue)',
  font: '500 12px/1.55 var(--mono)',
  letterSpacing: '.02em',
};

const STRIP_TITLE: CSSProperties = {
  margin: '0 0 8px',
  font: 'inherit',
  textTransform: 'uppercase',
  letterSpacing: '.14em',
  color: 'var(--paper-3)',
};

const STRIP_LIST: CSSProperties = {
  margin: 0,
  paddingLeft: '18px',
  display: 'grid',
  gap: '4px',
};

export interface PreviewClientProps {
  /** The published content, already parsed on the server. The baseline a draft replaces. */
  initial: SiteContent;
}

export function PreviewClient({ initial }: PreviewClientProps) {
  const [content, setContent] = useState<SiteContent>(initial);
  const [problems, setProblems] = useState<readonly string[]>([]);
  /** Bumped per accepted draft; resets the render boundary. */
  const [draft, setDraft] = useState(0);

  const onRenderError = useCallback((found: readonly string[]) => {
    setProblems(found);
    post({ type: ERROR_MESSAGE, problems: [...found] });
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent<unknown>): void {
      // Empty or unset: accept any origin (today's editor-less workflow).
      // Set: accept that origin only.
      if (EDITOR_ORIGIN !== '' && event.origin !== EDITOR_ORIGIN) return;
      if (!isContentMessage(event.data)) return;

      try {
        const next = parseContent(event.data.files);
        setContent(next);
        setProblems([]);
        setDraft((n) => n + 1);
        post({ type: RENDERED_MESSAGE });
      } catch (error) {
        // The last good render stays on screen: only the strip changes.
        const found = describe(error);
        setProblems(found);
        post({ type: ERROR_MESSAGE, problems: found });
      }
    }

    window.addEventListener('message', onMessage);
    post({ type: READY_MESSAGE, documents: [...CONTENT_DOCUMENT_KEYS] });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <>
      <RenderBoundary resetKey={draft} onRenderError={onRenderError}>
        <PageView content={content} />
      </RenderBoundary>
      {problems.length === 0 ? null : (
        <aside style={STRIP} role="status" aria-live="polite">
          <p style={STRIP_TITLE}>
            {problems.length === 1
              ? 'This draft has 1 problem — showing the last version that worked'
              : `This draft has ${problems.length} problems — showing the last version that worked`}
          </p>
          <ul style={STRIP_LIST}>
            {/* Two fields can fail the same way, so the position is part of
                the key — a plain message would collide. */}
            {problems.map((problem, index) => (
              <li key={`${index}-${problem}`}>{problem}</li>
            ))}
          </ul>
        </aside>
      )}
    </>
  );
}

/** Exported so the editor spec and this file cannot drift over the file list. */
export const PREVIEW_DOCUMENTS = CONTENT_DOCUMENT_KEYS.map((key) => ({
  key,
  file: CONTENT_DOCUMENTS[key].file,
  title: CONTENT_DOCUMENTS[key].title,
}));
