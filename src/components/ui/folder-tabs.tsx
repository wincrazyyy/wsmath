'use client';

import { useCallback, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export interface FolderTabItem {
  /** Stable id; keys the matching entry in `panels`. */
  id: string;
  /** Visible tab content — the results tabs render `<b>` + spans inside. */
  label: ReactNode;
}

export interface FolderTabsProps {
  /** Tabs, in display order. */
  items: FolderTabItem[];
  /** Panel content by item id. Server-rendered nodes are used as-is. */
  panels: Record<string, ReactNode>;
  /** Accessible name for the tablist, e.g. `Result groups` (from content). */
  ariaLabel: string;
  /** Initially selected tab. Defaults to the first item. */
  defaultId?: string;
  /** Classes on the tablist element, e.g. `mvt-res-tabs mvt-rev mvt-rev--s`. */
  listClassName?: string;
  /** Classes on each tab button, e.g. `mvt-res-tab`. */
  tabClassName?: string;
  /** Classes on each tabpanel element. */
  panelClassName?: string;
  /** Called after a tab is selected — the results section rebuilds its stream here. */
  onSelect?: (id: string) => void;
  /**
   * Prefix for the generated element ids. Defaults to a `useId()` value, which
   * is unique per instance and stable across SSR and hydration.
   */
  idPrefix?: string;
}

/**
 * A real APG tab strip in the mvt- vocabulary: roving tabindex,
 * `ArrowLeft`/`ArrowUp` and `ArrowRight`/`ArrowDown` wrap, `Home`/`End` jump
 * (arrows and Home/End also move focus; click selects without forcing focus —
 * behaviours.md §6).
 *
 * **Every panel is rendered into the HTML**, hidden ones included, so the
 * content exists without JavaScript and for crawlers. Panel nodes are passed
 * through by reference and never cloned, so switching tabs does not re-render
 * their subtrees.
 */
export function FolderTabs({
  items,
  panels,
  ariaLabel,
  defaultId,
  listClassName,
  tabClassName,
  panelClassName,
  onSelect,
  idPrefix,
}: FolderTabsProps) {
  const autoId = useId();
  const base = idPrefix ?? autoId;
  const first = items[0]?.id ?? '';
  const initial = defaultId !== undefined && items.some((i) => i.id === defaultId) ? defaultId : first;

  const [active, setActive] = useState(initial);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const tabId = (id: string) => `${base}-tab-${id}`;
  const panelId = (id: string) => `${base}-panel-${id}`;

  const select = useCallback(
    (id: string, focus: boolean) => {
      setActive(id);
      if (focus) tabRefs.current.get(id)?.focus();
      onSelect?.(id);
    },
    [onSelect],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    if (next === null) return;
    const target = items[next];
    if (!target) return;
    event.preventDefault();
    select(target.id, true);
  };

  return (
    <>
      <div className={listClassName} role="tablist" aria-label={ariaLabel}>
        {items.map((item, index) => {
          const on = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              className={tabClassName}
              role="tab"
              id={tabId(item.id)}
              aria-controls={panelId(item.id)}
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => select(item.id, false)}
              onKeyDown={(event) => onKeyDown(event, index)}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const on = item.id === active;
        return (
          <div
            key={item.id}
            className={panelClassName}
            id={panelId(item.id)}
            role="tabpanel"
            aria-labelledby={tabId(item.id)}
            tabIndex={0}
            hidden={!on}
          >
            {panels[item.id]}
          </div>
        );
      })}
    </>
  );
}
