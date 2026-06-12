import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature } from '@/lib/razorpay'
import type { PlanKey } from '@/lib/razorpay'

// Razorpay sends POST with JSON body + X-Razorpay-Signature header
// Handles both:
//   payment.captured      — API order flow (after KYC)
//   payment_link.paid     — Make.com Payment Link flow (before KYC)
export async function POST(request: NextRequest) {
  const rawBody  = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (process.env.RAZORPAY_WEBHOOK_SECRET) {
    const valid = verifyWebhookSignature(rawBody, signature)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = JSON.parse(rawBody) as Record<string, any>
  const supabase = createAdminClient()

  // ── Flow A: API order (payment.captured) ─────────────────────
  if (event.event === 'payment.captured') {
    const { id: paymentId, order_id: orderId } = event.payload.payment.entity

    const { data: payment } = await supabase
      .from('payments')
      .select('user_id, plan, status')
      .eq('razorpay_order_id', orderId)
      .single()

    if (!payment || payment.status === 'paid') {
      return NextResponse.json({ received: true })
    }

    await supabase
      .from('payments')
      .update({ status: 'paid', razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
      .eq('razorpay_order_id', orderId)

    await supabase
      .from('users')
      .update({ plan_type: payment.plan })
      .eq('id', payment.user_id)

    return NextResponse.json({ received: true })
  }

  // ── Flow B: Payment Link (payment_link.paid) ──────────────────
  if (event.event === 'payment_link.paid') {
    const paymentId  = event.payload.payment.entity.id as string
    const linkId     = event.payload.payment_link.entity.id as string
    // reference_id was set as "{userId}___{plan}" when creating the link
    const referenceId: string = event.payload.payment_link.entity.reference_id ?? ''
    const [userId, plan]      = referenceId.split('___') as [string, PlanKey]

    if (!userId || !plan) {
      console.error('payment_link.paid: missing reference_id', referenceId)
      return NextResponse.json({ received: true })
    }

    // Check not already upgraded (idempotent)
    const { data: existingUser } = await supabase
      .from('users')
      .select('plan_type')
      .eq('id', userId)
      .single()

    // Idempotent: only upgrade if target tier is higher than current
    const rank: Record<string, number> = { free: 0, prelims: 1, gs: 2 }
    const currentRank = rank[existingUser?.plan_type ?? 'free'] ?? 0
    const targetRank = rank[plan] ?? 0
    if (targetRank <= currentRank) {
      return NextResponse.json({ received: true })
    }

    // Update the link_requested payment row → paid
    await supabase
      .from('payments')
      .update({
        status:              'paid',
        razorpay_link_id:    linkId,
        razorpay_payment_id: paymentId,
        paid_at:             new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'link_requested')
      .eq('plan', plan)

    // Upgrade user plan
    await supabase
      .from('users')
      .update({ plan_type: plan })
      .eq('id', userId)

    return NextResponse.json({ received: true })
  }

  // All other events — acknowledge
  return NextResponse.json({ received: true })
}
