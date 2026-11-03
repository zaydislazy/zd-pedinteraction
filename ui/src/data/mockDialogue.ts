import type { DialoguePayload } from '../types/dialogue'

export const mockDialogue: DialoguePayload = {
  messages: [
    {
      id: 'ask',
      speaker: 'player',
      label: 'ASK',
      paragraphs: ['Fleeca Harmony'],
      opacity: 0.62,
    },
    {
      id: 'open-branches',
      speaker: 'npc',
      label: 'SIENNA WESTON · OPEN BRANCHES',
      initials: 'SW',
      opacity: 0.7,
      paragraphs: [
        "Here's what I've stolen off his desk so far.",
        [
          { text: 'More when he stops changing his passwords. He uses my birthday. ' },
          { text: 'Wrong year, obviously.', italic: true },
        ],
      ],
    },
    {
      id: 'deal',
      speaker: 'player',
      label: 'DEAL',
      paragraphs: ['Here. Both of them, not a scratch.'],
      opacity: 0.7,
    },
    {
      id: 'bracelets',
      speaker: 'npc',
      label: 'SIENNA WESTON · FLEECA HARMONY',
      initials: 'SW',
      opacity: 0.85,
      paragraphs: [
        [
          { text: 'Wait. Are those… are those ' },
          { text: 'my bracelets', italic: true },
          { text: '?' },
        ],
        [
          { text: 'Hand them over. ' },
          { text: 'Slowly.', bold: true },
          { text: " If either of them has a single scratch, I'm telling Daddy it was you." },
        ],
      ],
    },
    {
      id: 'babies',
      speaker: 'npc',
      label: 'SIENNA WESTON · FLEECA HARMONY',
      initials: 'SW',
      active: true,
      paragraphs: [
        [
          { text: 'Oh my god. ' },
          { text: 'Hi, babies.', italic: true },
        ],
        "Okay. You're officially my favourite criminals. Don't let it go to your head.",
        [
          { text: "He'll notice they're gone in about three weeks, which is how long it takes him to notice " },
          { text: 'anything', italic: true },
          { text: ' I own.' },
        ],
      ],
    },
  ],
  choices: [
    {
      id: 'ask-harmony',
      key: '1',
      label: 'ASK',
      text: 'So... about Harmony?',
      variant: 'primary',
    },
    {
      id: 'leave-car',
      key: '2',
      label: 'LEAVE',
      text: 'Enjoy the red car.',
      variant: 'secondary',
    },
  ],
  hint: {
    key: 'ESC',
    text: 'HOLD TO LEAVE',
  },
}
