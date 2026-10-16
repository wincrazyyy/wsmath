/*
 * The FAQ controller: every click on a question (summary onClick="{{faqSpin}}", template L452–480) adds a full turn
 * to the question mark (_faqSpin, home.js L143). The answers themselves are native <details>, so Enter and Space on
 * a focused summary open them and fire the same click.
 */
import { initFaqCanvas } from '../canvases/faq';

export function initFaq(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('#faq-canvas');
  if (!canvas) return;
  const mark = initFaqCanvas(canvas);
  root.querySelectorAll<HTMLElement>('summary.faq-q').forEach((s) => s.addEventListener('click', () => mark.spin()));
}
