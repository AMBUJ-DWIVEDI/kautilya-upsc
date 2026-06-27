import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function TodayCommandCard({ command }: { command: KautilyaCommand }) {
  return (
    <section className="card-calm copper-border p-5">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">Today&apos;s Command</p>
      <h2 className="mt-2 text-xl font-black text-indigo">Close one source loop.</h2>
      <p className="mt-3 text-sm leading-7 text-inkdim">
        {command.type === 'source_reduction'
          ? 'Take your Polity sources and mark each: Final, Secondary, Parked, or Dead.'
          : command.command}
      </p>
      {command.avoidToday && (
        <div className="mt-4 rounded-lg border border-clay/25 bg-clay/5 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-clay">Avoid today</p>
          <p className="mt-1 text-sm font-semibold text-slate900">{command.avoidToday}</p>
        </div>
      )}
    </section>
  )
}
