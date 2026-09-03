import type { SVGProps } from 'react';

/**
 * The v6.3.2 icon set, transcribed from the artifact's inline SVGs
 * (v6-3-2.html — the WhatsApp glyph at every CTA, the trough pause/play pair,
 * the FAQ chevron, the videoband play triangle, the footer 小紅書 tile).
 *
 * Sizing is deliberately left to the consuming stylesheet, exactly as in the
 * artifact (`.mvt-coin-dot svg { width:15px }`, `.mvt-coin svg { width:22px }`).
 * Pass `width`/`height` explicitly if an icon is used outside a sized context.
 */
export type IconProps = SVGProps<SVGSVGElement>;

const defaults = {
  'aria-hidden': true,
  focusable: 'false',
} as const;

/**
 * The WhatsApp glyph, path data verbatim from the artifact. Fill is inherited —
 * the artifact colours it via `.mvt-coin-dot svg { fill: var(--wa) }` and the
 * coin's own rule. NEVER on brass directly; always on a `--lac-void` disc.
 */
export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaults} {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}

/** Pause bars for the trough control (artifact `#mvt-pause-ico`). */
export function PauseBars(props: IconProps) {
  return (
    <svg viewBox="0 0 14 14" {...defaults} {...props}>
      <rect x="2" y="1" width="3.4" height="12" rx="1" />
      <rect x="8.6" y="1" width="3.4" height="12" rx="1" />
    </svg>
  );
}

/** Play triangle at the trough control's scale (swapped in for the bars). */
export function PlayTriangle(props: IconProps) {
  return (
    <svg viewBox="0 0 14 14" {...defaults} {...props}>
      <path d="M3 1 12.5 7 3 13Z" />
    </svg>
  );
}

/** The videoband's larger play triangle (artifact line 2056). */
export function PlayGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...defaults} {...props}>
      <path d="M5 2.5 20.5 12 5 21.5Z" />
    </svg>
  );
}

/**
 * Four arrows pointing out of a box — the "open at full size" affordance on the
 * course-outline viewer's stage. Stroked, not filled: the consuming rule sets
 * `fill:none; stroke:currentColor`, so it reads as an engraved mark rather than
 * a solid one.
 */
export function ExpandGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...defaults} {...props}>
      <path d="M9.5 1.5h5v5M14.5 1.5 9 7M6.5 14.5h-5v-5M1.5 14.5 7 9" />
    </svg>
  );
}

/** FAQ chevron (artifact `.mvt-chev`). Stroke/fill are styled by the consumer. */
export function Chevron(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...defaults} {...props}>
      <path d="M3 6 8 11 13 6" />
    </svg>
  );
}

/**
 * The footer's 小紅書 tile, verbatim from the artifact: a carmine `--ca` tile
 * (the only carmine outside the ribbon system) carrying the 红 character in the
 * Hans stack. Colours are fixed by the design, not inherited.
 */
export function XhsTile(props: IconProps) {
  return (
    <svg viewBox="0 0 22 16" {...defaults} {...props}>
      <rect x="0" y="0" width="22" height="16" rx="3" fill="#cc3148" />
      <text
        x="11"
        y="12"
        textAnchor="middle"
        fontSize="11"
        lang="zh-Hans"
        fontFamily="Microsoft YaHei, PingFang SC, Microsoft JhengHei, PingFang HK, sans-serif"
        fill="#f7f3e9"
      >
        红
      </text>
    </svg>
  );
}

/**
 * 小紅書 (XiaoHongShu) drawn as a little red book — kept because lucide has no
 * XiaoHongShu mark (docs/03 §3). The v6.3.2 footer uses {@link XhsTile}; this
 * glyph remains available for contexts that need a `currentColor` mark.
 */
export function Xhs(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...defaults} {...props}>
      <rect x="2.4" y="2" width="11.2" height="12" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.4 2v12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 2v5.1l1.8-1.2L12.6 7.1V2Z" fill="currentColor" />
    </svg>
  );
}
