import Link from 'next/link'
import { APP } from '@/lib/config'
import Seal from '@/components/brand/Seal'
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  PenLine,
  ScrollText,
  ShieldCheck,
  TimerReset,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="paper-atmosphere min-h-screen overflow-x-hidden bg-parchment text-slate900">
      <SiteNav />
      <HeroSection />
      <BeliefSection />
      <SystemSection />
      <DiagnosisSection />
      <PricingSection />
      <FinalCTA />
      <SiteFooter />
    </main>
  )
}

function SiteNav() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-4 border-b border-linen bg-parchment/90 px-4 py-3 backdrop-blur sm:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <Seal variant="stamped" size={34} />
        <span className="heading-cinzel truncate text-sm font-bold tracking-[0.16em] text-indigo sm:text-base">
          KAUTILYA IAS
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-3 sm:gap-6">
        <a href="#system" className="hidden text-xs text-inkdim transition-calm hover:text-copper sm:block">
          The System
        </a>
        <a href="#pricing" className="hidden text-xs text-inkdim transition-calm hover:text-copper sm:block">
          Pricing
        </a>
        <Link
          href="/login"
          className="rounded border border-copper/40 px-3 py-2 text-xs font-semibold text-copper transition-calm hover:bg-copper hover:text-ivory sm:px-4"
        >
          Enter
        </Link>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] items-center px-4 pb-16 pt-28 sm:px-6 lg:pt-24">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-copper">
            Diagnosis-first {APP.brand.exam} command system
          </p>
          <h1 className="heading-cinzel max-w-4xl text-5xl font-black leading-[1.02] text-indigo sm:text-6xl lg:text-7xl">
            KAUTILYA IAS
            <span className="block text-copper-gradient">Command System.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-inkdim sm:text-lg">
            The syllabus is visible. The real enemy is hidden. KAUTILYA studies how <em>you</em>{' '}
            prepare: where sources fragment, where Prelims nerve leaks marks, where Mains stamina
            fades, and what recovery should look like tomorrow morning.
          </p>

          <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ['Scout', '30 premium signals'],
              ['Direction', 'one command a day'],
              ['Repair', 'notes tied to leaks'],
            ].map(([label, copy]) => (
              <div key={label} className="border-l border-copper/40 pl-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{label}</p>
                <p className="mt-1 text-sm text-inkdim">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-copper px-7 text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
            >
              Take the Diagnosis <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#system"
              className="inline-flex min-h-12 items-center justify-center rounded border border-linen px-7 text-sm font-semibold text-slate900 transition-calm hover:border-copper/50"
            >
              See How It Works
            </a>
          </div>

          <p className="mt-6 text-xs text-inkdim">
            Start with 30 premium signals free. Upgrade for the full 50-card contextual diagnosis.
          </p>
        </div>

        <div className="hidden justify-center lg:flex">
          <HeroCommandPreview />
        </div>
      </div>
    </section>
  )
}

function HeroCommandPreview() {
  const command = [
    ['Repair source chaos', 'Polity Article 32', '12 min'],
    ['Prelims nerve drill', 'Elimination set', '20 min'],
    ['Write one GS answer', 'Federalism frame', '15 min'],
    ['Log recovery signal', 'What broke rhythm?', '2 min'],
  ]

  return (
    <div className="relative w-full max-w-[430px]">
      <div className="absolute -right-4 -top-5 hidden rounded-full border border-copper/25 bg-ivory px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-copper shadow-paper lg:block">
        Live command
      </div>
      <div className="command-dossier copper-border overflow-hidden rounded-xl bg-ivory">
        <div className="border-b border-linen px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-copper">Today&apos;s Command</p>
              <h2 className="heading-cinzel mt-2 text-2xl font-bold leading-tight text-indigo">
                Highest-leverage action now.
              </h2>
            </div>
            <Seal variant="stamped" size={54} />
          </div>
        </div>

        <div className="divide-y divide-linen">
          {command.map(([title, detail, time], i) => (
            <div key={title} className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-copper/30 font-mono text-xs text-copper">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate900">{title}</p>
                <p className="truncate text-xs text-inkdim">{detail}</p>
              </div>
              <span className="rounded-full border border-linen px-2 py-1 font-mono text-[11px] text-inkdim">
                {time}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 border-t border-linen bg-parchment/70 px-5 py-4 text-center">
          {[
            ['84', 'Integration'],
            ['3', 'Leaks'],
            ['1', 'Next mock'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-mono text-xl font-bold text-indigo">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-inkdim">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BeliefSection() {
  return (
    <section className="border-y border-linen bg-ivory px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">What we hold true</p>
        <h2 className="heading-cinzel mt-4 text-3xl font-bold leading-snug text-indigo sm:text-4xl">
          You do not need more content.
          <span className="block">You need to know why you are stuck.</span>
        </h2>
        <p className="note-surface mx-auto mt-6 max-w-2xl text-inkdim">
          Twelve sources for Polity. Three pending recall cycles. A newspaper habit that became
          a collection habit. None of this is a character flaw. It is integration debt, and you
          are paying interest in months of your life. KAUTILYA exists to collect that debt back.
        </p>
      </div>
    </section>
  )
}

function SystemSection() {
  const threads = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: 'Prelims repair',
      copy: 'Forty-five minutes on the note your last mock prescribed. Linked, not searched.',
    },
    {
      icon: <PenLine className="h-5 w-5" />,
      title: 'One Mains answer',
      copy: 'A framework and a self-marking rubric. Writing daily beats planning to write.',
    },
    {
      icon: <ScrollText className="h-5 w-5" />,
      title: 'One issue to depth',
      copy: 'One issue, read to depth: story, dimensions, data, and the answer it feeds.',
    },
    {
      icon: <Compass className="h-5 w-5" />,
      title: 'Ten recall drills',
      copy: 'Spaced revision drawn from what you actually read. Memory is scheduled, not hoped for.',
    },
  ]

  return (
    <section id="system" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">The daily command</p>
        <h2 className="heading-cinzel mt-3 max-w-2xl text-3xl font-bold leading-snug text-indigo sm:text-4xl">
          One command a day. Sealed when done.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-inkdim">
          The command dashboard never asks what you want to study. It tells you what is next, in
          five threads sized to your day. Finish them and the Seal stamps the date. Miss a day and
          tomorrow&apos;s command arrives lighter: recovery is the design.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {threads.map(t => (
            <article key={t.title} className="card-calm p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-copper/30 text-copper">
                {t.icon}
              </div>
              <h3 className="text-base font-bold text-slate900">{t.title}</h3>
              <p className="mt-2 text-sm leading-6 text-inkdim">{t.copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card-calm flex items-start gap-4 p-5">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-sage" />
            <div>
              <h3 className="text-sm font-bold text-slate900">Verdict first</h3>
              <p className="mt-1 text-sm leading-6 text-inkdim">
                Every mock opens with where marks leaked, not a score parade.
              </p>
            </div>
          </div>
          <div className="card-calm flex items-start gap-4 p-5">
            <TimerReset className="mt-1 h-5 w-5 shrink-0 text-copper" />
            <div>
              <h3 className="text-sm font-bold text-slate900">Recovery built in</h3>
              <p className="mt-1 text-sm leading-6 text-inkdim">
                Missed days lighten the command instead of turning into guilt theatre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DiagnosisSection() {
  return (
    <section className="border-y border-linen bg-ivory px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">Before the syllabus, the aspirant</p>
          <h2 className="heading-cinzel mt-3 text-3xl font-bold leading-snug text-indigo sm:text-4xl">
            Thirty premium signals free. Fifty when you are ready for the full war map.
          </h2>
          <p className="mt-5 text-sm leading-7 text-inkdim">
            Scout extracts the highest-signal thirty cards from the full instrument: enough to
            name the pattern, reveal the archetype, and prescribe the first repair. Warrior and
            Commander reopen the full fifty-card diagnosis for deeper pressure, resource,
            identity, and recovery context.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded bg-copper px-6 text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
          >
            Start Long-War Diagnosis
          </Link>
          <ul className="mt-6 space-y-2.5">
            {[
              'One card per screen. No essays, no right answers.',
              'Your attempt count is used in the math, never mirrored back as a label.',
              'Progress autosaves; leave and return mid-diagnosis.',
            ].map(line => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-slate900">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <div className="card-calm copper-border w-full max-w-sm p-8 text-center">
            <Seal variant="stamped" size={84} className="mx-auto" />
            <p className="heading-cinzel mt-5 text-lg font-bold tracking-wide text-indigo">
              The Archetype Reveal
            </p>
            <p className="mt-3 text-sm leading-6 text-inkdim">
              At the end of the Scout scan, the Seal stamps your archetype: the wound named in
              one line, the pattern beneath it, and the first prescribed action. The full fifty
              makes the prescription sharper.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const [scout, prelims, gs] = APP.pricing.tiers

  return (
    <section id="pricing" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-copper">Pricing</p>
        <h2 className="heading-cinzel mt-3 text-center text-3xl font-bold text-indigo sm:text-4xl">
          Pay for command, not content.
        </h2>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-3">
          <PriceCard
            label={scout.label}
            price={scout.price}
            lines={[
              'Premium 30-card diagnosis + archetype',
              'Free report that names the first pattern',
              'Daily command sample',
              'One baseline mock with leak analysis',
            ]}
            cta="Start Scout Diagnosis"
          />
          <PriceCard
            label={prelims.label}
            price={prelims.price}
            highlighted
            lines={[
              'Full 50-card contextual diagnosis',
              'Full Prelims mock arena + repair loop',
              'Guessing-discipline and elimination analytics',
              'Prescribed Smart Notes for repair areas',
              'Weekly review, sealed every Sunday',
            ]}
            cta="Unlock Warrior"
          />
          <PriceCard
            label={gs.label}
            price={gs.price}
            lines={[
              'Everything in Warrior',
              'Full 50-card diagnosis retained',
              'Mains answer frameworks + rubrics',
              'Full GS note library as it ships',
              'Priority access to new modules',
            ]}
            cta="Unlock Commander"
          />
        </div>
      </div>
    </section>
  )
}

function PriceCard({
  label,
  price,
  lines,
  cta,
  highlighted,
}: {
  label: string
  price: number
  lines: string[]
  cta: string
  highlighted?: boolean
}) {
  return (
    <article className={`flex flex-col rounded-xl p-6 ${highlighted ? 'copper-border bg-ivory' : 'card-calm'}`}>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">{label}</p>
      <p className="mt-3 text-4xl font-black text-indigo">
        {price === 0 ? 'Free' : `Rs. ${price.toLocaleString('en-IN')}`}
        {price > 0 && <span className="ml-1 text-sm font-medium text-inkdim">one-time</span>}
      </p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {lines.map(line => (
          <li key={line} className="flex items-start gap-2.5 text-sm text-slate900">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
            {line}
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`mt-6 inline-flex min-h-11 items-center justify-center rounded text-sm font-bold transition-calm ${
          highlighted
            ? 'bg-copper text-ivory hover:bg-copperlight'
            : 'border border-linen text-slate900 hover:border-copper/50'
        }`}
      >
        {cta}
      </Link>
    </article>
  )
}

function FinalCTA() {
  return (
    <section className="border-t border-linen bg-indigo px-4 py-24 text-center sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Seal variant="stamped" size={64} className="mx-auto opacity-90" />
        <h2 className="heading-cinzel mt-6 text-3xl font-bold leading-snug text-parchment sm:text-4xl">
          The syllabus will still be there tomorrow.
          <span className="block text-copperlight">Your command path should not wait.</span>
        </h2>
        <Link
          href="/login"
          className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded bg-copper px-8 text-sm font-bold text-ivory transition-calm hover:bg-copperlight"
        >
          Take the Diagnosis <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-5 text-xs text-parchment/60">Free. About six minutes. The reveal is yours to keep.</p>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-linen px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="heading-cinzel text-sm font-bold tracking-[0.16em] text-indigo">KAUTILYA IAS</p>
          <p className="mt-1 text-xs text-inkdim">
            A command system for {APP.brand.exam}. Sibling of {APP.brand.sibling}.
          </p>
        </div>
        <p className="text-xs text-inkdim">
          {APP.contact.support} · © {new Date().getFullYear()} KAUTILYA IAS
        </p>
      </div>
    </footer>
  )
}
