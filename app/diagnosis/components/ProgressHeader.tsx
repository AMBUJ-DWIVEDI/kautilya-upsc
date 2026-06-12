'use client'

import { LEVEL_NAMES } from '@/lib/diagnosis/cards'
import type { Card } from '@/lib/diagnosis/types'

interface Props {
  card: Card
  cards: Card[]
  currentIndex: number
}

function cardsInLevel(cards: Card[], level: number): number {
  return cards.filter(c => c.level === level).length
}

function cardPositionInLevel(cards: Card[], card: Card, currentIndex: number): number {
  return cards.slice(0, currentIndex + 1).filter(c => c.level === card.level).length
}

export default function ProgressHeader({ card, cards, currentIndex }: Props) {
  const pct = Math.round(((currentIndex + 1) / cards.length) * 100)
  const total = cardsInLevel(cards, card.level)
  const levelPos = cardPositionInLevel(cards, card, currentIndex)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-5 pb-4 pt-5 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <span className="heading-cinzel text-xs uppercase tracking-[0.22em] text-copper">
          {LEVEL_NAMES[card.level]}
        </span>
        <span className="font-mono text-xs text-inkdim">
          {levelPos}/{total}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-linen">
        <div
          className="h-full rounded-full bg-copper transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="font-mono text-xs text-inkdim/70">
        {currentIndex + 1} of {cards.length}
      </p>
    </div>
  )
}
