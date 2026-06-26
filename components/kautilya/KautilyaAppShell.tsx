'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState, type ReactNode } from 'react'
import {
  BookOpen,
  CheckSquare,
  Compass,
  FileText,
  Gauge,
  Layers,
  Map,
  Menu,
  PenLine,
  ScrollText,
  Search,
  Shield,
  Target,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import Seal from '@/components/brand/Seal'
import KautilyaPageBrief from './KautilyaPageBrief'
import {
  KAUTILYA_SHELL_GROUPS,
  briefForPath,
  type KautilyaIconName,
  type KautilyaShellGroup,
} from '@/lib/kautilya/shell'
import { planLabel } from '@/lib/plans'
import { cn } from '@/lib/utils'

interface KautilyaAppShellProps {
  children: ReactNode
  isAdmin: boolean
  plan: string
  email?: string | null
}

const ICONS: Record<KautilyaIconName, LucideIcon> = {
  'book-open': BookOpen,
  'clipboard-check': CheckSquare,
  compass: Compass,
  'file-text': FileText,
  gauge: Gauge,
  layers: Layers,
  map: Map,
  'pen-line': PenLine,
  'scroll-text': ScrollText,
  shield: Shield,
  target: Target,
  zap: Zap,
}

export default function KautilyaAppShell({
  children,
  isAdmin,
  plan,
  email,
}: KautilyaAppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const brief = briefForPath(pathname)
  const groups = useMemo(
    () => KAUTILYA_SHELL_GROUPS.map(group => filterGroup(group, isAdmin)).filter(group => group.items.length > 0),
    [isAdmin],
  )

  return (
    <div className="min-h-screen bg-parchment text-slate900 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden border-r border-linen bg-ivory/88 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <ShellIdentity plan={plan} email={email} />
        <ShellNavigation groups={groups} pathname={pathname} />
        <ShellFooter />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-linen bg-ivory/92 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
              <Seal variant="stamped" size={30} />
              <span className="heading-cinzel truncate text-sm font-black tracking-[0.14em] text-indigo">
                KAUTILYA IAS
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-linen text-indigo transition-calm hover:border-copper/40"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {mobileOpen && (
            <div className="mt-3 max-h-[calc(100vh-76px)] overflow-y-auto border-t border-linen pt-3">
              <ShellNavigation groups={groups} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <div className="mt-3 border-t border-linen pt-3">
                <ShellActions />
              </div>
            </div>
          )}
        </header>

        <main className="min-h-screen">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <KautilyaPageBrief brief={brief} />
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}

function ShellIdentity({ plan, email }: { plan: string; email?: string | null }) {
  return (
    <div className="border-b border-linen px-5 py-5">
      <Link href="/dashboard" className="flex items-center gap-3">
        <Seal variant="stamped" size={38} />
        <div className="min-w-0">
          <p className="heading-cinzel truncate text-sm font-black tracking-[0.16em] text-indigo">
            KAUTILYA IAS
          </p>
          <p className="mt-1 truncate text-[11px] text-inkdim">{email ?? 'Institutional desk'}</p>
        </div>
      </Link>
      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-copper/25 bg-copper/5 px-3 py-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copper">Plan</p>
          <p className="text-sm font-black text-indigo">{planLabel(plan)}</p>
        </div>
        <Link href="/upgrade" className="text-xs font-bold text-copper hover:text-copperlight">
          Upgrade
        </Link>
      </div>
    </div>
  )
}

function ShellNavigation({
  groups,
  pathname,
  onNavigate,
}: {
  groups: KautilyaShellGroup[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {groups.map(group => (
        <div key={group.label}>
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-copper">
            {group.label}
          </p>
          <p className="mb-2 mt-1 px-2 text-[11px] leading-4 text-inkdim">{group.description}</p>
          <div className="space-y-1">
            {group.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = ICONS[item.icon]

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-calm',
                    active
                      ? 'bg-copper/10 text-indigo'
                      : 'text-inkdim hover:bg-parchment hover:text-indigo',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-calm',
                      active
                        ? 'border-copper/35 bg-ivory text-copper'
                        : 'border-linen bg-ivory/60 text-inkdim group-hover:border-copper/30 group-hover:text-copper',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold">{item.label}</span>
                    <span className="block truncate text-[11px] text-inkdim">{item.hint}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

function ShellFooter() {
  return (
    <div className="border-t border-linen p-4">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between rounded-lg border border-linen bg-parchment px-3 py-2 text-left text-xs text-inkdim"
        aria-label="Open command palette with keyboard shortcut"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-copper" />
          Command index
        </span>
        <span className="font-mono text-[10px]">Ctrl K</span>
      </button>
      <ShellActions />
    </div>
  )
}

function ShellActions() {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/upgrade" className="text-xs font-bold text-copper hover:text-copperlight">
        Unlock Command
      </Link>
      <form action="/api/auth/signout" method="POST">
        <button type="submit" className="text-xs font-semibold text-inkdim hover:text-copper">
          Sign Out
        </button>
      </form>
    </div>
  )
}

function filterGroup(group: KautilyaShellGroup, isAdmin: boolean): KautilyaShellGroup {
  return {
    ...group,
    items: group.items.filter(item => isAdmin || !item.adminOnly),
  }
}
