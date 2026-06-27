import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function PrelimsCommandCard({ command }: { command: KautilyaCommand }) {
  return <SignalCard title="Prelims Nerve" body={command.focusAreas.prelims ?? 'Solve 30 statement questions and name every attraction error.'} />
}

function SignalCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="card-calm p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{title}</p>
      <p className="mt-2 text-sm leading-6 text-inkdim">{body}</p>
    </article>
  )
}
