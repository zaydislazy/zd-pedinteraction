import type { CSSProperties } from 'react'
import type { DialogueChoice } from '../../types/dialogue'
import { ChoiceButton } from '../ChoiceButton/ChoiceButton'
import styles from './ChoiceList.module.css'

type ChoiceListProps = {
  choices: DialogueChoice[]
  onSelect: (choice: DialogueChoice) => void
}

export function ChoiceList({ choices, onSelect }: ChoiceListProps) {
  if (choices.length === 0) return null

  const signature = choices.map((choice) => choice.id).join('|')

  return (
    <div key={signature} className={styles.list}>
      {choices.map((choice, index) => (
        <div key={choice.id} className={styles.item} style={{ '--i': index } as CSSProperties}>
          <ChoiceButton choice={choice} onSelect={onSelect} />
        </div>
      ))}
    </div>
  )
}
