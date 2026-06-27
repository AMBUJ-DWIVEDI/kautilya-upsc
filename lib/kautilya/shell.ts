import type { KautilyaEvent } from '@/lib/kautilya/events'

export const KAUTILYA_OPERATING_LAWS = [
  'What is destabilizing preparation?',
  'What must be reduced?',
  'What must be integrated?',
  'What must be written?',
] as const

export type KautilyaIconName =
  | 'book-open'
  | 'clipboard-check'
  | 'compass'
  | 'file-text'
  | 'gauge'
  | 'landmark'
  | 'layers'
  | 'map'
  | 'message-square-text'
  | 'pen-line'
  | 'scroll-text'
  | 'shield'
  | 'trophy'
  | 'target'
  | 'zap'

export interface KautilyaShellItem {
  id: string
  label: string
  href: string
  hint: string
  icon: KautilyaIconName
  event?: KautilyaEvent
  adminOnly?: boolean
}

export interface KautilyaShellGroup {
  label: string
  description: string
  items: KautilyaShellItem[]
}

export interface KautilyaRouteBrief {
  eyebrow: string
  title: string
  verdict: string
  primaryAction: string
  signals: string[]
}

export const KAUTILYA_SHELL_GROUPS: KautilyaShellGroup[] = [
  {
    label: 'Command',
    description: 'Daily execution and recovery rhythm.',
    items: [
      {
        id: 'command-dashboard',
        label: 'Open Weekly Command',
        href: '/kautilya/command',
        hint: 'Weekly brief: reduce, integrate, write, revise',
        icon: 'gauge',
      },
      {
        id: 'anchor-vault',
        label: 'Open Anchor',
        href: '/anchor',
        hint: 'Personal vault, rules, diagnosis, and return logic',
        icon: 'landmark',
      },
      {
        id: 'leaderboard',
        label: 'Open Leaderboard',
        href: '/leaderboard',
        hint: 'Composite rank across performance, command, integration, writing, and recovery',
        icon: 'trophy',
      },
      {
        id: 'daily-log',
        label: 'Open Daily Log',
        href: '/log',
        hint: 'Two minutes to locate the day',
        icon: 'clipboard-check',
      },
    ],
  },
  {
    label: 'Intelligence',
    description: 'Diagnosis, dossier, and evidence.',
    items: [
      {
        id: 'diagnosis',
        label: 'Take Long-War Diagnosis',
        href: '/diagnosis',
        hint: 'Map the aspirant before prescribing the work',
        icon: 'shield',
        event: 'kautilya_diagnosis_started',
      },
      {
        id: 'report',
        label: 'Open Long-War Report',
        href: '/report',
        hint: 'Institutional dossier over raw motivation',
        icon: 'target',
        event: 'kautilya_long_war_report_viewed',
      },
      {
        id: 'mock-arena',
        label: 'Open Mock Arena',
        href: '/mock',
        hint: 'Pressure, guessing, elimination, repair',
        icon: 'zap',
      },
    ],
  },
  {
    label: 'Repair',
    description: 'Reduce sources, integrate notes, write answers.',
    items: [
      {
        id: 'repair-library',
        label: 'Open Repair Library',
        href: '/notes',
        hint: 'Smart notes tied to leaks',
        icon: 'book-open',
        event: 'kautilya_smart_note_opened',
      },
      {
        id: 'resource-map',
        label: 'Open Resource Audit',
        href: '/resources',
        hint: 'Finalize, park, or kill open sources',
        icon: 'map',
        event: 'kautilya_resource_map_viewed',
      },
      {
        id: 'answer-repair',
        label: 'Open Mains Answer Repair',
        href: '/dashboard#answer-repair',
        hint: 'Architecture, not knowledge display',
        icon: 'pen-line',
        event: 'kautilya_answer_repair_started',
      },
      {
        id: 'current-affairs',
        label: 'Open Current Affairs Inbox',
        href: '/dashboard#current-affairs',
        hint: 'Integrate issues into static ground',
        icon: 'scroll-text',
      },
    ],
  },
  {
    label: 'Review',
    description: 'Weekly recall and internal operations.',
    items: [
      {
        id: 'weekly-review',
        label: 'Open Recall Review',
        href: '/review',
        hint: 'Resurface what the week tried to lose',
        icon: 'compass',
      },
      {
        id: 'discussion-forum',
        label: 'Open Discussion Forum',
        href: '/forum',
        hint: 'Threaded common room for command problems',
        icon: 'message-square-text',
      },
      {
        id: 'admin-notes',
        label: 'Admin Note Desk',
        href: '/admin/notes',
        hint: 'Internal note operations',
        icon: 'layers',
        adminOnly: true,
      },
    ],
  },
]

export const KAUTILYA_ROUTE_BRIEFS: Record<string, KautilyaRouteBrief> = {
  '/dashboard': {
    eyebrow: 'Command desk',
    title: "Today's Command",
    verdict: 'Execute the highest-leverage repair before expanding the syllabus.',
    primaryAction: 'Seal the command',
    signals: ['Readiness', 'Integration', 'Prelims clock'],
  },
  '/kautilya/command': {
    eyebrow: 'War command',
    title: 'Weekly Command Brief',
    verdict: 'Enough noise. Here is what must be reduced, integrated, written, revised, and ignored.',
    primaryAction: 'Seal command',
    signals: ['Long-war signal', 'Source authority', 'Weekly review'],
  },
  '/anchor': {
    eyebrow: 'Personal anchor',
    title: 'Anchor Vault',
    verdict: 'The long war needs a private evidence vault for purpose, pressure, and return.',
    primaryAction: 'Review anchor',
    signals: ['Operating profile', 'Rules', 'Target memory'],
  },
  '/forum': {
    eyebrow: 'Community layer',
    title: 'Discussion Forum',
    verdict: 'A civil-services common room organized around command problems.',
    primaryAction: 'Open threads',
    signals: ['Source reduction', 'Mains architecture', 'Recovery desk'],
  },
  '/leaderboard': {
    eyebrow: 'Calibrated pressure',
    title: 'KAUTILYA Leaderboard',
    verdict: 'Preparation quality is larger than a single mock score.',
    primaryAction: 'Review rank factors',
    signals: ['Performance', 'Consistency', 'Integration'],
  },
  '/report': {
    eyebrow: 'Long-war intelligence',
    title: 'Command Dossier',
    verdict: 'The diagnosis is useful only when it changes the next seven days.',
    primaryAction: 'Read the dossier',
    signals: ['Archetype', 'Primary leak', '7-day command'],
  },
  '/diagnosis': {
    eyebrow: 'Operating profile',
    title: 'Long-War Diagnosis',
    verdict: 'Map the preparation pattern before adding another source.',
    primaryAction: 'Begin diagnosis',
    signals: ['Resource chaos', 'Prelims nerve', 'Mains stamina'],
  },
  '/mock': {
    eyebrow: 'Pressure room',
    title: 'Mock Arena',
    verdict: 'Scores are evidence; leaks become repair commands.',
    primaryAction: 'Start baseline',
    signals: ['Guessing discipline', 'Elimination', 'Cutoff distance'],
  },
  '/notes': {
    eyebrow: 'Repair library',
    title: 'Smart Notes',
    verdict: 'Each brief must repair a leak, feed an answer, or return for recall.',
    primaryAction: 'Open repair brief',
    signals: ['PYQ traps', 'Mains hooks', 'Active recall'],
  },
  '/resources': {
    eyebrow: 'Source reduction',
    title: 'Resource Audit',
    verdict: 'Preparation improves when the open-source pile gets smaller.',
    primaryAction: 'Reduce a source',
    signals: ['Final', 'Parked', 'Dead weight'],
  },
  '/log': {
    eyebrow: 'Recovery record',
    title: 'Daily Log',
    verdict: 'Locate the day clearly so tomorrow can return faster.',
    primaryAction: 'Log the signal',
    signals: ['Recovery speed', 'Distraction', 'Return path'],
  },
  '/review': {
    eyebrow: 'Weekly recall',
    title: 'Recall Review',
    verdict: 'A week is useful when it tells you what to repeat less and revise more.',
    primaryAction: 'Review the week',
    signals: ['Revision debt', 'Open fronts', 'Must write'],
  },
}

export function flattenShellActions(groups: KautilyaShellGroup[], includeAdmin = true) {
  return groups.flatMap(group =>
    group.items
      .filter(item => includeAdmin || !item.adminOnly)
      .map(item => ({
        ...item,
        group: group.label,
      })),
  )
}

export function briefForPath(pathname: string) {
  const exact = KAUTILYA_ROUTE_BRIEFS[pathname]
  if (exact) return exact

  const match = Object.entries(KAUTILYA_ROUTE_BRIEFS)
    .sort(([a], [b]) => b.length - a.length)
    .find(([route]) => pathname === route || pathname.startsWith(`${route}/`))

  return match?.[1] ?? KAUTILYA_ROUTE_BRIEFS['/dashboard']
}
