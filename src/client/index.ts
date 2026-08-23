/**
 * dsh-quick-view, browser half: registers the right-side QuickView navigator
 * into the `conversation.session.header.utilities` slot that ui-conversation
 * declares. The entry is a list occupant of that utility zone (right-aligned
 * session utilities), rendered beside the session title.
 *
 * The panel reads the conversation snapshot through the framework session kit
 * (`useSession`) — no business data layer, no host service. User messages are
 * the `user` Chat Nodes; selecting one scrolls the transcript scrollport to it.
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the ui-conversation SlotMap merge (the utilities entry).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { QuickViewKey } from './locales.ts'
import { en, zh } from './locales.ts'
import { QuickViewPanel } from './QuickViewPanel.tsx'

export type { QuickViewKey } from './locales.ts'
export type { QuickViewPanelProps } from './QuickViewPanel.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The quick-view navigator's copy. */
    'quickView': QuickViewKey
  }
}

/** Dictionary namespace owned by this plugin. */
export const NS = 'quickView'

/** Required services: the slot registry and the navigator's copy. */
export const inject = ['slots', 'locale']

/**
 * Client plugin body: register the navigator dictionaries and the panel entry.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-quick-view: dictionaries')

  // ui-conversation declares the 'conversation.session.header.utilities' list
  // slot; inject() waits on that declaration so activation order is free.
  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register(
    { name: 'conversation.session.header.utilities', id: NS, order: 0, locale: NS },
    QuickViewPanel,
  ))
}
