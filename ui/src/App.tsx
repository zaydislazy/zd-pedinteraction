import { useCallback, useState } from 'react'
import { DialogueScreen } from './components/DialogueScreen/DialogueScreen'
import { mockDialogue } from './data/mockDialogue'
import { applyDialogueUpdate, normalizeDialogue } from './lib/normalizeDialogue'
import { isEnvBrowser } from './nui/environment'
import { fetchNui } from './nui/fetchNui'
import { useNuiEvent } from './nui/useNuiEvent'
import type { DialoguePayload, DialogueState } from './types/dialogue'

export function App() {
  const [present, setPresent] = useState(isEnvBrowser)
  const [visible, setVisible] = useState(isEnvBrowser)
  const [dialogue, setDialogue] = useState<DialogueState>(() => normalizeDialogue(mockDialogue))

  const reveal = useCallback(() => {
    setPresent(true)
    setVisible(true)
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
  }, [])

  useNuiEvent<DialoguePayload>('open', (data) => {
    setDialogue(normalizeDialogue(data ?? {}))
    reveal()
  })

  useNuiEvent<DialoguePayload>('update', (data) => {
    setDialogue((current) => applyDialogueUpdate(current, data ?? {}))
  })

  useNuiEvent('close', () => {
    dismiss()
  })

  const onLeave = useCallback(() => {
    void fetchNui('leave')
    dismiss()
  }, [dismiss])

  const onExited = useCallback(() => {
    setPresent(false)
  }, [])

  if (!present) return null

  return (
    <DialogueScreen dialogue={dialogue} exiting={!visible} onLeave={onLeave} onExited={onExited} />
  )
}
