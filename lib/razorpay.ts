import crypto from 'crypto'
import { APP } from '@/lib/config'

function tierPaise(id: 'prelims' | 'gs'): number {
  const tier = APP.pricing.tiers.find(t => t.id === id)
  if (!tier) throw new Error(`Missing pricing tier: ${id}`)
  return tier.price * 100
}

function tierDisplay(id: 'prelims' | 'gs'): string {
  const tier = APP.pricing.tiers.find(t => t.id === id)
  return tier ? `₹${tier.price.toLocaleString('en-IN')}` : ''
}

export const PLANS = {
  prelims: {
    label: APP.pricing.tiers.find(t => t.id === 'prelims')?.label ?? 'Prelims Command',
    amountPaise: tierPaise('prelims'),
    amountDisplay: tierDisplay('prelims'),
    planType: 'prelims' as const,
  },
  gs: {
    label: APP.pricing.tiers.find(t => t.id === 'gs')?.label ?? 'GS Command',
    amountPaise: tierPaise('gs'),
    amountDisplay: tierDisplay('gs'),
    planType: 'gs' as const,
  },
} as const

export type PlanKey = keyof typeof PLANS

const PLAN_RANK: Record<string, number> = { free: 0, prelims: 1, gs: 2 }

export function planRank(plan?: string | null): number {
  return PLAN_RANK[plan ?? 'free'] ?? 0
}

export function canUpgradeTo(currentPlan: string | null | undefined, target: PlanKey): boolean {
  return planRank(target) > planRank(currentPlan)
}

function basicAuth(): string {
  const keyId = process.env.RAZORPAY_KEY_ID!
  const keySecret = process.env.RAZORPAY_KEY_SECRET!
  return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
): Promise<{ id: string; amount: number; currency: string }> {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(),
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Razorpay order creation failed: ${err}`)
  }

  return res.json() as Promise<{ id: string; amount: number; currency: string }>
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export function verifyWebhookSignature(rawBody: string, header: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header))
}
