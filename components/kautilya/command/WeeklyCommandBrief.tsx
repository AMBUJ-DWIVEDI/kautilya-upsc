import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function WeeklyCommandBrief({ command }: { command: KautilyaCommand }) {
  return (
    <section className="command-dossier overflow-hidden rounded-xl border border-linen">
      <div className="border-b border-linen bg-ivory/80 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-copper">This Week&apos;s Command</p>
        <h2 className="heading-cinzel mt-2 text-2xl font-black text-indigo">{command.title}</h2>
      </div>
      <div className="space-y-4 p-5">
        <p className="note-surface text-slate900">{command.command}</p>
        <div className="rounded-lg border border-linen bg-parchment/75 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">Why this matters</p>
          <p className="mt-2 text-sm leading-7 text-inkdim">{command.whyThisMatters}</p>
        </div>
      </div>
    </section>
  )
}
