import type { KautilyaCommand } from '@/lib/kautilya/commandTypes'

export default function DoMoreDoLessPanel({ command }: { command: KautilyaCommand }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <ListBlock title="Do More" items={command.doMore} tone="text-sage" />
      <ListBlock title="Do Less" items={command.doLess} tone="text-clay" />
    </section>
  )
}

function ListBlock({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="card-calm p-5">
      <p className={`text-xs font-bold uppercase tracking-[0.22em] ${tone}`}>{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map(item => (
          <li key={item} className="rounded-lg border border-linen bg-ivory/80 px-3 py-2 text-sm text-slate900">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
