import { Compass, Landmark, MessageSquareText, Trophy } from 'lucide-react'

const previews = [
  { icon: Compass, label: 'Command', title: 'Reduce before expansion.', copy: 'One weekly brief declares what to reduce, integrate, write, revise, and ignore.' },
  { icon: Landmark, label: 'Anchor', title: 'The reason you return.', copy: 'Diagnosis, emotional anchors, target score, rank, post, and personal laws in one private dossier.' },
  { icon: Trophy, label: 'Leaderboard', title: 'Pressure, calibrated.', copy: 'A transparent composite of mock performance, consistency, integration, writing, and recovery.' },
  { icon: MessageSquareText, label: 'Forum', title: 'A common room, not a feed.', copy: 'Moderated problem rooms for source chaos, Prelims nerve, Mains architecture, optional stability, and return.' },
]

export default function KautilyaProductPreview() {
  return (
    <div className="mt-10 grid gap-px overflow-hidden border border-linen bg-linen sm:grid-cols-2">
      {previews.map(({ icon: Icon, label, title, copy }) => (
        <article key={label} className="bg-ivory p-6 sm:p-8">
          <div className="flex items-center gap-3 text-copper">
            <Icon className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-[0.22em]">{label}</p>
          </div>
          <h3 className="heading-cinzel mt-5 text-xl font-black text-indigo">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-inkdim">{copy}</p>
        </article>
      ))}
    </div>
  )
}
