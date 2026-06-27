import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function LongWarSignalCard({ command }: { command: KautilyaCommand }) {
  return (
    <section className="institutional-surface p-5">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">Long-War Signal</p>
      <h2 className="heading-cinzel mt-2 text-2xl font-black leading-tight text-indigo">
        {command.longWarSignal}
      </h2>
      <p className="mt-4 text-sm leading-7 text-inkdim">{command.seenText}</p>
      <div className="mt-5 rounded-lg border border-copper/25 bg-copper/5 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper">Primary leak</p>
        <p className="mt-1 text-sm font-black text-indigo">{command.primaryLeak}</p>
      </div>
    </section>
  )
}
