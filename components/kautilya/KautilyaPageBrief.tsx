import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { KAUTILYA_OPERATING_LAWS, type KautilyaRouteBrief } from '@/lib/kautilya/shell'
import { cn } from '@/lib/utils'

interface KautilyaPageBriefProps {
  brief: KautilyaRouteBrief
  className?: string
}

export default function KautilyaPageBrief({ brief, className }: KautilyaPageBriefProps) {
  return (
    <section className={cn('intelligence-brief', className)}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-copper">
            {brief.eyebrow}
          </p>
          <h1 className="heading-cinzel mt-2 text-2xl font-black leading-tight text-indigo sm:text-3xl">
            {brief.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-inkdim">{brief.verdict}</p>
        </div>

        <div className="grid gap-2">
          <div className="rounded-lg border border-copper/25 bg-copper/5 px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-copper">
              Primary action
            </p>
            <p className="mt-1 text-sm font-bold text-indigo">{brief.primaryAction}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {brief.signals.map(signal => (
              <span key={signal} className="signal-pill">
                {signal}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 border-t border-linen pt-4 sm:grid-cols-2 xl:grid-cols-4">
        {KAUTILYA_OPERATING_LAWS.map(law => (
          <p key={law} className="text-xs leading-5 text-inkdim">
            <span className="font-bold text-copper">Law.</span> {law}
          </p>
        ))}
      </div>
    </section>
  )
}

export function BriefActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-copper px-4 text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}
