import type { Paragraph, TextPart } from '../types/dialogue'

const inlinePattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g

export function parseInline(input: string): TextPart[] {
  const parts: TextPart[] = []
  let cursor = 0

  for (const match of input.matchAll(inlinePattern)) {
    const index = match.index ?? 0
    if (index > cursor) {
      parts.push({ text: input.slice(cursor, index) })
    }

    const token = match[0]
    if (token.startsWith('**')) {
      parts.push({ text: token.slice(2, -2), bold: true })
    } else {
      parts.push({ text: token.slice(1, -1), italic: true })
    }
    cursor = index + token.length
  }

  if (cursor < input.length) {
    parts.push({ text: input.slice(cursor) })
  }

  if (parts.length === 0) {
    parts.push({ text: '' })
  }

  return parts
}

export function paragraphToParts(paragraph: Paragraph): TextPart[] {
  if (typeof paragraph === 'string') {
    return parseInline(paragraph)
  }
  return paragraph.length > 0 ? paragraph : [{ text: '' }]
}

export function paragraphsFromInput(text?: string, paragraphs?: Paragraph[]): TextPart[][] {
  if (paragraphs && paragraphs.length > 0) {
    return paragraphs.map(paragraphToParts)
  }

  if (!text) {
    return [[{ text: '' }]]
  }

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return [[{ text: '' }]]
  }

  return lines.map(parseInline)
}

export function initialsFromLabel(label: string): string {
  const name = label.split('·')[0]?.trim() ?? ''
  const words = name.split(/\s+/).filter(Boolean)

  if (words.length === 0) return 'NPC'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  const first = words[0][0] ?? ''
  const last = words[words.length - 1][0] ?? ''
  return `${first}${last}`.toUpperCase()
}
