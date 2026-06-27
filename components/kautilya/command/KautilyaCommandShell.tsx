'use client'

import { useEffect, useState } from 'react'
import MotionPage from '@/components/kautilya/MotionPage'
import { trackEvent } from '@/lib/kautilya/events'
import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'
import LongWarSignalCard from './LongWarSignalCard'
import WeeklyCommandBrief from './WeeklyCommandBrief'
import TodayCommandCard from './TodayCommandCard'
import DoMoreDoLessPanel from './DoMoreDoLessPanel'
import SourceAuthorityCommand from './SourceAuthorityCommand'
import PrelimsCommandCard from './PrelimsCommandCard'
import MainsCommandCard from './MainsCommandCard'
import CurrentAffairsCommandCard from './CurrentAffairsCommandCard'
import OptionalCommandCard from './OptionalCommandCard'
import RecoveryCommandCard from './RecoveryCommandCard'
import HoldToSealButton from './HoldToSealButton'
import CommandReview from './CommandReview'
import CommandHistory from './CommandHistory'

export default function KautilyaCommandShell({ initialCommand }: { initialCommand: KautilyaCommand }) {
  const [sealed, setSealed] = useState(false)
  const command = initialCommand

  useEffect(() => {
    trackEvent('kautilya_command_page_viewed')
    if (command.type === 'source_reduction') trackEvent('kautilya_source_reduction_command_viewed')
    if (command.type === 'mains') trackEvent('kautilya_mains_command_viewed')
    if (command.type === 'prelims') trackEvent('kautilya_prelims_command_viewed')
  }, [command.type])

  async function sealCommand() {
    setSealed(true)
    const response = await fetch('/api/kautilya-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seal', command }),
    })
    if (!response.ok) {
      setSealed(false)
      return
    }
    trackEvent('kautilya_weekly_command_sealed')
  }

  return (
    <MotionPage className="flex-1 bg-parchment px-4 pb-12 pt-2 text-slate900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="institutional-surface mb-7 overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            <div className="p-6 sm:p-8">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-copper">
                Weekly Command Brief
              </p>
              <h1 className="heading-cinzel mt-3 max-w-4xl text-3xl font-black leading-tight text-indigo sm:text-5xl">
                You are not behind because you know too little.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-inkdim">
                You are behind because too many sources are still allowed to speak.
              </p>
              <p className="mt-5 text-lg font-black text-copper">This week: Integration, not expansion.</p>
            </div>
            <aside className="border-t border-linen bg-ivory/70 p-6 lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">Command status</p>
              <p className="heading-cinzel mt-3 text-4xl font-black text-indigo">
                {sealed ? 'Sealed.' : 'Active'}
              </p>
              <p className="mt-2 text-sm leading-6 text-inkdim">
                {sealed
                  ? 'The week has one authority now.'
                  : 'Hold the seal only after accepting the reduction order.'}
              </p>
              <div className="mt-5">
                <HoldToSealButton onComplete={sealCommand} disabled={sealed} />
              </div>
            </aside>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <div className="space-y-6">
            <LongWarSignalCard command={command} />
            <WeeklyCommandBrief command={command} />
            <TodayCommandCard command={command} />
            <DoMoreDoLessPanel command={command} />
            <RecoveryCommandCard command={command} />
          </div>

          <div className="space-y-6">
            <SourceAuthorityCommand />
            <section className="grid gap-4">
              <PrelimsCommandCard command={command} />
              <MainsCommandCard command={command} />
              <CurrentAffairsCommandCard command={command} />
              <OptionalCommandCard command={command} />
            </section>
            <CommandHistory />
          </div>
        </div>

        <div className="mt-7">
          <CommandReview command={command} />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-linen bg-ivory/95 px-4 py-3 shadow-paper backdrop-blur lg:hidden">
          <HoldToSealButton onComplete={sealCommand} disabled={sealed} />
        </div>
      </div>
    </MotionPage>
  )
}
