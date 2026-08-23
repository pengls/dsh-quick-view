/**
 * QuickViewPanel: the right-side floating navigator over the conversation.
 *
 * Registered (by src/client/index.ts) as a list occupant of
 * `conversation.session.header.utilities`, a session-scoped slot the
 * ui-conversation bundle declares. It receives the framework session kit
 * (`useSession`) plus the `t` locale seat.
 *
 * One integrated panel: every user input is a row of `text + dash` on a single
 * line (conversation order, first at top). At rest the text is collapsed and
 * only the right-aligned dash column shows; hovering expands the text in from
 * the dash's left with a fade/slide, and a panel background fades in. Pointing
 * at a row lights its dash white; clicking it scrolls the transcript to that
 * message and marks the dash selected (blue). With zero or one user inputs the
 * whole surface is omitted.
 *
 * Portaled to document.body because the slot seat lives inside the conversation
 * column whose active-phase `overflow: hidden` would clip a `position: fixed`
 * child (and any ancestor transform would re-anchor it). Inline styles, since
 * an out-of-tree bundle builds with esbuild and has no repo CSS-module pipeline.
 */

import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { ContentBlock } from '@deepseek-ai/dsh-llm/types'
import type {
  PropsLocale, PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the ui-conversation SlotMap merge (the utilities entry).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {
  ConversationSnapshot,
} from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: ChatNode is a ui-conversation client export (the keyed Node union).
import type { ChatNode } from '@deepseek-ai/dsh-client-ui-conversation/client'

/** Full props of the quick-view entry: runtime share plus the locale seat. */
export type QuickViewPanelProps =
  PropsRuntime<'conversation.session.header.utilities'> & PropsLocale<'quickView'>

/** One navigable input, collapsed to a key + single-line preview. */
interface InputRow {
  readonly key: string
  readonly preview: string
}

/** Collapse one user message to a single-line preview for the list. */
function preview(content: readonly ContentBlock[]): string {
  const text = content
    .map(block => block.type === 'text' ? block.text : '')
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ')
  return text.length <= 80 ? text : `${text.slice(0, 80).trimEnd()}…`
}

/** Ordered user messages (conversation order) from the stable chat readers. */
function userMessages(
  order: ConversationSnapshot['chat']['order'],
  nodes: ConversationSnapshot['chat']['nodes'],
): readonly InputRow[] {
  const out: InputRow[] = []
  for (const key of order) {
    const node = nodes.get(key)
    // The store returns the base ChatConversationViewNode (data: unknown);
    // narrow on the discriminant, then widen to the keyed user Node to read
    // its content. Mirrors ChatNodeSeat's own cast.
    if (node !== undefined && node.kind === 'user') {
      out.push({ key, preview: preview((node as ChatNode<'user'>).data.content) })
    }
  }
  return out
}

/** Scroll the transcript scrollport so the anchored node is in view. */
function scrollToKey(key: string): void {
  // The scrollport is the active conversation column; the chat view stamps
  // data-chat-anchor-key on each rendered row. Fall back silently when the row
  // has not rendered yet (outside the loaded pagination window) rather than
  // jumping the scrollport to a guessed position.
  const scrollport = document.querySelector('[data-conversation-scroll]')
  if (scrollport === null) return
  const row = scrollport.querySelector<HTMLElement>(`[data-chat-anchor-key="${key}"]`)
  if (row === null) return
  // Upper-align the row just under the header plane so the message is the
  // clear focus.
  const top = row.getBoundingClientRect().top - scrollport.getBoundingClientRect().top
  scrollport.scrollTop += top - 64
}

/** Fixed anchor: right edge, vertically centered, right-anchored so the panel
 *  grows leftward as text expands. */
const anchorStyle: CSSProperties = {
  position: 'fixed',
  top: '50%',
  right: '16px',
  transform: 'translateY(-50%)',
  zIndex: 40,
}

/** The panel shell: constant padding keeps the dashes from shifting when text
 *  expands; only background/border/shadow fade in on hover. */
const panelBaseStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '10px',
  borderRadius: '12px',
  border: '1px solid transparent',
  background: 'transparent',
  transition: 'background 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
}

/** Expanded look: a visible card behind the rows. */
const panelOpenStyle: CSSProperties = {
  border: '1px solid rgba(127,127,127,0.35)',
  background: 'var(--dsw-surface, rgba(28,28,31,0.94))',
  boxShadow: '0 10px 32px rgba(0,0,0,0.45)',
}

/** One row = text + dash on one line; fixed height keeps dashes stable. */
const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '10px',
  minHeight: '22px',
  border: 'none',
  borderRadius: '8px',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
}

/** The row while pointed at (soft box highlight). */
const rowHoverStyle: CSSProperties = {
  ...rowStyle,
  background: 'rgba(127,127,127,0.16)',
}

/** The row's text: collapses to nothing at rest, expands on hover. */
const textStyle: CSSProperties = {
  maxWidth: '0px',
  opacity: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  transition: 'max-width 180ms ease, opacity 180ms ease',
}

/** Expanded text: visible, up to a comfortable preview width. */
const textOpenStyle: CSSProperties = {
  maxWidth: '230px',
  opacity: 1,
}

/** Dash fill: selected = business blue, hovered = white, else dark gray. */
function dashColor(isSelected: boolean, isHovered: boolean): string {
  if (isHovered) return '#ffffff'
  return isSelected
    ? 'var(--dsw-alias-state-business-primary, #2f6fed)'
    : 'rgba(120,120,128,0.9)'
}

/** One short horizontal dash — all inputs share the same length. */
function dashStyle(isSelected: boolean, isHovered: boolean): CSSProperties {
  return {
    flex: 'none',
    width: '12px',
    height: '3px',
    borderRadius: '2px',
    background: dashColor(isSelected, isHovered),
    transition: 'background 120ms ease',
  }
}

/** Row/text fill: selected stays blue, hovered becomes white, else neutral. */
function textColor(isSelected: boolean, isHovered: boolean): string {
  if (isHovered) return '#ffffff'
  return isSelected
    ? 'var(--dsw-alias-state-business-primary, #2f6fed)'
    : 'var(--dsw-text, #ececf1)'
}

/**
 * The floating navigator: one panel whose rows are `text + dash`. At rest only
 * the dashes show; hovering expands the text and the panel card. Rendered only
 * with at least two user inputs.
 * @param props - runtime share plus the `t` locale seat.
 */
export function QuickViewPanel({ useSession, t }: QuickViewPanelProps) {
  const [hovered, setHovered] = useState(false)
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  // null = no manual pick yet, so the last input is selected by default.
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Select the stable references, then derive the list in one memo — the chat
  // `order` array and `nodes` reader keep their identity until they change.
  const order = useSession(s => s.chat.order)
  const nodes = useSession(s => s.chat.nodes)
  const list = useMemo(() => userMessages(order, nodes), [order, nodes])

  if (list.length <= 1) return null

  const activeKey = selectedKey ?? list[list.length - 1]!.key

  return createPortal(
    <div
      style={anchorStyle}
      role="navigation"
      aria-label={t('title')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoverKey(null) }}
    >
      <div style={hovered ? { ...panelBaseStyle, ...panelOpenStyle } : panelBaseStyle}>
        {list.map(({ key, preview: text }) => {
          const isSelected = activeKey === key
          const isHovered = hoverKey === key
          return (
            <button
              key={key}
              type="button"
              style={{
                ...(isHovered ? rowHoverStyle : rowStyle),
                color: textColor(isSelected, isHovered),
              }}
              title={text === '' ? t('empty') : `${t('jump')}: ${text}`}
              onMouseEnter={() => setHoverKey(key)}
              onMouseLeave={() => setHoverKey(null)}
              onClick={() => {
                setSelectedKey(key)
                scrollToKey(key)
              }}
            >
              <span style={hovered ? { ...textStyle, ...textOpenStyle } : textStyle}>
                {text === '' ? t('empty') : text}
              </span>
              <span style={dashStyle(isSelected, isHovered)} />
            </button>
          )
        })}
      </div>
    </div>,
    document.body,
  )
}
