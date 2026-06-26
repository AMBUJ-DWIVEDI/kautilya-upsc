import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import KautilyaAppShell from '@/components/kautilya/KautilyaAppShell'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = user.email === process.env.ADMIN_EMAIL
  const { data: userData } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  const plan = (userData?.plan_type as string | null) ?? 'free'

  return (
    <KautilyaAppShell isAdmin={isAdmin} plan={plan} email={user.email}>
      {children}
    </KautilyaAppShell>
  )
}
