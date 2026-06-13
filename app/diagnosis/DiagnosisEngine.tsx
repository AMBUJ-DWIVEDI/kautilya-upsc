'use client'

import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FREE_DIAGNOSIS_CARDS, PAID_DIAGNOSIS_CARDS, isLastCardOfLevel } from '@/lib/diagnosis/cards'
import { calculateHiddenScores } from '@/lib/diagnosis/scoring'
import { deriveOutcome } from '@/lib/diagnosis/archetypes'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import type { Answers, DiagnosisPhase, DiagnosisOutcome } from '@/lib/diagnosis/types'

import IntroScreen from './components/IntroScreen'
import LevelStartScreen from './components/LevelStartScreen'
import FlashCard from './components/FlashCard'
import GeneratingScreen from './components/GeneratingScreen'

const STORAGE_KEY = 'kautilya_diagnosis_progress'
const OUTCOME_KEY = 'kautilya_diagnosis_outcome'
const NAME_KEY = 'identity_name'
const OPTION_KEYS = new Set(['a', 'b', 'c', 'd', 'e', 'f'])
type DiagnosisDepth = 'free30' | 'paid50'

function storageKey(depth: DiagnosisDepth): string {
  return `${STORAGE_KEY}_${depth}`
}

function loadProgress(depth: DiagnosisDepth): { phase: DiagnosisPhase; answers: Answers } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey(depth)) ?? (depth === 'free30' ? localStorage.getItem(STORAGE_KEY) : null)
    const saved = raw ? JSON.parse(raw) as { phase: DiagnosisPhase; answers: Answers } : null
    const oldName = saved?.answers['L1-01']
    if (saved && oldName && !OPTION_KEYS.has(oldName)) {
      saved.answers[NAME_KEY] = saved.answers[NAME_KEY] ?? oldName
      delete saved.answers['L1-01']
    }
    return saved
  } catch {
    return null
  }
}

function saveProgress(depth: DiagnosisDepth, phase: DiagnosisPhase, answers: Answers) {
  try {
    localStorage.setItem(storageKey(depth), JSON.stringify({ phase, answers }))
  } catch {}
}

function clearProgress(depth: DiagnosisDepth) {
  try {
    localStorage.removeItem(storageKey(depth))
    if (depth === 'free30') localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

function hiddenScoreRow(outcome: DiagnosisOutcome) {
  const s = outcome.scores
  return {
    purpose_intensity: s.purpose_intensity,
    anchor_strength: s.anchor_strength,
    emotional_volatility: s.emotional_volatility,
    cognitive_clarity: s.cognitive_clarity,
    execution_friction: s.execution_friction,
    distraction_risk: s.distraction_risk,
    self_belief_type: s.self_belief_type,
    marathon_consistency: s.marathon_consistency,
    recovery_speed: s.recovery_speed,
    prelims_nerve: s.prelims_nerve,
    mains_stamina: s.mains_stamina,
    attempt_pressure: s.attempt_pressure,
    resource_chaos: s.resource_chaos,
    identity_fusion: s.identity_fusion,
    external_pressure: s.external_pressure,
    stage_pattern: s.stage_pattern,
    purpose_type: s.purpose_type,
    archetype: outcome.archetype,
    war_pattern_tags: outcome.storedTags,
  }
}

export default function DiagnosisEngine({ depth }: { depth: DiagnosisDepth }) {
  const cards = depth === 'paid50' ? PAID_DIAGNOSIS_CARDS : FREE_DIAGNOSIS_CARDS
  const [phase, setPhase] = useState<DiagnosisPhase>({ type: 'intro' })
  const [answers, setAnswers] = useState<Answers>({})
  const [direction, setDirection] = useState<1 | -1>(1)
  const [hydrated, setHydrated] = useState(false)

  // KAUTILYA-DECISION: one-shot localStorage hydration on mount — resume is a product requirement.
  useEffect(() => {
    const saved = loadProgress(depth)
    if (saved) {
      const savedPhase = saved.phase.type === 'card' && saved.phase.index >= cards.length
        ? { type: 'level-start' as const, level: cards[0].level }
        : saved.phase
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional localStorage hydration
      setPhase(savedPhase)
      setAnswers(saved.answers)
    }
    setHydrated(true)
  }, [cards, depth])

  const go = useCallback((nextPhase: DiagnosisPhase, dir: 1 | -1, newAnswers?: Answers) => {
    const a = newAnswers ?? answers
    setDirection(dir)
    setPhase(nextPhase)
    saveProgress(depth, nextPhase, a)
  }, [answers, depth])

  function handleAnswer(cardId: string, value: string) {
    const next = { ...answers, [cardId]: value }
    setAnswers(next)
    saveProgress(depth, phase, next)
    track('diagnosis_card_answered', {
      card_id: cardId,
      level: cards.find(c => c.id === cardId)?.level,
      depth,
    })
  }

  function handleNameChange(value: string) {
    const next = { ...answers, [NAME_KEY]: value }
    setAnswers(next)
    saveProgress(depth, phase, next)
  }

  function handleStart() {
    track('diagnosis_started', { depth, total_cards: cards.length })
    go({ type: 'level-start', level: cards[0].level }, 1)
  }

  function handleLevelStart(level: number) {
    const firstIndex = cards.findIndex(c => c.level === level)
    go({ type: 'card', index: firstIndex >= 0 ? firstIndex : 0 }, 1)
  }

  function handleContinue(currentIndex: number) {
    const nextIndex = currentIndex + 1

    if (nextIndex >= cards.length) {
      track('diagnosis_cards_finished', { depth, total_cards: cards.length })
      go({ type: 'generating' }, 1)
      return
    }

    if (isLastCardOfLevel(currentIndex, cards)) {
      const nextLevel = cards[nextIndex].level
      track('diagnosis_level_completed', { level: cards[currentIndex].level, depth })
      go({ type: 'level-start', level: nextLevel }, 1)
    } else {
      go({ type: 'card', index: nextIndex }, 1)
    }
  }

  function handleBack(currentIndex: number) {
    if (currentIndex === 0) {
      go({ type: 'intro' }, -1)
      return
    }

    const prevIndex = currentIndex - 1
    if (cards[prevIndex].level !== cards[currentIndex].level) {
      go({ type: 'level-start', level: cards[prevIndex].level }, -1)
    } else {
      go({ type: 'card', index: prevIndex }, -1)
    }
  }

  async function handleGeneratingComplete() {
    const { scores, facts } = calculateHiddenScores(answers)
    const outcome = deriveOutcome(scores, facts)
    const name = (answers[NAME_KEY] ?? '').trim()
    const completedAt = new Date().toISOString()
    track('diagnosis_completed', { archetype: outcome.archetype, depth, total_cards: cards.length })

    // The reveal page reads the outcome locally first so the ceremony never
    // waits on the network; the DB row is the durable copy.
    try {
      localStorage.setItem(OUTCOME_KEY, JSON.stringify({ outcome, name }))
    } catch {}

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const profilePayload: Record<string, unknown> = {
          user_id: user.id,
          name,
          pillar1_data: answers,
          diagnosis_depth: depth,
          anchor_generated: true,
          attempts_taken: facts.attempts_taken ?? 0,
          attempts_mains: facts.attempts_mains ?? 0,
          prep_years: facts.prep_years ?? 0,
          employed: facts.employed ?? false,
          age: facts.age ?? null,
          optional_subject: facts.optional_subject ?? null,
        }

        if (depth === 'free30') {
          profilePayload.core_completed_at = completedAt
        } else {
          profilePayload.paid_extra_data = answers
          profilePayload.paid_completed_at = completedAt
        }

        await supabase.from('aspirant_profiles').upsert(
          profilePayload,
          { onConflict: 'user_id' },
        )

        await supabase.from('hidden_scores').upsert(
          { user_id: user.id, ...hiddenScoreRow(outcome) },
          { onConflict: 'user_id' },
        )

        // Kick off the AI command report in the background. It is cached
        // server-side; the reveal ceremony never waits on it.
        void fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ depth }),
        }).catch(() => {})
      }
    } catch {
      // Keep the ceremony moving; localStorage still holds the outcome.
    }

    clearProgress(depth)
    window.location.href = '/reveal'
  }

  if (!hydrated) return null

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {phase.type === 'intro' && (
        <IntroScreen
          key="intro"
          totalCards={cards.length}
          depth={depth}
          name={answers[NAME_KEY] ?? ''}
          onNameChange={handleNameChange}
          onStart={handleStart}
        />
      )}

      {phase.type === 'level-start' && (
        <LevelStartScreen
          key={`level-start-${phase.level}`}
          level={phase.level}
          onContinue={() => handleLevelStart(phase.level)}
        />
      )}

      {phase.type === 'card' && (
        <FlashCard
          key={`card-${cards[phase.index].id}`}
          card={cards[phase.index]}
          cardIndex={phase.index}
          cards={cards}
          direction={direction}
          savedAnswer={answers[cards[phase.index].id]}
          onAnswer={handleAnswer}
          onContinue={() => handleContinue(phase.index)}
          onBack={() => handleBack(phase.index)}
          isFirst={phase.index === 0}
        />
      )}

      {phase.type === 'generating' && (
        <GeneratingScreen key="generating" onComplete={handleGeneratingComplete} />
      )}
    </AnimatePresence>
  )
}
