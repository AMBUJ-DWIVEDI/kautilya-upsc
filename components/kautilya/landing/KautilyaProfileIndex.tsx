'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { KAUTILYA_PROFILES } from '@/lib/kautilya/landing'

export default function KautilyaProfileIndex() {
  const [selectedId, setSelectedId] = useState(KAUTILYA_PROFILES[0].id)
  const selected = KAUTILYA_PROFILES.find(profile => profile.id === selectedId) ?? KAUTILYA_PROFILES[0]

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-1 border-y border-linen py-2">
        {KAUTILYA_PROFILES.map((profile, index) => {
          const active = profile.id === selected.id
          return (
            <button
              key={profile.id}
              type="button"
              aria-expanded={active}
              onClick={() => setSelectedId(profile.id)}
              className={`flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition-calm ${
                active ? 'border-copper bg-ivory text-indigo' : 'border-transparent text-inkdim hover:text-indigo'
              }`}
            >
              <span className="font-mono text-xs text-copper">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-sm font-bold">{profile.name}</span>
            </button>
          )
        })}
      </div>

      <article className="institutional-surface p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">Aspirant profile</p>
        <h3 className="heading-cinzel mt-3 text-2xl font-black text-indigo sm:text-3xl">{selected.name}</h3>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-inkdim">{selected.whoTheyAre}</p>

        <blockquote className="mt-6 border-l-2 border-copper pl-4 text-lg font-bold leading-8 text-indigo">
          {selected.seenLanguage}
        </blockquote>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">Inner sentence</p>
            <p className="mt-2 text-sm italic leading-6 text-inkdim">&ldquo;{selected.innerSentence}&rdquo;</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-copper">Needed command</p>
            <ul className="mt-2 grid gap-2">
              {selected.needs.map(need => (
                <li key={need} className="flex items-center gap-2 text-sm text-slate900">
                  <Check className="h-4 w-4 text-sage" />
                  {need}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-7 border-t border-linen pt-6">
          <p className="text-sm leading-6 text-inkdim">{selected.marketBlindSpot}</p>
          <Link href={selected.offer.href} className="mt-4 inline-flex items-center gap-2 text-sm font-black text-copper hover:text-copperlight">
            {selected.offer.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  )
}
