export type TextPart = {
  text: string
  italic?: boolean
  bold?: boolean
}

export type Paragraph = string | TextPart[]

export type Speaker = 'player' | 'npc'

export type DialogueLineInput = {
  id?: string
  speaker: Speaker
  label: string
  text?: string
  paragraphs?: Paragraph[]
  initials?: string
  active?: boolean
  opacity?: number
}

export type DialogueChoiceInput = {
  id?: string
  key: string
  label: string
  text: string
  variant?: 'primary' | 'secondary'
}

export type DialogueHintInput = {
  key?: string
  text?: string
}

export type DialoguePayload = {
  messages?: DialogueLineInput[]
  choices?: DialogueChoiceInput[]
  hint?: DialogueHintInput | null
}

export type DialogueLine = {
  id: string
  speaker: Speaker
  label: string
  paragraphs: TextPart[][]
  initials?: string
  active: boolean
  opacity?: number
}

export type DialogueChoice = {
  id: string
  key: string
  label: string
  text: string
  variant: 'primary' | 'secondary'
}

export type DialogueHint = {
  key: string
  text: string
}

export type DialogueState = {
  messages: DialogueLine[]
  choices: DialogueChoice[]
  hint?: DialogueHint
}

export type NuiAction = 'open' | 'update' | 'close'

export type NuiMessage<T = unknown> = {
  action: NuiAction
  data?: T
}
