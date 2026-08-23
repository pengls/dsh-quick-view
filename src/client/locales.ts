/**
 * dsh-quick-view locale dictionaries. English-first per this plugin's release
 * stance; Chinese mirrors the same keys so a Chinese session reads naturally.
 */

/** Dictionary keys for the quick-view navigator. */
export type QuickViewKey =
  | 'title'
  | 'jump'
  | 'empty'

/** English dictionary (authoritative copy; falls back here for missing locales). */
export const en: Record<QuickViewKey, string> = {
  title: 'Previous inputs',
  jump: 'Jump to',
  empty: '(empty)',
}

/** Chinese dictionary (parallel to English; same key set). */
export const zh: Record<QuickViewKey, string> = {
  title: '之前的输入',
  jump: '跳转到',
  empty: '（空）',
}

/** Namespace registered by this plugin. */
export const NS = 'quickView'
