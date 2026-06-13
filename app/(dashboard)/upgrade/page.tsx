import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { PLANS, canUpgradeTo } from '@/lib/razorpay'
import { APP } from '@/lib/config'
import PaymentButton from '@/components/PaymentButton'
import Link from 'next/link'
import Seal from '@/components/brand/Seal'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  const currentPlan = userData?.plan_type ?? 'free'
  const scout = APP.pricing.tiers.find(t => t.id === 'scout')!

  return (
    <div className="flex-1 bg-parchment px-4 py-10 text-slate900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <Seal variant="pending" size={48} className="mx-auto mb-4" />
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-copper">
            Full Command System
          </p>
          <h1 className="heading-cinzel text-3xl font-bold leading-tight text-indigo sm:text-4xl">
            Pay for integration, not another pile of sources.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-inkdim">
            Scout names the first pattern. Warrior opens the full 50-card contextual diagnosis
            and repair loop. Commander adds full note depth and Mains frameworks.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          <PlanCard
            name={scout.label}
            price="Rs. 0"
            badge="Premium entry report"
            current={currentPlan === 'free'}
            features={[
              '30-card Scout diagnosis',
              'Archetype reveal ceremony',
              'First repair direction',
              'Paper 1 baseline signal',
              'Daily command sample',
            ]}
            cta={<p className="py-3 text-center text-sm text-inkdim">Your current tier</p>}
          />

          <PlanCard
            name={PLANS.prelims.label}
            price={PLANS.prelims.amountDisplay}
            badge="Repair loop + mock arena"
            featured
            current={currentPlan === 'prelims'}
            features={[
              'Full 50-card Warrior diagnosis',
              'Full Mock Arena (100Q mocks + drills)',
              'Guessing & elimination analytics',
              'Daily 5-thread command',
              'Repair loop to Smart Notes',
              'Weekly review ceremony',
            ]}
            cta={
              currentPlan === 'prelims' || currentPlan === 'gs'
                ? <p className="py-3 text-center text-sm font-bold text-sage">Active</p>
                : canUpgradeTo(currentPlan, 'prelims')
                ? <PaymentButton
                    plan="prelims"
                    label={PLANS.prelims.label}
                    priceDisplay={PLANS.prelims.amountDisplay}
                    userEmail={user.email ?? undefined}
                    redirectTo="/dashboard"
                  />
                : <p className="py-3 text-center text-sm text-sage">Included in Commander</p>
            }
          />

          <PlanCard
            name={PLANS.gs.label}
            price={PLANS.gs.amountDisplay}
            badge="Full command system"
            current={currentPlan === 'gs'}
            features={[
              'Everything in Warrior',
              'Full 50-card diagnosis retained',
              'Full Smart Notes vault (upsc12)',
              'Mains answer frameworks daily',
              'Priority recall queue',
              'Integration signal coaching copy',
            ]}
            cta={
              currentPlan === 'gs'
                ? <p className="py-3 text-center text-sm font-bold text-sage">Active</p>
                : canUpgradeTo(currentPlan, 'gs')
                ? <PaymentButton
                    plan="gs"
                    label={PLANS.gs.label}
                    priceDisplay={PLANS.gs.amountDisplay}
                    userEmail={user.email ?? undefined}
                    redirectTo="/dashboard"
                  />
                : <p className="py-3 text-center text-sm text-inkdim">Already active</p>
            }
          />
        </div>

        <div className="card-calm mt-8 p-5 text-center">
          <p className="text-sm font-semibold text-indigo">No fake scarcity.</p>
          <p className="mx-auto mt-2 max-w-2xl text-xs leading-6 text-inkdim">
            Prices read from config — they rise only when the product earns it.
            {process.env.NEXT_PUBLIC_PAYMENT_MODE !== 'api' && (
              <> Link mode: Razorpay emails you a payment link; the webhook upgrades your plan automatically.</>
            )}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-xs font-medium text-inkdim transition-calm hover:text-copper">
            ← Back to Today&apos;s Command
          </Link>
        </div>
      </div>
    </div>
  )
}

function PlanCard({
  name, price, badge, featured, current, features, cta,
}: {
  name: string
  price: string
  badge: string
  featured?: boolean
  current?: boolean
  features: string[]
  cta: ReactNode
}) {
  return (
    <article className={`card-calm flex flex-col p-5 ${featured ? 'copper-border shadow-md' : ''}`}>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">{badge}</p>
      {current && <p className="mt-2 text-xs font-bold text-inkdim">Current tier</p>}
      <h2 className="heading-cinzel mt-3 text-lg font-bold text-indigo">{name}</h2>
      <p className="mt-3 font-mono text-3xl font-bold text-copper">{price}</p>
      <div className="my-5 h-px bg-linen" />
      <ul className="flex flex-1 flex-col gap-3">
        {features.map(feature => (
          <li key={feature} className="flex gap-2 text-xs leading-5 text-inkdim">
            <span className="mt-0.5 text-sage">+</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">{cta}</div>
    </article>
  )
}
