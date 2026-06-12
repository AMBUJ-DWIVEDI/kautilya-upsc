import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLANS, type PlanKey } from '@/lib/razorpay'

// Called when NEXT_PUBLIC_PAYMENT_MODE=link
// Sends user info to Make.com → Make.com creates a Razorpay Payment Link
// and Razorpay emails it to the user automatically.

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body  = await request.json() as { plan?: string }
  const plan  = body.plan as PlanKey | undefined

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const makeUrl = process.env.MAKE_WEBHOOK_URL
  if (!makeUrl) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
  }

  const { amountPaise, amountDisplay, label } = PLANS[plan]

  // Fire-and-forget to Make.com
  const makeRes = await fetch(makeUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id:        user.id,
      user_email:     user.email,
      user_name:      user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Aspirant',
      plan,
      amount_paise:   amountPaise,
      amount_display: amountDisplay,
      plan_label:     label,
      // reference_id stored in Razorpay Payment Link so webhook can resolve user+plan
      reference_id:   `${user.id}___${plan}`,
    }),
  })

  if (!makeRes.ok) {
    console.error('Make.com webhook failed:', await makeRes.text())
    return NextResponse.json({ error: 'Could not send payment link. Try again.' }, { status: 502 })
  }

  // Log request in payments table
  await supabase.from('payments').insert({
    user_id:      user.id,
    amount_paise: amountPaise,
    status:       'link_requested',
    plan,
  })

  return NextResponse.json({ status: 'link_sent' })
}
