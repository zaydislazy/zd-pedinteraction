import { useEffect, useRef } from 'react'
import type { DialogueLine } from '../../types/dialogue'
import { opacityForAge } from '../../lib/normalizeDialogue'
import { NpcBubble } from '../NpcBubble/NpcBubble'
import { PlayerBubble } from '../PlayerBubble/PlayerBubble'
import styles from './DialogueHistory.module.css'

type DialogueHistoryProps = {
  messages: DialogueLine[]
}

export function DialogueHistory({ messages }: DialogueHistoryProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const primed = useRef(false)
  const seen = useRef(new Set<string>())
  const entering = useRef(new Set<string>())

  for (const message of messages) {
    if (primed.current && !seen.current.has(message.id)) {
      entering.current.add(message.id)
    }
  }

  useEffect(() => {
    const node = scroller.current
    if (node) {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: primed.current ? 'smooth' : 'auto',
      })
    }

    primed.current = true
    for (const message of messages) seen.current.add(message.id)
  }, [messages])

  return (
    <div ref={scroller} className={styles.history}>
      {messages.map((message, index) => {
        const resolved: DialogueLine = {
          ...message,
          opacity: message.opacity ?? opacityForAge(index, messages.length),
        }
        const enter = entering.current.has(resolved.id)

        if (resolved.speaker === 'player') {
          return <PlayerBubble key={resolved.id} message={resolved} enter={enter} />
        }

        return <NpcBubble key={resolved.id} message={resolved} enter={enter} />
      })}
    </div>
  )
}
