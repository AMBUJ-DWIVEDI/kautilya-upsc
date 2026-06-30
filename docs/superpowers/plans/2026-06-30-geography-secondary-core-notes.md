# Geography Secondary-Core Smart Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 24 source-grounded secondary-core Geography Smart Notes while preserving the existing 12-note primary layer.

**Architecture:** Additive JSON files will use the existing `SmartNote` and `upsc12` contracts, with IDs `local-geo-013` through `local-geo-036`. A dedicated Vitest contract test will verify the complete Geography collection, while three eight-note batches keep content generation and review bounded.

**Tech Stack:** JSON, TypeScript, Vitest, Next.js 16 Smart Notes loader

---

## File Structure

- Create: `__tests__/geography-secondary-notes.test.ts`
  - Validates total count, contiguous IDs, unique slugs, source metadata, and minimum depth.
- Create: `data/smart-notes/local-geo-013-*.json` through `local-geo-036-*.json`
  - One independently readable secondary-core module per file.
- Do not modify: `data/smart-notes/local-geo-001-*.json` through `local-geo-012-*.json`
  - These remain the primary command-map layer.

### Task 1: Add the Secondary-Layer Contract Test

**Files:**
- Create: `__tests__/geography-secondary-notes.test.ts`
- Read: `lib/notes/local.ts`
- Read: `lib/notes/types.ts`

- [ ] **Step 1: Write the failing collection test**

```ts
import { describe, expect, it } from 'vitest'
import { getLocalPublishedSmartNotes } from '../lib/notes/local'

describe('Geography secondary-core smart notes', () => {
  const notes = getLocalPublishedSmartNotes('Geography')
  const secondary = notes.filter(note => {
    const number = Number(note.id.replace('local-geo-', ''))
    return number >= 13 && number <= 36
  })

  it('publishes the complete 36-note Geography library', () => {
    expect(notes).toHaveLength(36)
    expect(secondary.map(note => note.id).sort()).toEqual(
      Array.from({ length: 24 }, (_, index) =>
        `local-geo-${String(index + 13).padStart(3, '0')}`
      )
    )
  })

  it('keeps IDs and slugs unique', () => {
    expect(new Set(notes.map(note => note.id)).size).toBe(notes.length)
    expect(new Set(notes.map(note => note.slug)).size).toBe(notes.length)
  })

  it('gives every secondary note the full depth contract', () => {
    for (const note of secondary) {
      expect(note.source_type).toBe('uploaded-geography-static-pyq-secondary')
      expect(note.status).toBe('published')
      expect(note.anatomy).toBe('upsc12')
      expect(note.content.dimensions.length).toBeGreaterThanOrEqual(6)
      expect(note.content.answerFramework.body.length).toBeGreaterThanOrEqual(4)
      expect(note.content.mainsExamples.length).toBeGreaterThanOrEqual(3)
      expect(note.content.prelimsFacts.length).toBeGreaterThanOrEqual(5)
      expect(note.content.revisionBox.length).toBeGreaterThanOrEqual(4)
      expect(note.common_traps?.length).toBeGreaterThanOrEqual(3)
      expect(note.pyq_refs.length).toBeGreaterThanOrEqual(2)
    }
  })
})
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```powershell
npx vitest run __tests__/geography-secondary-notes.test.ts
```

Expected: FAIL because the library contains 12 Geography notes and no IDs from
`local-geo-013` through `local-geo-036`.

- [ ] **Step 3: Commit the failing contract test**

```powershell
git add -- __tests__/geography-secondary-notes.test.ts
git commit -m "Test secondary Geography note coverage"
```

### Task 2: Generate Physical Geography Batch

**Files:**
- Create: `data/smart-notes/local-geo-013-geological-time-rocks-minerals.json`
- Create: `data/smart-notes/local-geo-014-plate-boundaries-hotspots-landscapes.json`
- Create: `data/smart-notes/local-geo-015-earthquakes-volcanoes-tsunamis.json`
- Create: `data/smart-notes/local-geo-016-weathering-mass-wasting-slopes.json`
- Create: `data/smart-notes/local-geo-017-river-processes-drainage-evolution.json`
- Create: `data/smart-notes/local-geo-018-karst-glacial-aeolian-coastal-landforms.json`
- Create: `data/smart-notes/local-geo-019-air-masses-fronts-temperate-weather.json`
- Create: `data/smart-notes/local-geo-020-cyclones-jet-streams-extreme-weather.json`

- [ ] **Step 1: Extract topic evidence**

Use `rg` with the exact topic vocabulary against:

```text
tmp/pdfs/static_physical_geography.txt
tmp/pdfs/pyq_geography.txt
```

Capture concepts, processes, named regions, map cues, and PYQ patterns. Treat
OCR text as evidence to interpret, not prose to copy.

- [ ] **Step 2: Create notes 013-020**

For every file, populate the complete `SmartNote` contract. Use category
`Physical Geography`, source type
`uploaded-geography-static-pyq-secondary`, at least six dimensions, four answer
body steps, three mains examples, five prelims facts, four revision cards,
three traps, and two PYQ pattern references.

The eight distinct mechanism boundaries are:

```text
013 geological sequence -> rock cycle -> mineral occurrence
014 plate motion -> boundary type -> tectonic landscape
015 hazard origin -> wave/eruption behaviour -> spatial risk
016 weathering and gravity -> slope process -> terrain outcome
017 river energy and load -> channel process -> drainage evolution
018 dominant agent -> erosional/depositional process -> diagnostic landform
019 source-region properties -> front formation -> temperate weather
020 heat and circulation -> cyclone/jet behaviour -> extreme-weather outcome
```

- [ ] **Step 3: Parse and inspect the batch**

Run:

```powershell
Get-ChildItem data/smart-notes/local-geo-*.json |
  Where-Object { $_.BaseName -match '^local-geo-0(1[3-9]|20)-' } |
  ForEach-Object { Get-Content -Raw $_ | ConvertFrom-Json | Out-Null }
npx vitest run __tests__/geography-secondary-notes.test.ts
```

Expected: JSON parsing passes. The collection test still fails only because
notes 021-036 are absent.

- [ ] **Step 4: Commit the physical batch**

```powershell
git add -- data/smart-notes/local-geo-01*.json data/smart-notes/local-geo-020-*.json
git commit -m "Add secondary physical Geography notes"
```

### Task 3: Generate Applied and Indian Geography Batch

**Files:**
- Create: `data/smart-notes/local-geo-021-enso-iod-mjo-teleconnections.json`
- Create: `data/smart-notes/local-geo-022-ocean-relief-resources-coasts.json`
- Create: `data/smart-notes/local-geo-023-himalayan-regional-geography-fragility.json`
- Create: `data/smart-notes/local-geo-024-peninsular-plateau-ghats-deccan.json`
- Create: `data/smart-notes/local-geo-025-indian-coasts-islands-maritime-geography.json`
- Create: `data/smart-notes/local-geo-026-river-basins-interlinking-water-conflicts.json`
- Create: `data/smart-notes/local-geo-027-indian-monsoon-variability-rainfall.json`
- Create: `data/smart-notes/local-geo-028-hazards-vulnerability-mapping.json`

- [ ] **Step 1: Extract topic evidence**

Search all three Geography extracts for teleconnections, ocean relief, regional
physiography, monsoon mechanisms, river management, and hazard distributions.
Connect static process explanations to recurring PYQ demand.

- [ ] **Step 2: Create notes 021-028**

Use the same depth contract as Task 2. Assign categories by topic:
`Climatology`, `Oceanography`, or `Indian Geography`.

Keep these boundaries explicit:

```text
021 teleconnection phase -> Indian monsoon modulation -> forecast limitation
022 seabed/coastal form -> resource potential -> jurisdiction and risk
023 Himalayan origin -> regional divisions -> ecology and fragility
024 plateau structure -> relief and drainage -> resources and settlement
025 coastal/island morphology -> strategic position -> hazard and economy
026 basin geography -> interlinking rationale -> federal/ecological trade-off
027 monsoon controls -> regional rainfall pattern -> variability and adaptation
028 hazard -> exposure -> vulnerability -> zonation -> resilience
```

- [ ] **Step 3: Parse and inspect the batch**

Run the JSON parser across notes 021-028 and rerun the dedicated Vitest file.

Expected: JSON parsing passes. The collection test still fails only because
notes 029-036 are absent.

- [ ] **Step 4: Commit the applied and Indian batch**

```powershell
git add -- data/smart-notes/local-geo-02*.json
git commit -m "Add applied and Indian Geography notes"
```

### Task 4: Generate Economic, Human, and Mapping Batch

**Files:**
- Create: `data/smart-notes/local-geo-029-soil-degradation-watersheds-drylands.json`
- Create: `data/smart-notes/local-geo-030-crops-agro-climatic-regions-irrigation.json`
- Create: `data/smart-notes/local-geo-031-minerals-industrial-location-belts.json`
- Create: `data/smart-notes/local-geo-032-energy-geography-transition.json`
- Create: `data/smart-notes/local-geo-033-transport-ports-waterways-logistics.json`
- Create: `data/smart-notes/local-geo-034-population-transition-migration.json`
- Create: `data/smart-notes/local-geo-035-urbanisation-settlements-regional-planning.json`
- Create: `data/smart-notes/local-geo-036-world-strategic-mapping.json`

- [ ] **Step 1: Extract topic evidence**

Search the Indian human/economic and PYQ extracts for land degradation,
agro-climatic patterns, location factors, energy regions, corridors,
demographic transition, urban systems, and world map associations.

- [ ] **Step 2: Create notes 029-036**

Use categories `Indian Geography`, `Economic Geography`, `Human Geography`,
and `World Geography` as appropriate. Apply the same minimum-depth contract.

Keep these boundaries explicit:

```text
029 degradation process -> dryland risk -> watershed response
030 crop requirement -> agro-climatic region -> irrigation choice
031 resource distribution -> location factor -> industrial belt
032 source geography -> grid/transition constraint -> regional opportunity
033 mode and corridor -> nodal location -> logistics and regional development
034 transition stage -> migration stream -> demographic and spatial outcome
035 settlement hierarchy -> urban process -> planning response
036 feature location -> adjoining regions -> strategic/resource significance
```

- [ ] **Step 3: Run the dedicated test**

Run:

```powershell
npx vitest run __tests__/geography-secondary-notes.test.ts
```

Expected: PASS with 36 Geography notes and 24 complete secondary notes.

- [ ] **Step 4: Commit the final content batch**

```powershell
git add -- data/smart-notes/local-geo-03*.json
git commit -m "Complete secondary Geography note library"
```

### Task 5: Verify the Complete Library and Application

**Files:**
- Verify: `data/smart-notes/*.json`
- Verify: `__tests__/geography-secondary-notes.test.ts`

- [ ] **Step 1: Validate all JSON and global uniqueness**

Run a PowerShell validation that parses every Smart Note and fails on duplicate
IDs or slugs.

Expected: zero parse errors, zero duplicate IDs, and zero duplicate slugs.

- [ ] **Step 2: Verify Geography loader output**

Run a `tsx` expression importing `getLocalPublishedSmartNotes` and print the
Geography count and ID range.

Expected:

```text
count=36
secondary=24
first=local-geo-001
last=local-geo-036
```

- [ ] **Step 3: Run project checks**

Run:

```powershell
npm run typecheck
npm test
npm run build
```

Expected: all commands exit successfully. Existing framework warnings may be
reported separately but cannot be introduced by the JSON note batch.

- [ ] **Step 4: Inspect the staged scope**

Run:

```powershell
git status --short
git diff --stat HEAD~4..HEAD
```

Expected: Geography note files, the dedicated test, design spec, and plan only;
unrelated pre-existing dirty product-shell files remain uncommitted.
