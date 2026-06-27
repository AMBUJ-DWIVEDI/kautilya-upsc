import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  FileWarning,
  PenLine,
  ShieldCheck,
  TimerReset,
} from 'lucide-react'
import Seal from '@/components/brand/Seal'
import KautilyaProfileIndex from './KautilyaProfileIndex'
import KautilyaProductPreview from './KautilyaProductPreview'

const problems = [
  { title: 'Resource chaos', copy: 'If every source is important, nothing is final.', icon: FileWarning },
  { title: 'Prelims nerve', copy: 'Two plausible options keep defeating judgement.', icon: ShieldCheck },
  { title: 'Mains architecture', copy: 'Knowledge arrives without an answer structure.', icon: PenLine },
  { title: 'Attempt fatigue', copy: 'The examination has started to occupy identity.', icon: TimerReset },
]

const steps = [
  'Long-War Diagnosis',
  'Archetype Reveal',
  'Resource Chaos Map',
  'Source Authority Decision',
  'Prelims Nerve Signal',
  'Mains Architecture Signal',
  'Current Affairs Integration',
  'Weekly Command Brief',
]

export default function KautilyaLandingPage() {
  return (
    <main className="paper-atmosphere min-h-screen overflow-x-hidden bg-parchment text-slate900">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-linen bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Seal variant="stamped" size={36} />
            <span className="heading-cinzel text-sm font-black tracking-[0.16em] text-indigo">KAUTILYA IAS</span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="#profiles" className="hidden text-xs font-semibold text-inkdim hover:text-copper sm:block">Profiles</a>
            <a href="#system" className="hidden text-xs font-semibold text-inkdim hover:text-copper sm:block">The system</a>
            <Link href="/login" className="rounded bg-copper px-4 py-2 text-xs font-black text-ivory hover:bg-copperlight">Enter</Link>
          </div>
        </div>
      </nav>

      <section className="relative px-4 pb-10 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:pt-32">
        <div className="mx-auto grid max-w-7xl gap-10 2xl:grid-cols-[minmax(0,1fr)_420px] 2xl:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">UPSC long-war command system</p>
            <h1 className="heading-cinzel mt-5 max-w-4xl text-4xl font-black leading-[1.03] text-indigo sm:text-6xl">
              The syllabus is visible.
              <span className="block text-copper-gradient">The real enemy is hidden.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-inkdim sm:text-lg">
              KAUTILYA diagnoses resource chaos, Prelims nerve, Mains answer weakness, current-affairs disconnection, optional drift, and attempt fatigue, then issues the command your preparation needs next.
            </p>
            <p className="mt-4 text-sm font-black text-indigo">Before it gives a plan, it diagnoses the war.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-copper px-7 text-sm font-black text-ivory hover:bg-copperlight">
                Take Long-War Diagnosis <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#profiles" className="inline-flex min-h-12 items-center justify-center rounded border border-linen bg-ivory px-7 text-sm font-bold text-indigo hover:border-copper/40">Find your profile</a>
            </div>
          </div>

          <div className="institutional-surface copper-border hidden p-6 2xl:block">
            <div className="flex items-start justify-between gap-4 border-b border-linen pb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-copper">Command Brief</p>
                <h2 className="heading-cinzel mt-2 text-2xl font-black text-indigo">Integration, not expansion.</h2>
              </div>
              <Seal variant="stamped" size={58} />
            </div>
            <dl className="divide-y divide-linen">
              {[
                ['Long-War Signal', 'Resource chaos is destabilizing revision.'],
                ['Source Authority', 'Final / Secondary / Parked / Dead'],
                ['Mains Architecture', 'Knowledge is present. Architecture is missing.'],
                ['Return Order', 'One source. One answer. One valid day.'],
              ].map(([term, detail]) => (
                <div key={term} className="py-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{term}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-6 text-indigo">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section id="problem" className="border-y border-linen bg-ivory px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">The hidden front</p>
          <h2 className="heading-cinzel mt-3 max-w-3xl text-3xl font-black leading-tight text-indigo sm:text-5xl">Most aspirants do not lack material. They lack authority.</h2>
          <div className="mt-10 grid gap-px overflow-hidden border border-linen bg-linen sm:grid-cols-2 lg:grid-cols-4">
            {problems.map(({ title, copy, icon: Icon }) => (
              <article key={title} className="bg-parchment p-6">
                <Icon className="h-5 w-5 text-copper" />
                <h3 className="mt-5 text-base font-black text-indigo">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-inkdim">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">Why KAUTILYA exists</p>
            <h2 className="heading-cinzel mt-3 text-3xl font-black text-indigo sm:text-4xl">UPSC preparation is not only a content problem. It is a command problem.</h2>
          </div>
          <div className="grid gap-px border border-linen bg-linen sm:grid-cols-2">
            <div className="bg-ivory p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-inkdim">Normal preparation</p>
              <ul className="mt-4 space-y-3 text-sm text-inkdim">
                {['More sources', 'More PDFs', 'More borrowed plans', 'More unintegrated tests', 'More guilt'].map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="bg-indigo p-6 text-parchment">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-copperlight">KAUTILYA command</p>
              <ul className="mt-4 space-y-3 text-sm">
                {['Diagnose the hidden front', 'Declare source authority', 'Integrate current affairs', 'Repair answer architecture', 'Issue weekly command'].map(item => (
                  <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-copperlight" />{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="profiles" className="border-y border-linen bg-ivory px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">Primarily built for</p>
          <h2 className="heading-cinzel mt-3 max-w-4xl text-3xl font-black text-indigo sm:text-5xl">Different aspirants. Different hidden fronts. One command system.</h2>
          <KautilyaProfileIndex />
        </div>
      </section>

      <section id="system" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">From chaos to command</p>
          <h2 className="heading-cinzel mt-3 text-3xl font-black text-indigo sm:text-5xl">The preparation acquires a chain of authority.</h2>
          <ol className="mt-10 grid gap-px border border-linen bg-linen sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step} className="bg-parchment p-6">
                <span className="font-mono text-xs font-bold text-copper">{String(index + 1).padStart(2, '0')}</span>
                <p className="mt-5 text-sm font-black text-indigo">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="preview" className="border-y border-linen bg-ivory px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">The authenticated system</p>
          <h2 className="heading-cinzel mt-3 text-3xl font-black text-indigo sm:text-5xl">A command layer above your preparation.</h2>
          <KautilyaProductPreview />
        </div>
      </section>

      <section id="belief" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Compass className="mx-auto h-7 w-7 text-copper" />
          <h2 className="heading-cinzel mt-5 text-4xl font-black text-indigo sm:text-6xl">Integration, not expansion.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-inkdim">UPSC does not reward possession of material. It rewards arranged knowledge under pressure.</p>
          <blockquote className="heading-cinzel mt-10 border-y border-linen py-8 text-2xl font-black text-copper">If everything is important, nothing is final.</blockquote>
        </div>
      </section>

      <section id="access" className="bg-indigo px-4 py-24 text-parchment sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-copperlight">The long war needs command</p>
            <h2 className="heading-cinzel mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Diagnose the hidden front. Reduce what is unnecessary. Write what must be written.</h2>
          </div>
          <div className="border border-parchment/20 p-6">
            <BookOpen className="h-6 w-6 text-copperlight" />
            <p className="mt-5 text-sm leading-7 text-parchment/75">Keep your books. Keep your test series. Keep your teachers. KAUTILYA tells you what is destabilizing the long war and what must happen next.</p>
            <Link href="/login" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-copper px-6 text-sm font-black text-ivory hover:bg-copperlight">
              Take Long-War Diagnosis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-linen px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="heading-cinzel text-sm font-black tracking-[0.16em] text-indigo">KAUTILYA IAS</p>
          <p className="text-xs text-inkdim">Command your preparation.</p>
        </div>
      </footer>

      <Link href="/login" className="fixed inset-x-4 bottom-4 z-40 flex min-h-12 items-center justify-center rounded bg-copper text-sm font-black text-ivory shadow-paper sm:hidden">
        Take Long-War Diagnosis
      </Link>
    </main>
  )
}
