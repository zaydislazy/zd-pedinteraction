import { paragraphsFromInput } from './text'
import type {
  DialogueChoice,
  DialogueLine,
  DialoguePayload,
  DialogueState,
} from '../types/dialogue'

const historyOpacity = [1, 0.85, 0.7, 0.7, 0.62]

export function opacityForAge(index: number, count: number): number {
  const fromEnd = count - 1 - index
  return historyOpacity[Math.min(Math.max(fromEnd, 0), historyOpacity.length - 1)]
}

export function applyDialogueUpdate(current: DialogueState, payload: DialoguePayload): DialogueState {
  const next = normalizeDialogue({
    messages: payload.messages,
    choices: payload.choices,
    hint: payload.hint === null ? undefined : payload.hint,
  })

  const incoming = payload.messages ? next.messages : []
  const incomingHasActive = incoming.some((message) => message.active)
  const history = incomingHasActive
    ? current.messages.map((message) => (message.active ? { ...message, active: false } : message))
    : current.messages

  return {
    messages: incoming.length > 0 ? [...history, ...incoming] : current.messages,
    choices: payload.choices ? next.choices : current.choices,
    hint: payload.hint === null ? undefined : payload.hint ? next.hint : current.hint,
  }
}

export function normalizeDialogue(payload: DialoguePayload): DialogueState {
  const messages: DialogueLine[] = (payload.messages ?? []).map((message, index) => ({
    id: message.id ?? `line-${index}-${Math.random().toString(36).slice(2, 10)}`,
    speaker: message.speaker,
    label: message.label,
    paragraphs: paragraphsFromInput(message.text, message.paragraphs),
    initials: message.initials,
    active: Boolean(message.active),
    opacity: message.opacity,
  }))

  const hasExplicitActive = messages.some((message) => message.active)
  if (!hasExplicitActive) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].speaker === 'npc') {
        messages[index] = { ...messages[index], active: true }
        break
      }
    }
  }

  const choices: DialogueChoice[] = (payload.choices ?? []).map((choice, index) => ({
    id: choice.id ?? `choice-${index}`,
    key: choice.key,
    label: choice.label,
    text: choice.text,
    variant: choice.variant ?? (index === 0 ? 'primary' : 'secondary'),
  }))

  const hint = payload.hint
    ? {
        key: payload.hint.key ?? 'ESC',
        text: payload.hint.text ?? 'HOLD TO LEAVE',
      }
    : undefined

  return { messages, choices, hint }
}
