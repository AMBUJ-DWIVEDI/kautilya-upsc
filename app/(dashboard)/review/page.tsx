import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Seal from '@/components/brand/Seal'
import { generateWeeklyReviewForUser } from '@/lib/weekly/review'
import { APP } from '@/lib/config'

export default async function WeeklyReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const review = await generateWeeklyReviewForUser(supabase, user.id)
  if (!review) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 items-center justify-center px-4 py-16 text-center">
        <p className="text-inkdim">Weekly review could not be generated yet. Complete diagnosis first.</p>
      </div>
    )
  }

  const delta = (review.dimension_deltas?.integration_score as number) ?? 0
  const deltaLabel = delta >= 0 ? `+${delta}` : `${delta}`
  const nextFocus =
    review.integration_score < 60
      ? 'Collapse one Polity source into a single note this week.'
      : review.integration_score < 80
      ? 'Seal four command days. Integration follows execution.'
      : 'Maintain. Add one full paper under timed conditions.'

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <Seal variant="ceremonial" size={72} className="mx-auto mb-6" />
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.35em] text-copper">
          Week of {review.week_start}
        </p>
        <h1 className="heading-cinzel text-3xl font-bold text-indigo">Weekly Review</h1>
        <p className="mt-3 text-sm text-inkdim">{APP.brand.name} seals the peak-end loop here — not in a stats dump.</p>
      </div>

      <div className="card-calm copper-border mb-6 p-6 text-center">
        <p className="note-surface text-lg leading-relaxed text-slate900">{review.verdict}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="card-calm p-4 text-center">
          <p className="text-xs text-inkdim">Integration Score</p>
          <p className="font-mono text-4xl font-bold text-sage">{review.integration_score}</p>
          <p className="text-xs text-inkdim">{deltaLabel} from last week</p>
        </div>
        <div className="card-calm p-4 text-center">
          <p className="text-xs text-inkdim">Next week&apos;s focus</p>
          <p className="mt-2 text-sm leading-relaxed text-slate900">{nextFocus}</p>
        </div>
      </div>

      <section className="card-calm p-6">
        <h2 className="heading-cinzel mb-4 text-lg font-semibold text-copper">Three wins</h2>
        <ol className="space-y-3">
          {review.wins.map((win, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate900">
              <span className="font-mono text-copper">{String(i + 1).padStart(2, '0')}</span>
              {win}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex justify-between border-t border-linen pt-6">
        <Link href="/dashboard" className="text-sm text-inkdim transition-calm hover:text-copper">
          ← Command Board
        </Link>
        <Link href="/mock" className="text-sm text-copper transition-calm hover:underline">
          Paper Library →
        </Link>
      </div>
    </div>
  )
}
