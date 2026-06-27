import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function CurrentAffairsCommandCard({ command }: { command: KautilyaCommand }) {
  return (
    <article className="card-calm p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">Current Affairs Integration</p>
      <p className="mt-2 text-sm leading-6 text-inkdim">
        {command.focusAreas.currentAffairs ?? 'Take one issue and connect it to static, Prelims, Mains, essay, and interview.'}
      </p>
    </article>
  )
}
