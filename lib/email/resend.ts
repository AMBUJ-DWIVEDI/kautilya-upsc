// KAUTILYA-DECISION: Resend via fetch — no SDK dependency for one weekly email.

export interface SendEmailInput {
  to: string
  subject: string
  html: string
}

export async function sendResendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM ?? 'KAUTILYA <reviews@kautilyaupsc.com>'

  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY not set' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  })

  if (!res.ok) {
    return { ok: false, error: await res.text() }
  }
  return { ok: true }
}
