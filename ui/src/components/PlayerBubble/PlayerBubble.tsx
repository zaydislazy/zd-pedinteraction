import type { CSSProperties } from 'react'
import type { DialogueLine } from '../../types/dialogue'
import { RichText } from '../RichText/RichText'
import styles from './PlayerBubble.module.css'

type PlayerBubbleProps = {
  message: DialogueLine
  enter?: boolean
}

export function PlayerBubble({ message, enter = false }: PlayerBubbleProps) {
  const opacity = message.opacity ?? 1

  return (
    <div
      className={`${styles.row}${enter ? ` ${styles.enter}` : ''}`}
      style={{ opacity, '--line-opacity': opacity } as CSSProperties}
    >
      <article className={styles.bubble}>
        <p className={styles.label}>{message.label}</p>
        <div className={styles.copy}>
          <RichText paragraphs={message.paragraphs} />
        </div>
      </article>
    </div>
  )
}
