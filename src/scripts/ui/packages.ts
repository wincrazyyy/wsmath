/*
 * The video class packages, ported from renderVals (home.js L41–117): _colEnter, _chipGo, _topicGo, _tilt / _untilt
 * (_tiltCover, L734–747), _pkTabGo, _bannerEnter and _bannerLeave.
 *
 * State, as in the reference: per card the chosen course (sel) and topic (tp), the card being looked at (focus,
 * IBDP by default), the ≤900 tab (pkTab) and whether the one-to-one banner is pointed at (ringOn). As in the
 * reference, choosing a course keeps the card's topic index and only clamps it to the new course's topic count when
 * displayed, so switching back restores it.
 *
 * DOM updates go through the hooks left in Packages.astro (data-pk fields, #pk-topic-tpl, #pk-perk-tpl); every
 * text comes from #pk-data. canvases/packages.ts reads the state and redraws through onChange.
 */
import { reducedMotion } from '../lib/motion';

export interface PkTopic {
  num: string;
  label: string;
  title: string;
  text: string;
}

export interface PkCourse {
  name: string;
  topicsLabel: string;
  pdfPage: number;
  when: [string, string];
  perks: string[];
  price: string;
  was: string;
  whatsapp: string;
  topics: PkTopic[];
}

export interface PkCard {
  key: string;
  shape: string;
  pdf: string;
  courses: PkCourse[];
}

export interface PkData {
  tab: number;
  cards: PkCard[];
}

export interface Packages {
  readonly data: PkData;
  /** Card being looked at (the light runs on its model). */
  readonly focus: number;
  /** The one-to-one banner is pointed at (the rings turn faster). */
  readonly ringOn: boolean;
  /** Displayed course index of card i (clamped, as renderVals does). */
  course(i: number): number;
  /** Displayed topic index of card i (clamped to the course's topics). */
  topic(i: number): number;
  /** Run after every state change. */
  onChange(fn: () => void): void;
}

/** Lean of each cover at rest, by display index (col.ry). */
const RY0 = [12, 0, -12];

const fieldAll = <T extends Element>(card: Element, name: string): T[] => Array.from(card.querySelectorAll<T>(`[data-pk="${name}"]`));
const field = <T extends Element>(card: Element, name: string): T | null => card.querySelector<T>(`[data-pk="${name}"]`);

/** Set the text after a leading element (caption title span, "Was " span), as one text node. */
function setTail(el: Element | null, text: string): void {
  const head = el?.firstElementChild;
  if (!el || !head) return;
  const tail = head.nextSibling;
  if (tail && tail.nodeType === Node.TEXT_NODE && !tail.nextSibling) {
    if (tail.nodeValue !== text) tail.nodeValue = text;
    return;
  }
  while (head.nextSibling) head.nextSibling.remove();
  el.appendChild(document.createTextNode(text));
}

export function initPackages(root: HTMLElement): Packages | null {
  const json = root.querySelector('#pk-data');
  const topicTpl = root.querySelector<HTMLTemplateElement>('#pk-topic-tpl');
  const perkTpl = root.querySelector<HTMLTemplateElement>('#pk-perk-tpl');
  if (!json || !topicTpl || !perkTpl) return null;
  let data: PkData;
  try {
    data = JSON.parse(json.textContent || '') as PkData;
  } catch {
    return null;
  }
  const cols = Array.from(root.querySelectorAll<HTMLElement>('article.pk-col[data-card]'));
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('.pk-tabs [data-card]'));
  if (!cols.length) return null;

  const n = data.cards.length;
  const sel: number[] = new Array(n).fill(0);
  const tp: number[] = new Array(n).fill(0);
  let focus = 1;
  let pkTab = data.tab;
  let ringOn = false;
  const listeners: (() => void)[] = [];
  const changed = (): void => listeners.forEach((fn) => fn());

  const colOf = (i: number): HTMLElement | undefined => cols.find((c) => Number(c.dataset.card) === i);
  const course = (i: number): number => Math.min(data.cards[i].courses.length - 1, sel[i] || 0);
  const courseData = (i: number): PkCourse => data.cards[i].courses[course(i)];
  const topic = (i: number): number => Math.min(courseData(i).topics.length - 1, tp[i] || 0);

  // --- Topics -----------------------------------------------------------------------------------------------------

  function topicGo(i: number, j: number): void {
    if (tp[i] === j && focus === i) return;
    tp[i] = j;
    focus = i;
    renderTopics(i);
    changed();
  }

  function bindTopic(btn: HTMLButtonElement, i: number): void {
    const go = (): void => topicGo(i, Number(btn.dataset.topic));
    btn.addEventListener('click', go);
    btn.addEventListener('mouseenter', go);
    btn.addEventListener('focus', go);
  }

  /** Make the topic rows match the course (count, numbers, labels, label ids), then mark the selection. */
  function syncTopicRows(i: number): void {
    const col = colOf(i), group = col && field<HTMLElement>(col, 'topics');
    if (!group) return;
    const C = courseData(i);
    group.setAttribute('aria-label', C.topicsLabel);
    let rows = Array.from(group.querySelectorAll<HTMLButtonElement>('.pk-topic'));
    for (let j = rows.length; j < C.topics.length; j++) {
      const frag = topicTpl!.content.cloneNode(true) as DocumentFragment;
      const btn = frag.querySelector<HTMLButtonElement>('.pk-topic');
      if (!btn) return;
      btn.dataset.topic = String(j);
      bindTopic(btn, i);
      group.appendChild(btn);
    }
    rows = Array.from(group.querySelectorAll<HTMLButtonElement>('.pk-topic'));
    rows.slice(C.topics.length).forEach((b) => b.remove());
    C.topics.forEach((T, j) => {
      const btn = rows[j], spans = btn.querySelectorAll<HTMLSpanElement>(':scope > span');
      btn.dataset.topic = String(j);
      if (spans[0] && spans[0].textContent !== T.num) spans[0].textContent = T.num;
      if (spans[1]) {
        spans[1].id = `pk-tl-${i}-${j}`;
        if (spans[1].textContent !== T.label) spans[1].textContent = T.label;
      }
    });
  }

  /** Selected topic: aria-pressed and the caption. */
  function renderTopics(i: number): void {
    const col = colOf(i), group = col && field<HTMLElement>(col, 'topics');
    if (!col || !group) return;
    const C = courseData(i), act = topic(i), T = C.topics[act];
    group.querySelectorAll<HTMLButtonElement>('.pk-topic').forEach((b, j) => b.setAttribute('aria-pressed', String(j === act)));
    const cap = field<HTMLElement>(col, 'cap');
    const title = cap?.firstElementChild;
    if (title) title.textContent = T.title + '.';
    setTail(cap, ' ' + T.text);
  }

  // --- Courses ----------------------------------------------------------------------------------------------------

  function renderCourse(i: number): void {
    const col = colOf(i);
    if (!col) return;
    const P = data.cards[i], k = course(i), C = P.courses[k];
    field(col, 'courses')
      ?.querySelectorAll<HTMLButtonElement>('[data-course]')
      .forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.course) === k)));
    fieldAll<HTMLAnchorElement>(col, 'pdf').forEach((a) => a.setAttribute('href', P.pdf + '#page=' + C.pdfPage));
    const text = (name: string, value: string): void => {
      const el = field(col, name);
      if (el && el.textContent !== value) el.textContent = value;
    };
    text('name', C.name);
    text('when1', C.when[0]);
    text('when2', C.when[1]);
    text('price', C.price);
    setTail(field(col, 'was'), C.was);
    field(col, 'enrol')?.setAttribute('href', C.whatsapp);

    const list = field<HTMLUListElement>(col, 'perks');
    if (list) {
      let items = Array.from(list.querySelectorAll<HTMLLIElement>(':scope > li'));
      for (let j = items.length; j < C.perks.length; j++) {
        const li = (perkTpl!.content.cloneNode(true) as DocumentFragment).querySelector('li');
        if (li) list.appendChild(li);
      }
      items = Array.from(list.querySelectorAll<HTMLLIElement>(':scope > li'));
      items.slice(C.perks.length).forEach((li) => li.remove());
      C.perks.forEach((p, j) => {
        const span = items[j]?.lastElementChild;
        if (span && span.textContent !== p) span.textContent = p;
      });
    }

    syncTopicRows(i);
    renderTopics(i);
  }

  function chipGo(i: number, k: number): void {
    if ((sel[i] || 0) === k) return;
    sel[i] = k;
    focus = i;
    renderCourse(i);
    changed();
  }

  // --- Cover tilt (_tiltCover) ------------------------------------------------------------------------------------

  function tilt(i: number, e: PointerEvent | null): void {
    const img = document.getElementById('pk-cover-' + i);
    if (!img) return;
    if (!e) {
      ['--ry', '--rx', '--tz'].forEach((p) => img.style.removeProperty(p));
      return;
    }
    if (reducedMotion()) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    const py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    img.style.setProperty('--ry', (RY0[i] * 0.4 + px * 14).toFixed(2) + 'deg');
    img.style.setProperty('--rx', (5 - py * 12).toFixed(2) + 'deg');
    img.style.setProperty('--tz', '28px');
  }

  // --- Wiring -----------------------------------------------------------------------------------------------------

  cols.forEach((col) => {
    const i = Number(col.dataset.card);
    if (!data.cards[i]) return;
    col.addEventListener('mouseenter', () => {
      if (focus === i) return;
      focus = i;
      changed();
    });
    field(col, 'courses')
      ?.querySelectorAll<HTMLButtonElement>('[data-course]')
      .forEach((b) => b.addEventListener('click', () => chipGo(i, Number(b.dataset.course))));
    field(col, 'topics')
      ?.querySelectorAll<HTMLButtonElement>('.pk-topic')
      .forEach((b) => bindTopic(b, i));
    const cover = col.querySelector<HTMLAnchorElement>('.pk-cover');
    if (cover) {
      cover.addEventListener('pointermove', (e) => tilt(i, e));
      cover.addEventListener('pointerleave', () => tilt(i, null));
    }
  });

  tabs.forEach((b) => {
    const i = Number(b.dataset.card);
    b.addEventListener('click', () => {
      if (pkTab === i) return;
      pkTab = i;
      focus = i;
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(Number(t.dataset.card) === i)));
      cols.forEach((c) => c.classList.toggle('pk-shown', Number(c.dataset.card) === i));
      changed();
    });
  });

  const banner = root.querySelector<HTMLElement>('.pk-banner');
  if (banner) {
    banner.addEventListener('mouseenter', () => {
      if (ringOn) return;
      ringOn = true;
      changed();
    });
    banner.addEventListener('mouseleave', () => {
      if (!ringOn) return;
      ringOn = false;
      changed();
    });
  }

  return {
    data,
    get focus() {
      return focus;
    },
    get ringOn() {
      return ringOn;
    },
    course,
    topic,
    onChange(fn) {
      listeners.push(fn);
    },
  };
}
