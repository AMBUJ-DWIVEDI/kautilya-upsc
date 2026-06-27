import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function MainsCommandCard({ command }: { command: KautilyaCommand }) {
  return (
    <article className="card-calm p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">Mains Architecture</p>
      <p className="mt-2 text-sm leading-6 text-inkdim">
        {command.focusAreas.mains ?? 'Write one GS answer with intro, three dimensions, one example, and way forward.'}
      </p>
    </article>
  )
}
