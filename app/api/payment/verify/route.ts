import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPaymentSignature } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json() as {
    razorpay_order_id:   string
    razorpay_payment_id: string
    razorpay_signature:  string
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 })
  }

  // Verify HMAC signature
  const valid = verifyPaymentSignature({
    orderId:   razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  })

  if (!valid) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  // Fetch the pending payment row to get the plan
  const { data: payment } = await supabase
    .from('payments')
    .select('plan, status')
    .eq('razorpay_order_id', razorpay_order_id)
    .eq('user_id', user.id)
    .single()

  if (!payment) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
  }

  if (payment.status === 'paid') {
    // Already processed — idempotent
    return NextResponse.json({ success: true })
  }

  // Mark payment as paid
  await supabase
    .from('payments')
    .update({
      status:              'paid',
      razorpay_payment_id,
      paid_at:             new Date().toISOString(),
    })
    .eq('razorpay_order_id', razorpay_order_id)

  // Upgrade user plan
  await supabase
    .from('users')
    .update({ plan_type: payment.plan })
    .eq('id', user.id)

  return NextResponse.json({ success: true, plan: payment.plan })
}
