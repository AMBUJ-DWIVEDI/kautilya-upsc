import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getOrCreateTodayCommand, todayDateString } from '@/lib/command/generate'
import type { DailyCommandRow } from '@/lib/command/types'

function existingRow(userId: string): DailyCommandRow {
  const today = todayDateString()
  return {
    id: 'cmd-existing',
    user_id: userId,
    command_date: today,
    threads: [{ id: 't1', type: 'prelims_revision', title: 'Existing', target: '45 min', note_ids: [], locked: false }],
    completed: [],
    sealed: false,
    is_reentry: false,
    insight: null,
  }
}

/** Minimal fluent mock for the Supabase chains used by getOrCreateTodayCommand. */
function mockSupabase(handlers: {
  existing?: DailyCommandRow | null
  last?: { command_date: string; sealed: boolean } | null
  notes?: { id: string; slug: string; section: string; topic: string }[]
  insertResult?: { data: DailyCommandRow | null; error: { code?: string } | null }
  racedRow?: DailyCommandRow | null
}): { client: SupabaseClient; insertCalls: () => number } {
  let dailySelectN = 0
  let insertCalls = 0

  const chain = () => {
    const api = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() => {
        dailySelectN += 1
        if (dailySelectN === 1) return Promise.resolve({ data: handlers.existing ?? null, error: null })
        if (dailySelectN === 2) return Promise.resolve({ data: handlers.last ?? null, error: null })
        if (handlers.racedRow) return Promise.resolve({ data: handlers.racedRow, error: null })
        return Promise.resolve({ data: null, error: null })
      }),
      single: vi.fn().mockResolvedValue(handlers.insertResult ?? { data: null, error: null }),
      insert: vi.fn(() => {
        insertCalls += 1
        return api
      }),
    }
    return api
  }

  const attemptChain = () => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { weak_topics: [] }, error: null }),
  })

  const notesChain = () => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({
      data: handlers.notes ?? [{ id: 'n1', slug: 'polity', section: 'polity', topic: 'Fundamental Rights' }],
      error: null,
    }),
  })

  return {
    client: {
      from: vi.fn((table: string) => {
        if (table === 'test_attempts') return attemptChain()
        if (table === 'smart_notes') return notesChain()
        return chain()
      }),
    } as unknown as SupabaseClient,
    insertCalls: () => insertCalls,
  }
}

describe('command generate', () => {
  describe('todayDateString', () => {
    it('uses IST calendar date', () => {
      const utcLate = new Date('2026-06-21T20:00:00.000Z')
      expect(todayDateString(utcLate)).toBe('2026-06-22')
    })
  })

  describe('getOrCreateTodayCommand idempotency', () => {
    it('returns existing row without inserting', async () => {
      const userId = 'user-a'
      const row = existingRow(userId)
      const { client: supabase, insertCalls } = mockSupabase({ existing: row })

      const result = await getOrCreateTodayCommand(supabase, userId)

      expect(result).toEqual(row)
      expect(insertCalls()).toBe(0)
    })

    it('creates a new row when none exists for today', async () => {
      const userId = 'user-b'
      const today = todayDateString()
      const created: DailyCommandRow = {
        id: 'cmd-new',
        user_id: userId,
        command_date: today,
        threads: [],
        completed: [],
        sealed: false,
        is_reentry: false,
        insight: null,
      }
      const { client: supabase, insertCalls } = mockSupabase({
        existing: null,
        last: null,
        insertResult: { data: created, error: null },
      })

      const result = await getOrCreateTodayCommand(supabase, userId)
      expect(result).toEqual(created)
      expect(insertCalls()).toBe(1)
    })

    it('reads back the row when insert races on UNIQUE(user_id, command_date)', async () => {
      const userId = 'user-c'
      const raced = existingRow(userId)
      const { client: supabase } = mockSupabase({
        existing: null,
        last: { command_date: '2026-01-01', sealed: true },
        insertResult: { data: null, error: { code: '23505' } },
        racedRow: raced,
      })

      const result = await getOrCreateTodayCommand(supabase, userId)
      expect(result).toEqual(raced)
    })
  })
})
