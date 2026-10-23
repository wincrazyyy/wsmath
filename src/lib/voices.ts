import type { Voice } from '../content/types';

/** `alice-gao-2022`: names the student's photo (src/assets/avatars) and the dialog holding their full testimonial. */
export const voiceSlug = (v: Voice): string => v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + v.year;

/** The card's quote marks: corner brackets for Chinese, curly quotes for English. */
export const quoted = (v: Voice, text: string): string => (v.lang === 'en' ? '“' + text + '”' : '「' + text + '」');
