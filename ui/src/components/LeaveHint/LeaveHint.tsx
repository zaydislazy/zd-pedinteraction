import type { DialogueHint } from '../../types/dialogue'
import styles from './LeaveHint.module.css'

type LeaveHintProps = {
  hint: DialogueHint
  progress: number
}

export function LeaveHint({ hint, progress }: LeaveHintProps) {
  return (
    <div className={styles.row}>
      <div className={styles.hint} role="status">
        <span className={styles.key}>
          <span className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
          <span className={styles.keyLabel}>{hint.key}</span>
        </span>
        <span className={styles.text}>{hint.text}</span>
      </div>
    </div>
  )
}
