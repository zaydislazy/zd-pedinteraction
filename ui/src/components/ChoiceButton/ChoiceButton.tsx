import type { DialogueChoice } from '../../types/dialogue'
import styles from './ChoiceButton.module.css'

type ChoiceButtonProps = {
  choice: DialogueChoice
  onSelect: (choice: DialogueChoice) => void
}

export function ChoiceButton({ choice, onSelect }: ChoiceButtonProps) {
  const variant = choice.variant === 'primary' ? styles.primary : styles.secondary

  return (
    <button type="button" className={`${styles.button} ${variant}`} onClick={() => onSelect(choice)}>
      <span className={styles.key}>{choice.key}</span>
      <span className={styles.copy}>
        <span className={styles.label}>{choice.label}</span>
        <span className={styles.text}>{choice.text}</span>
      </span>
    </button>
  )
}
