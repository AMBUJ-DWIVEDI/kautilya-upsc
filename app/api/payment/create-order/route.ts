import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRazorpayOrder, PLANS, type PlanKey, canUpgradeTo } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json() as { plan?: string }
  const plan = body.plan as PlanKey | undefined

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Don't re-create if already on a paid plan
  const { data: current } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  if (!canUpgradeTo(current?.plan_type, plan)) {
    return NextResponse.json({ error: 'Already on this plan or higher' }, { status: 400 })
  }

  const { amountPaise } = PLANS[plan]
  const receipt = `rcpt_${user.id.slice(0, 8)}_${Date.now()}`

  let rzpOrder: Awaited<ReturnType<typeof createRazorpayOrder>>
  try {
    rzpOrder = await createRazorpayOrder(amountPaise, receipt)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not create payment order. Try again.' }, { status: 502 })
  }

  // Save pending payment record
  await supabase.from('payments').insert({
    user_id:           user.id,
    razorpay_order_id: rzpOrder.id,
    amount_paise:      amountPaise,
    status:            'created',
    plan,
  })

  return NextResponse.json({
    orderId:  rzpOrder.id,
    amount:   rzpOrder.amount,
    currency: rzpOrder.currency,
    keyId:    process.env.RAZORPAY_KEY_ID,
    plan,
  })
}
