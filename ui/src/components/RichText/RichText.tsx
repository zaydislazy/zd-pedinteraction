import type { TextPart } from '../../types/dialogue'
import styles from './RichText.module.css'

type RichTextProps = {
  paragraphs: TextPart[][]
  italicClassName?: string
}

export function RichText({ paragraphs, italicClassName }: RichTextProps) {
  return (
    <div className={styles.body}>
      {paragraphs.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex} className={styles.paragraph}>
          {paragraph.map((part, partIndex) => {
            const className = part.italic ? italicClassName : part.bold ? styles.bold : undefined
            return (
              <span key={partIndex} className={className}>
                {part.text}
              </span>
            )
          })}
        </p>
      ))}
    </div>
  )
}
