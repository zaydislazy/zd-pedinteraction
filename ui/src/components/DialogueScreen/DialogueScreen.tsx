import { useCallback, useEffect, useRef } from 'react'
import type { DialogueChoice, DialogueState } from '../../types/dialogue'
import { useDialogueInput } from '../../hooks/useDialogueInput'
import { useStageScale } from '../../hooks/useStageScale'
import { fetchNui } from '../../nui/fetchNui'
import { isEnvBrowser } from '../../nui/environment'
import { ChoiceList } from '../ChoiceList/ChoiceList'
import { DialogueHistory } from '../DialogueHistory/DialogueHistory'
import { LeaveHint } from '../LeaveHint/LeaveHint'
import styles from './DialogueScreen.module.css'

type DialogueScreenProps = {
  dialogue: DialogueState
  exiting?: boolean
  onLeave: () => void
  onExited: () => void
}

export function DialogueScreen({ dialogue, exiting = false, onLeave, onExited }: DialogueScreenProps) {
  const scale = useStageScale()
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!exiting) return
    const node = shellRef.current
    if (!node) {
      onExited()
      return
    }

    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      onExited()
    }

    const onEnd = (event: AnimationEvent) => {
      if (event.target !== node) return
      finish()
    }

    node.addEventListener('animationend', onEnd)
    const fallback = window.setTimeout(finish, 420)
    return () => {
      node.removeEventListener('animationend', onEnd)
      window.clearTimeout(fallback)
    }
  }, [exiting, onExited])

  const onSelect = useCallback((choice: DialogueChoice) => {
    void fetchNui('select', { id: choice.id, key: choice.key })
  }, [])

  const holdProgress = useDialogueInput({
    choices: dialogue.choices,
    onSelect,
    onLeave,
  })

  return (
    <main className={isEnvBrowser() ? `${styles.screen} ${styles.browser}` : styles.screen}>
      <div ref={shellRef} className={exiting ? styles.shellOut : styles.shellIn}>
        <div className={styles.stage} style={{ transform: `scale(${scale})` }}>
          <section className={styles.conversation}>
            <DialogueHistory messages={dialogue.messages} />
            <ChoiceList choices={dialogue.choices} onSelect={onSelect} />
          </section>
          {dialogue.hint ? <LeaveHint hint={dialogue.hint} progress={holdProgress} /> : null}
        </div>
      </div>
    </main>
  )
}
