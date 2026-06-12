'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import type { PlanKey } from '@/lib/razorpay'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

function loadCheckoutScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface Props {
  plan: PlanKey
  label: string
  priceDisplay: string
  userEmail?: string
  userName?: string
  className?: string
  onSuccess?: (plan: PlanKey) => void
}

const PAYMENT_MODE = process.env.NEXT_PUBLIC_PAYMENT_MODE ?? 'api'

export default function PaymentButton({
  plan,
  label,
  priceDisplay,
  userEmail,
  userName,
  className,
  onSuccess,
}: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'verifying' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleLinkMode() {
    setState('loading')
    setErrorMsg('')
    track('payment_initiated', { plan, mode: 'link' })

    const res = await fetch('/api/payment/request-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json() as { status?: string; error?: string }

    if (!res.ok) {
      setErrorMsg(data.error ?? 'Could not send payment link. Try again.')
      setState('error')
      track('payment_failed', { plan, mode: 'link', stage: 'request_link' })
      return
    }

    setState('done')
    track('payment_link_sent', { plan })
  }

  async function handleApiMode() {
    setState('loading')
    setErrorMsg('')
    track('payment_initiated', { plan, mode: 'api' })

    const loaded = await loadCheckoutScript()
    if (!loaded) {
      setErrorMsg('Could not load payment gateway. Check your connection.')
      setState('error')
      track('payment_failed', { plan, mode: 'api', stage: 'script_load' })
      return
    }

    const orderRes = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const orderData = await orderRes.json() as {
      orderId?: string
      amount?: number
      currency?: string
      keyId?: string
      error?: string
    }

    if (!orderRes.ok || !orderData.orderId) {
      setErrorMsg(orderData.error ?? 'Could not create order. Try again.')
      setState('error')
      track('payment_failed', { plan, mode: 'api', stage: 'create_order' })
      return
    }

    const rzp = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency ?? 'INR',
      name: 'KAUTILYA UPSC',
      description: label,
      order_id: orderData.orderId,
      prefill: {
        email: userEmail ?? '',
        name: userName ?? '',
      },
      theme: { color: '#B0763B' },
      modal: {
        ondismiss: () => {
          if (state === 'loading') setState('idle')
        },
      },
      handler: async (response: {
        razorpay_payment_id: string
        razorpay_order_id: string
        razorpay_signature: string
      }) => {
        setState('verifying')
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        })
        const verifyData = await verifyRes.json() as {
          success?: boolean
          error?: string
          plan?: PlanKey
        }

        if (!verifyRes.ok || !verifyData.success) {
          setErrorMsg(verifyData.error ?? 'Payment verification failed. Contact support.')
          setState('error')
          track('payment_failed', { plan, mode: 'api', stage: 'verify' })
          return
        }

        setState('done')
        track('payment_completed', { plan, mode: 'api' })
        onSuccess?.(verifyData.plan ?? plan)
      },
    })

    rzp.open()
  }

  const handleClick = PAYMENT_MODE === 'link' ? handleLinkMode : handleApiMode

  if (state === 'done') {
    if (PAYMENT_MODE === 'link') {
      return (
        <div className={cn('flex flex-col items-center gap-2 py-2', className)}>
          <span className="text-sm font-semibold text-sage">Payment link sent to your email.</span>
          <span className="text-center text-xs text-inkdim">
            Complete payment from your inbox. Your plan activates automatically after payment.
          </span>
        </div>
      )
    }
    return (
      <div className={cn('flex flex-col items-center gap-1', className)}>
        <span className="text-sm font-semibold text-sage">Payment successful</span>
        <span className="text-xs text-inkdim">Refreshing your access...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={state === 'loading' || state === 'verifying'}
        className={cn(
          'w-full rounded-lg py-3 text-sm font-semibold tracking-wide transition-all',
          'bg-copper text-ivory hover:bg-copperlight transition-calm',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
      >
        {state === 'loading' && (PAYMENT_MODE === 'link' ? 'Sending link...' : 'Opening payment...')}
        {state === 'verifying' && 'Confirming payment...'}
        {state === 'idle' && `Pay ${priceDisplay}`}
        {state === 'error' && `Retry - Pay ${priceDisplay}`}
      </button>

      {state === 'error' && (
        <p className="text-center text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  )
}
