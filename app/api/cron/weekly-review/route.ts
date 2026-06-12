import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateWeeklyReviewForUser, weeklyReviewEmailHtml } from '@/lib/weekly/review'
import { sendResendEmail } from '@/lib/email/resend'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: users, error } = await admin
    .from('users')
    .select('id, email')
    .not('email', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let generated = 0
  let emailed = 0
  const failures: string[] = []

  for (const u of users ?? []) {
    const review = await generateWeeklyReviewForUser(admin, u.id)
    if (!review) continue
    generated++

    if (u.email) {
      const result = await sendResendEmail({
        to: u.email,
        subject: 'KAUTILYA — Your week, sealed',
        html: weeklyReviewEmailHtml(review),
      })
      if (result.ok) emailed++
      else failures.push(`${u.id}: ${result.error}`)
    }
  }

  return NextResponse.json({
    ok: true,
    users: users?.length ?? 0,
    generated,
    emailed,
    failures: failures.slice(0, 5),
  })
}
