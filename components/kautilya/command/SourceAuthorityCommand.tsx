export default function SourceAuthorityCommand() {
  const states = [
    ['Final', 'The source that has authority this week.'],
    ['Secondary', 'Useful only when the final source has a gap.'],
    ['Parked', 'Not dead, but not allowed to command attention.'],
    ['Dead', 'Not revised in 30 days. Remove it from the table.'],
  ]

  return (
    <section className="card-calm p-5">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">Source Authority Decision</p>
      <h2 className="mt-2 text-lg font-black text-indigo">Final. Secondary. Parked. Dead.</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {states.map(([label, detail]) => (
          <div key={label} className="rounded-lg border border-linen bg-parchment/60 p-3">
            <p className="text-sm font-black text-indigo">{label}</p>
            <p className="mt-1 text-xs leading-5 text-inkdim">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
