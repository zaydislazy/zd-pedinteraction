import { useEffect, useState } from 'react'
import type { DialogueChoice } from '../types/dialogue'

const HOLD_MS = 700

type DialogueInput = {
  choices: DialogueChoice[]
  onSelect: (choice: DialogueChoice) => void
  onLeave: () => void
}

export function useDialogueInput({ choices, onSelect, onLeave }: DialogueInput) {
  const [holdProgress, setHoldProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    let holding = false
    let start = 0

    const stopHold = () => {
      holding = false
      cancelAnimationFrame(frame)
      setHoldProgress(0)
    }

    const tick = (now: number) => {
      if (!holding) return
      const progress = Math.min(1, (now - start) / HOLD_MS)
      setHoldProgress(progress)
      if (progress >= 1) {
        stopHold()
        onLeave()
        return
      }
      frame = requestAnimationFrame(tick)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return

      const choice = choices.find((entry) => entry.key.toLowerCase() === event.key.toLowerCase())
      if (choice) {
        event.preventDefault()
        onSelect(choice)
        return
      }

      if (event.key !== 'Escape') return
      event.preventDefault()
      holding = true
      start = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      stopHold()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      holding = false
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [choices, onLeave, onSelect])

  return holdProgress
}
