import { describe, expect, it } from 'vitest'
import {
  KAUTILYA_OPERATING_LAWS,
  KAUTILYA_ROUTE_BRIEFS,
  KAUTILYA_SHELL_GROUPS,
  flattenShellActions,
} from '@/lib/kautilya/shell'

describe('KAUTILYA product shell blueprint', () => {
  it('keeps the whole product organized around the long-war operating system', () => {
    expect(KAUTILYA_OPERATING_LAWS).toEqual([
      'What is destabilizing preparation?',
      'What must be reduced?',
      'What must be integrated?',
      'What must be written?',
    ])

    expect(KAUTILYA_SHELL_GROUPS.map(group => group.label)).toEqual([
      'Command',
      'Intelligence',
      'Repair',
      'Review',
    ])
  })

  it('covers every primary authenticated route with a sober route brief', () => {
    const expectedRoutes = [
      '/dashboard',
      '/report',
      '/diagnosis',
      '/mock',
      '/notes',
      '/resources',
      '/log',
      '/review',
    ]

    for (const route of expectedRoutes) {
      expect(KAUTILYA_ROUTE_BRIEFS[route]).toBeDefined()
      expect(KAUTILYA_ROUTE_BRIEFS[route].verdict).not.toMatch(/streak|hype|motivation/i)
      expect(KAUTILYA_ROUTE_BRIEFS[route].signals.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('turns shell groups into command-palette actions without losing primary routes', () => {
    const actions = flattenShellActions(KAUTILYA_SHELL_GROUPS)
    const hrefs = actions.map(action => action.href)

    expect(actions[0]).toMatchObject({
      id: 'command-dashboard',
      label: "Open Today's Command",
      href: '/dashboard',
    })
    expect(new Set(hrefs)).toEqual(new Set(hrefs))
    expect(hrefs).toEqual(
      expect.arrayContaining(['/dashboard', '/report', '/mock', '/notes', '/resources', '/log']),
    )
  })
})
