'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface RenderBoundaryProps {
  children: ReactNode;
  /**
   * Called when a draft renders successfully after having failed, and when it
   * throws. `problems` is empty on recovery.
   */
  onRenderError: (problems: readonly string[]) => void;
  /**
   * Changes whenever a new draft arrives. Used as the reset key: a fresh draft
   * gets a fresh attempt rather than being stuck behind the last failure.
   */
  resetKey: number;
}

interface RenderBoundaryState {
  failedAt: number | null;
}

function describeRenderError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `The page could not be drawn with this content — ${message}`;
}

/**
 * Catches a render-time throw from `<PageView>` on the `/preview` route.
 *
 * `parseContent` validates everything it can, but a value that survives Zod and
 * the cross-document checks can still throw inside a component during render.
 * Without a boundary that throw escapes the `try/catch` around `setContent` —
 * because `setContent` only *schedules* a render — so the editor is told
 * `wsmath:rendered`, and the iframe then dies with "This page couldn't load".
 * A false success followed by a blank frame is the worst possible outcome for
 * an editor: it looks like the draft is fine.
 *
 * On a throw this reports the message through `onRenderError` (which posts
 * `wsmath:error`) and renders nothing, so the failure strip is what remains
 * visible. A new draft resets the boundary via `resetKey`.
 */
export class RenderBoundary extends Component<RenderBoundaryProps, RenderBoundaryState> {
  state: RenderBoundaryState = { failedAt: null };

  static getDerivedStateFromError(): RenderBoundaryState {
    // Marked non-null so `render` stops re-throwing; the real value is written
    // in `componentDidCatch`, which knows the current resetKey.
    return { failedAt: -1 };
  }

  componentDidUpdate(prevProps: RenderBoundaryProps): void {
    // A new draft arrived: clear the failure so it gets a fresh attempt.
    if (prevProps.resetKey !== this.props.resetKey && this.state.failedAt !== null) {
      this.setState({ failedAt: null });
    }
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    // Surfaced to the editor, and left in the console for whoever is debugging
    // the draft in the frame. Never swallowed silently.
    console.error('preview render failed', error, info.componentStack);
    this.setState({ failedAt: this.props.resetKey });
    this.props.onRenderError([describeRenderError(error)]);
  }

  render(): ReactNode {
    if (this.state.failedAt !== null) return null;
    return this.props.children;
  }
}
