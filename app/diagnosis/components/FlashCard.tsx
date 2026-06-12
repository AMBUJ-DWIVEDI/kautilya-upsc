'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Card } from '@/lib/diagnosis/types'
import ProgressHeader from './ProgressHeader'

interface Props {
  card: Card
  cardIndex: number
  cards: Card[]
  direction: 1 | -1
  savedAnswer?: string
  onAnswer: (cardId: string, value: string) => void
  onContinue: () => void
  onBack: () => void
  isFirst: boolean
}

export default function FlashCard({
  card,
  cardIndex,
  cards,
  direction,
  savedAnswer,
  onAnswer,
  onContinue,
  onBack,
  isFirst,
}: Props) {
  const [selected, setSelected] = useState<string>(savedAnswer ?? '')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset selection when card changes
    setSelected(savedAnswer ?? '')
  }, [card.id, savedAnswer])

  const hasAnswer = selected.trim().length > 0
  const isText = card.input === 'text'

  function handleSelect(key: string) {
    setSelected(key)
    onAnswer(card.id, key)
  }

  function handleTextChange(val: string) {
    setSelected(val)
    onAnswer(card.id, val)
  }

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      <ProgressHeader card={card} cards={cards} currentIndex={cardIndex} />

      <motion.div
        key={card.id}
        initial={{ x: direction * 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }}
        exit={{ x: -direction * 40, opacity: 0, transition: { duration: 0.3 } }}
        className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-8 sm:px-6"
      >
        {/* Question */}
        <div className="mb-6 pt-2">
          <h2 className="note-surface mb-3 text-xl font-semibold leading-snug text-slate900 sm:text-2xl">
            {card.question}
          </h2>
          {card.microcopy && (
            <p className="border-l-2 border-copper/40 pl-3 text-sm leading-relaxed text-inkdim">
              {card.microcopy}
            </p>
          )}
        </div>

        {/* Input area */}
        <div className="flex-1">
          {isText ? (
            <input
              type="text"
              value={selected}
              onChange={e => handleTextChange(e.target.value)}
              placeholder={card.placeholder}
              autoFocus
              className="w-full rounded-lg border border-linen bg-ivory px-4 py-3.5 text-base text-slate900
                         placeholder-inkdim/60 transition-calm focus:border-copper focus:outline-none"
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {card.options.map(opt => {
                const isSelected = selected === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelect(opt.key)}
                    className={cn(
                      'min-h-[56px] w-full rounded-lg border px-4 py-3 text-left text-sm transition-calm',
                      isSelected
                        ? 'border-copper bg-copper/10 text-slate900'
                        : 'border-linen bg-ivory text-inkdim hover:border-copper/40 hover:text-slate900',
                    )}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                          isSelected ? 'border-copper bg-copper' : 'border-inkdim/40',
                        )}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-ivory" />}
                      </span>
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 mt-6 flex flex-col gap-3 border-t border-linen bg-parchment/95 py-4 backdrop-blur">
          <button
            onClick={onContinue}
            disabled={!hasAnswer}
            className={cn(
              'w-full rounded-lg py-3.5 text-sm font-semibold tracking-wide transition-calm',
              hasAnswer
                ? 'bg-copper text-ivory hover:bg-copperlight'
                : 'cursor-not-allowed bg-linen text-inkdim/60',
            )}
          >
            Continue →
          </button>

          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              disabled={isFirst}
              className="text-xs text-inkdim transition-calm hover:text-copper disabled:opacity-30"
            >
              ← Back
            </button>
            <span className="text-[11px] text-inkdim/60">No right answers. Only yours.</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
