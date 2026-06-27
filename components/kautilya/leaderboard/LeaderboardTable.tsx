import { getRankConfidence } from '@/lib/kautilya/leaderboard'

export interface LeaderboardRow {
  user_id: string
  display_name: string
  kautilya_rank_score: number
  mock_performance: number
  command_consistency: number
  integration: number
  answer_writing: number
  recovery: number
}

export default function LeaderboardTable({ rows, currentUserId }: { rows: LeaderboardRow[]; currentUserId: string }) {
  return (
    <div className="overflow-x-auto border border-linen bg-ivory">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-linen bg-parchment text-xs uppercase tracking-[0.16em] text-inkdim">
          <tr>{['Rank', 'Aspirant', 'KAUTILYA', 'Mock', 'Command', 'Integration', 'Writing', 'Recovery'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-linen">
          {rows.map((row, index) => (
            <tr key={row.user_id} className={row.user_id === currentUserId ? 'bg-copper/5' : ''}>
              <td className="px-4 py-4 font-mono font-black text-copper">#{index + 1}</td>
              <td className="px-4 py-4 font-black text-indigo">{row.display_name}<span className="ml-2 text-[10px] uppercase text-inkdim">{getRankConfidence([row.mock_performance, row.command_consistency, row.integration, row.answer_writing, row.recovery])}</span></td>
              <td className="px-4 py-4 font-mono text-xl font-black text-indigo">{row.kautilya_rank_score}</td>
              {[row.mock_performance, row.command_consistency, row.integration, row.answer_writing, row.recovery].map((value, valueIndex) => <td key={valueIndex} className="px-4 py-4 font-mono text-inkdim">{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="px-5 py-12 text-center text-sm text-inkdim">The board activates after enough preparation signals are recorded.</p>}
    </div>
  )
}
