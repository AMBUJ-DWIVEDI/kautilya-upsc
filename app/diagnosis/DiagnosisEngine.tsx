'use client'

import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CARDS, isLastCardOfLevel } from '@/lib/diagnosis/cards'
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

function loadProgress(): { phase: DiagnosisPhase; answers: Answers } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveProgress(phase: DiagnosisPhase, answers: Answers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ phase, answers }))
  } catch {}
}

function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
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

export default function DiagnosisEngine() {
  const cards = CARDS
  const [phase, setPhase] = useState<DiagnosisPhase>({ type: 'intro' })
  const [answers, setAnswers] = useState<Answers>({})
  const [direction, setDirection] = useState<1 | -1>(1)
  const [hydrated, setHydrated] = useState(false)

  // KAUTILYA-DECISION: one-shot localStorage hydration on mount — resume is a product requirement.
  useEffect(() => {
    const saved = loadProgress()
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration
      setPhase(saved.phase)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration
      setAnswers(saved.answers)
    }
    setHydrated(true)
  }, [])

  const go = useCallback((nextPhase: DiagnosisPhase, dir: 1 | -1, newAnswers?: Answers) => {
    const a = newAnswers ?? answers
    setDirection(dir)
    setPhase(nextPhase)
    saveProgress(nextPhase, a)
  }, [answers])

  function handleAnswer(cardId: string, value: string) {
    const next = { ...answers, [cardId]: value }
    setAnswers(next)
    saveProgress(phase, next)
    track('diagnosis_card_answered', {
      card_id: cardId,
      level: cards.find(c => c.id === cardId)?.level,
    })
  }

  function handleStart() {
    track('diagnosis_started', {})
    go({ type: 'level-start', level: cards[0].level }, 1)
  }

  function handleLevelStart(level: number) {
    const firstIndex = cards.findIndex(c => c.level === level)
    go({ type: 'card', index: firstIndex >= 0 ? firstIndex : 0 }, 1)
  }

  function handleContinue(currentIndex: number) {
    const nextIndex = currentIndex + 1

    if (nextIndex >= cards.length) {
      track('diagnosis_cards_finished', {})
      go({ type: 'generating' }, 1)
      return
    }

    if (isLastCardOfLevel(currentIndex, cards)) {
      const nextLevel = cards[nextIndex].level
      track('diagnosis_level_completed', { level: cards[currentIndex].level })
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
    track('diagnosis_completed', { archetype: outcome.archetype })

    // The reveal page reads the outcome locally first so the ceremony never
    // waits on the network; the DB row is the durable copy.
    try {
      localStorage.setItem(OUTCOME_KEY, JSON.stringify({ outcome, name: answers['L1-01'] ?? '' }))
    } catch {}

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('aspirant_profiles').upsert(
          {
            user_id: user.id,
            name: answers['L1-01'] ?? '',
            pillar1_data: answers,
            diagnosis_depth: 'free30', // KAUTILYA-DECISION: stored enum value retained; means "core 52-card scan"
            core_completed_at: new Date().toISOString(),
            anchor_generated: true,
            attempts_taken: facts.attempts_taken ?? 0,
            attempts_mains: facts.attempts_mains ?? 0,
            prep_years: facts.prep_years ?? 0,
            employed: facts.employed ?? false,
            age: facts.age ?? null,
            optional_subject: facts.optional_subject ?? null,
          },
          { onConflict: 'user_id' },
        )

        await supabase.from('hidden_scores').upsert(
          { user_id: user.id, ...hiddenScoreRow(outcome) },
          { onConflict: 'user_id' },
        )
      }
    } catch {
      // Keep the ceremony moving; localStorage still holds the outcome.
    }

    clearProgress()
    window.location.href = '/reveal'
  }

  if (!hydrated) return null

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {phase.type === 'intro' && (
        <IntroScreen key="intro" totalCards={cards.length} onStart={handleStart} />
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
