export default function CommandHistory() {
  const history = [
    ['Week 01', 'Declare Source Authority', 'Sealed'],
    ['Week 02', 'Repair Answer Architecture', 'Review due'],
    ['Week 03', 'Integrate Current Affairs', 'Draft'],
  ]

  return (
    <section className="card-calm p-5">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">Command History</p>
      <div className="mt-4 divide-y divide-linen">
        {history.map(([week, title, status]) => (
          <div key={week} className="flex items-center justify-between gap-4 py-3 text-sm">
            <div>
              <p className="font-mono text-xs text-inkdim">{week}</p>
              <p className="font-bold text-indigo">{title}</p>
            </div>
            <span className="rounded-full border border-copper/20 bg-copper/5 px-2 py-1 text-[11px] font-bold text-copper">
              {status}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
