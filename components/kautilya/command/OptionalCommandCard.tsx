import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function OptionalCommandCard({ command }: { command: KautilyaCommand }) {
  return (
    <article className="card-calm p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">Optional Stability</p>
      <p className="mt-2 text-sm leading-6 text-inkdim">
        {command.focusAreas.optional ?? 'Protect one optional slot this week. Do not let it survive only on leftover time.'}
      </p>
    </article>
  )
}
