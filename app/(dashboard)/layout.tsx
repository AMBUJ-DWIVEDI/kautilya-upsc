import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import Link from 'next/link'
import Seal from '@/components/brand/Seal'

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="border-b border-chanakya-muted/30 px-4 sm:px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="shrink-0 flex items-center gap-2.5">
          <Seal variant="stamped" size={30} />
          <span className="heading-cinzel text-sm font-bold tracking-[0.2em] text-indigo">KAUTILYA</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/mock">Papers</NavLink>
          <NavLink href="/notes">Notes</NavLink>
          <NavLink href="/review">Review</NavLink>
          {isAdmin && <NavLink href="/admin/notes">Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/upgrade"
            className="heading-cinzel hidden text-xs tracking-wide text-copper transition-calm hover:text-copperlight sm:block">
            Upgrade
          </Link>
          <SignOutButton />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-chanakya-text-dim text-xs px-2 py-1 rounded hover:text-chanakya-gold
                 hover:bg-chanakya-gold/5 transition-colors whitespace-nowrap"
    >
      {children}
    </Link>
  )
}

function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <button
        type="submit"
        className="text-chanakya-text-dim text-xs hover:text-chanakya-gold transition-colors"
      >
        Sign Out
      </button>
    </form>
  )
}
