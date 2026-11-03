import type { CSSProperties } from 'react'
import type { DialogueLine } from '../../types/dialogue'
import { initialsFromLabel } from '../../lib/text'
import { Avatar } from '../Avatar/Avatar'
import { RichText } from '../RichText/RichText'
import styles from './NpcBubble.module.css'

type NpcBubbleProps = {
  message: DialogueLine
  enter?: boolean
}

export function NpcBubble({ message, enter = false }: NpcBubbleProps) {
  const initials = message.initials ?? initialsFromLabel(message.label)
  const opacity = message.active ? 1 : (message.opacity ?? 1)
  const motion = {
    opacity,
    '--line-opacity': opacity,
  } as CSSProperties

  return (
    <article
      className={`${message.active ? styles.active : styles.rest}${enter ? ` ${styles.enter}` : ''}`}
      style={motion}
    >
      <Avatar initials={initials} active={message.active} />
      <div className={styles.bubble}>
        <p className={styles.label}>{message.label}</p>
        <div className={styles.copy}>
          <RichText
            paragraphs={message.paragraphs}
            italicClassName={message.active ? styles.italicActive : styles.italic}
          />
        </div>
      </div>
    </article>
  )
}
