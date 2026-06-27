import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = resolve('supabase/migrations/kautilya_007_diagnosis_60_depths.sql')
const schemaPath = resolve('supabase/schema.sql')

describe('diagnosis depth migration', () => {
  it('accepts historical and current diagnosis depths without rewriting history', () => {
    expect(existsSync(migrationPath)).toBe(true)
    if (!existsSync(migrationPath)) return

    const migration = readFileSync(migrationPath, 'utf8')
    expect(migration).toContain("'none', 'free30', 'paid50', 'free40', 'paid60'")
    expect(migration).toContain("'free30', 'paid50', 'free40', 'paid60', 'mock_result'")
    expect(migration).not.toMatch(/update\s+public\.(aspirant_profiles|diagnosis_reports)/i)
  })

  it('keeps the canonical schema aligned', () => {
    const schema = readFileSync(schemaPath, 'utf8')
    expect(schema).toContain("'none', 'free30', 'paid50', 'free40', 'paid60'")
    expect(schema).toContain("'free30', 'paid50', 'free40', 'paid60', 'mock_result'")
  })
})
