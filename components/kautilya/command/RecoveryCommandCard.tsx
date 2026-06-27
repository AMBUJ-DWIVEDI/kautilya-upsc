import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function RecoveryCommandCard({ command }: { command: KautilyaCommand }) {
  return (
    <section className="rounded-xl border border-sage/25 bg-sage/5 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">Recovery / Pressure Note</p>
      <p className="mt-2 text-sm leading-7 text-slate900">
        {command.type === 'recovery'
          ? command.command
          : 'Do not redesign the entire plan after one unstable day. Reduce the front, close one loop, and log the leak.'}
      </p>
    </section>
  )
}
