import LeaderboardTable, { type LeaderboardRow } from '@/components/kautilya/leaderboard/LeaderboardTable'
import { createClient } from '@/lib/supabase/server'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('kautilya_leaderboard').select('*').eq('visible', true).order('kautilya_rank_score', { ascending: false }).limit(50)

  return (
    <main className="flex-1 bg-parchment px-4 pb-12 pt-2 text-slate900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="institutional-surface mb-7 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">KAUTILYA Leaderboard</p>
          <h1 className="heading-cinzel mt-3 text-3xl font-black text-indigo sm:text-5xl">Rank pressure, without vanity.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-inkdim">Mock performance 30%. Command consistency 25%. Integration 20%. Answer writing 15%. Recovery discipline 10%.</p>
          <div className="mt-6 inline-flex border border-linen bg-ivory p-1 text-xs font-bold text-inkdim">
            <button className="bg-indigo px-4 py-2 text-ivory">All time</button>
            <button disabled className="px-4 py-2 opacity-45">30 days</button>
            <button disabled className="px-4 py-2 opacity-45">This week</button>
          </div>
        </header>
        <LeaderboardTable rows={(data ?? []) as LeaderboardRow[]} currentUserId={user!.id} />
      </div>
    </main>
  )
}
