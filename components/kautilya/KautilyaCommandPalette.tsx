'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import * as Dialog from '@radix-ui/react-dialog'
import {
  BookOpen,
  CheckSquare,
  Compass,
  FileText,
  Gauge,
  Layers,
  Map,
  PenLine,
  ScrollText,
  Shield,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/kautilya/events'
import {
  KAUTILYA_SHELL_GROUPS,
  flattenShellActions,
  type KautilyaIconName,
} from '@/lib/kautilya/shell'

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

const ACTIONS = [
  ...flattenShellActions(KAUTILYA_SHELL_GROUPS, false),
  {
    id: 'reduce-chaos',
    label: 'Reduce Resource Chaos',
    hint: 'Park or finalize sources',
    icon: 'map' as const,
    href: '/resources#source-reduction',
    event: 'kautilya_resource_audit_started' as const,
    group: 'Repair',
  },
  {
    id: 'polity-notes',
    label: 'Open Polity Smart Notes',
    hint: 'Repair library',
    icon: 'book-open' as const,
    href: '/notes/Polity',
    event: 'kautilya_smart_note_opened' as const,
    group: 'Repair',
  },
]

export default function KautilyaCommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const run = useCallback(
    (action: (typeof ACTIONS)[number]) => {
      if (action.event) trackEvent(action.event)
      setOpen(false)
      router.push(action.href)
    },
    [router],
  )

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-indigo/20 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-[18%] z-[101] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2',
            'overflow-hidden rounded-xl border border-linen bg-ivory shadow-paper',
          )}
        >
          <Dialog.Title className="sr-only">KAUTILYA Command Index</Dialog.Title>
          <div className="border-b border-linen px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">
              Command Index
            </p>
            <p className="mt-1 text-xs text-inkdim">Institutional navigation - Ctrl K</p>
          </div>

          <Command className="p-2" label="KAUTILYA commands">
            <Command.Input
              placeholder="Search commands..."
              className="w-full rounded-lg border border-linen bg-parchment px-3 py-2.5 text-sm text-slate900 outline-none placeholder:text-inkdim/70"
            />
            <Command.List className="mt-2 max-h-80 overflow-y-auto">
              <Command.Empty className="px-3 py-6 text-center text-sm text-inkdim">
                No command matched.
              </Command.Empty>
              <Command.Group heading="Long-War Commands">
                {ACTIONS.map(action => (
                  <CommandPaletteItem
                    key={action.id}
                    action={action}
                    onSelect={() => run(action)}
                  />
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CommandPaletteItem({
  action,
  onSelect,
}: {
  action: (typeof ACTIONS)[number]
  onSelect: () => void
}) {
  const Icon = ICONS[action.icon]

  return (
    <Command.Item
      value={`${action.label} ${action.hint ?? ''} ${action.group}`}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate900 aria-selected:bg-copper/10 aria-selected:text-indigo"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-linen bg-parchment text-copper">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{action.label}</span>
        {action.hint && <span className="block text-xs text-inkdim">{action.hint}</span>}
      </span>
      <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-copper sm:inline">
        {action.group}
      </span>
    </Command.Item>
  )
}
