'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import * as Dialog from '@radix-ui/react-dialog'
import {
  BookOpen,
  Compass,
  FileText,
  Map,
  Minimize2,
  PenLine,
  ScrollText,
  Shield,
  Target,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/kautilya/events'

interface CommandAction {
  id: string
  label: string
  hint?: string
  icon: React.ReactNode
  href: string
  event?: Parameters<typeof trackEvent>[0]
}

const ACTIONS: CommandAction[] = [
  {
    id: 'diagnosis',
    label: 'Take Long-War Diagnosis',
    hint: 'Scout instrument',
    icon: <Shield className="h-4 w-4" />,
    href: '/diagnosis',
    event: 'kautilya_diagnosis_started',
  },
  {
    id: 'resource-map',
    label: 'Open Resource Map',
    hint: 'Integration view',
    icon: <Map className="h-4 w-4" />,
    href: '/dashboard#resource-map',
    event: 'kautilya_resource_map_viewed',
  },
  {
    id: 'reduce-chaos',
    label: 'Reduce Resource Chaos',
    hint: 'Park or finalize sources',
    icon: <Minimize2 className="h-4 w-4" />,
    href: '/dashboard#source-reduction',
    event: 'kautilya_resource_audit_started',
  },
  {
    id: 'write-answer',
    label: 'Write One Answer',
    hint: 'Mains repair',
    icon: <PenLine className="h-4 w-4" />,
    href: '/dashboard#answer-repair',
    event: 'kautilya_answer_repair_started',
  },
  {
    id: 'current-affairs',
    label: 'Open Current Affairs Inbox',
    hint: 'Integrate, do not collect',
    icon: <ScrollText className="h-4 w-4" />,
    href: '/dashboard#current-affairs',
  },
  {
    id: 'polity-notes',
    label: 'Open Polity Smart Notes',
    hint: 'Repair library',
    icon: <BookOpen className="h-4 w-4" />,
    href: '/notes/Polity',
    event: 'kautilya_smart_note_opened',
  },
  {
    id: 'prelims-drill',
    label: 'Start Prelims Drill',
    hint: 'Mock arena',
    icon: <Zap className="h-4 w-4" />,
    href: '/mock',
  },
  {
    id: 'weekly-command',
    label: 'Open Weekly Command',
    hint: 'Long-war report',
    icon: <Compass className="h-4 w-4" />,
    href: '/dashboard#weekly-command',
  },
  {
    id: 'answer-repair',
    label: 'Open Mains Answer Repair',
    hint: 'Architecture, not knowledge',
    icon: <FileText className="h-4 w-4" />,
    href: '/dashboard#answer-repair',
    event: 'kautilya_answer_repair_started',
  },
  {
    id: 'report',
    label: 'Open Long-War Report',
    hint: 'Command diagnosis',
    icon: <Target className="h-4 w-4" />,
    href: '/report',
    event: 'kautilya_long_war_report_viewed',
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
    (action: CommandAction) => {
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
            'fixed left-1/2 top-[18%] z-[101] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2',
            'overflow-hidden rounded-xl border border-linen bg-ivory shadow-paper',
          )}
        >
          <Dialog.Title className="sr-only">KAUTILYA Command Index</Dialog.Title>
          <div className="border-b border-linen px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">
              Command Index
            </p>
            <p className="mt-1 text-xs text-inkdim">Institutional navigation · ⌘K</p>
          </div>

          <Command className="p-2" label="KAUTILYA commands">
            <Command.Input
              placeholder="Search commands..."
              className="w-full rounded-lg border border-linen bg-parchment px-3 py-2.5 text-sm text-slate900 outline-none placeholder:text-inkdim/70"
            />
            <Command.List className="mt-2 max-h-72 overflow-y-auto">
              <Command.Empty className="px-3 py-6 text-center text-sm text-inkdim">
                No command matched.
              </Command.Empty>
              <Command.Group heading="Long-War Commands">
                {ACTIONS.map(action => (
                  <Command.Item
                    key={action.id}
                    value={`${action.label} ${action.hint ?? ''}`}
                    onSelect={() => run(action)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate900 aria-selected:bg-copper/10 aria-selected:text-indigo"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-linen bg-parchment text-copper">
                      {action.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{action.label}</span>
                      {action.hint && (
                        <span className="block text-xs text-inkdim">{action.hint}</span>
                      )}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
