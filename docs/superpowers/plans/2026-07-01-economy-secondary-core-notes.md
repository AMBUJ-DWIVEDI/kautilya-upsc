# Economy Secondary-Core Smart Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 28 source-grounded secondary-core Economy Smart Notes while preserving the existing 11-note primary layer.

**Architecture:** Additive JSON files will use the existing `SmartNote` and `upsc12` contracts, with IDs `local-eco-012` through `local-eco-039`. A dedicated Vitest contract test will verify the complete Economy collection; four seven-note batches will keep research, generation, review, and commits bounded.

**Tech Stack:** JSON, TypeScript, Vitest, Next.js 16 Smart Notes loader

---

## File Structure

- Create: `__tests__/economy-secondary-notes.test.ts`
  - Validates count, contiguous IDs, uniqueness, publication metadata, and minimum depth.
- Create: `data/smart-notes/local-eco-012-*.json` through `local-eco-039-*.json`
  - One independently readable secondary-core module per file.
- Do not modify: `data/smart-notes/local-eco-001-*.json` through `local-eco-011-*.json`
  - These remain the primary Economy command-map layer.

### Task 1: Add the Secondary-Layer Contract Test

**Files:**
- Create: `__tests__/economy-secondary-notes.test.ts`
- Read: `lib/notes/local.ts`
- Read: `lib/notes/types.ts`

- [ ] **Step 1: Write the failing collection test**

```ts
import { describe, expect, it } from 'vitest'
import { getLocalPublishedSmartNotes } from '../lib/notes/local'

describe('Economy secondary-core smart notes', () => {
  const notes = getLocalPublishedSmartNotes('Economy')
  const secondary = notes.filter(note => {
    const number = Number(note.id.replace('local-eco-', ''))
    return number >= 12 && number <= 39
  })

  it('publishes the complete 39-note Economy library', () => {
    expect(notes).toHaveLength(39)
    expect(secondary.map(note => note.id).sort()).toEqual(
      Array.from({ length: 28 }, (_, index) =>
        `local-eco-${String(index + 12).padStart(3, '0')}`
      )
    )
  })

  it('keeps IDs and slugs unique', () => {
    expect(new Set(notes.map(note => note.id)).size).toBe(notes.length)
    expect(new Set(notes.map(note => note.slug)).size).toBe(notes.length)
  })

  it('gives every secondary note the full depth contract', () => {
    for (const note of secondary) {
      expect(note.source_type).toBe('uploaded-economy-static-pyq-secondary')
      expect(note.status).toBe('published')
      expect(note.anatomy).toBe('upsc12')
      expect(note.content.dimensions.length).toBeGreaterThanOrEqual(6)
      expect(note.content.answerFramework.body.length).toBeGreaterThanOrEqual(4)
      expect(note.content.mainsExamples.length).toBeGreaterThanOrEqual(3)
      expect(note.content.prelimsFacts.length).toBeGreaterThanOrEqual(5)
      expect(note.content.revisionBox.length).toBeGreaterThanOrEqual(4)
      expect(note.common_traps?.length).toBeGreaterThanOrEqual(3)
      expect(note.pyq_refs.length).toBeGreaterThanOrEqual(2)
      expect(note.content.dataReport).toContain('official')
    }
  })
})
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```powershell
npx vitest run __tests__/economy-secondary-notes.test.ts
```

Expected: FAIL because the library contains 11 Economy notes and no IDs from
`local-eco-012` through `local-eco-039`.

- [ ] **Step 3: Commit the failing contract test**

```powershell
git add -- __tests__/economy-secondary-notes.test.ts
git commit -m "Test secondary Economy note coverage"
```

### Task 2: Generate Macro and Public-Finance Batch

**Files:**
- Create: `data/smart-notes/local-eco-012-demand-supply-elasticity-market-failure.json`
- Create: `data/smart-notes/local-eco-013-growth-savings-investment-business-cycles.json`
- Create: `data/smart-notes/local-eco-014-gdp-gva-deflators-welfare-accounting.json`
- Create: `data/smart-notes/local-eco-015-inflation-measurement-causes-indexation.json`
- Create: `data/smart-notes/local-eco-016-budget-deficits-debt-frbm.json`
- Create: `data/smart-notes/local-eco-017-taxation-gst-fiscal-federalism.json`
- Create: `data/smart-notes/local-eco-018-money-supply-liquidity-credit-creation.json`

- [ ] **Step 1: Extract topic evidence**

Search `tmp/pdfs/static_economy.txt` and
`tmp/pdfs/pyq_economic_agriculture.txt` for the exact topic vocabulary. Capture
identities, formulas, mechanism chains, Indian institutions, policy trade-offs,
and PYQ traps. Treat OCR text as evidence to interpret, not prose to copy.

- [ ] **Step 2: Create notes 012-018**

Populate the complete `SmartNote` contract for each file. Use the categories
`Microeconomics`, `Macroeconomics`, `Public Finance`, and `Money and Banking`.
Use source type `uploaded-economy-static-pyq-secondary`.

Maintain these distinct mechanism boundaries:

```text
012 price and non-price determinants -> elasticity -> welfare and market failure
013 savings and investment -> capital efficiency -> growth and cycle phases
014 production-income-expenditure identity -> nominal/real conversion -> welfare limits
015 index construction -> demand/supply/expectations -> distribution and indexation
016 receipts and expenditure -> deficit identities -> debt dynamics and fiscal rules
017 tax incidence and design -> GST chain -> vertical and horizontal federal balance
018 monetary aggregates -> reserves and deposits -> credit and liquidity creation
```

Every note must have at least six dimensions, four answer-body steps, three
mains examples, five prelims facts, four revision cards, three traps, and two
PYQ-pattern references. Its `dataReport` must identify the uploaded source and
name the current official source used to refresh unstable figures.

- [ ] **Step 3: Parse and inspect the batch**

Run:

```powershell
$files = Get-ChildItem data/smart-notes/local-eco-*.json |
  Where-Object { $_.BaseName -match '^local-eco-0(1[2-8])-' }
foreach ($file in $files) {
  Get-Content -Raw $file.FullName | ConvertFrom-Json | Out-Null
}
Write-Output "parsed=$($files.Count)"
npx vitest run __tests__/economy-secondary-notes.test.ts
```

Expected: `parsed=7`. The collection test remains red only because notes
`019-039` are absent.

- [ ] **Step 4: Commit the batch**

```powershell
git add -- data/smart-notes/local-eco-012-*.json data/smart-notes/local-eco-013-*.json data/smart-notes/local-eco-014-*.json data/smart-notes/local-eco-015-*.json data/smart-notes/local-eco-016-*.json data/smart-notes/local-eco-017-*.json data/smart-notes/local-eco-018-*.json
git commit -m "Add secondary macroeconomics notes"
```

### Task 3: Generate Banking and Financial-Markets Batch

**Files:**
- Create: `data/smart-notes/local-eco-019-rbi-banking-architecture-regulation.json`
- Create: `data/smart-notes/local-eco-020-monetary-policy-instruments-transmission.json`
- Create: `data/smart-notes/local-eco-021-npas-insolvency-banking-reform.json`
- Create: `data/smart-notes/local-eco-022-money-market-short-term-instruments.json`
- Create: `data/smart-notes/local-eco-023-bonds-government-securities-yields.json`
- Create: `data/smart-notes/local-eco-024-equity-derivatives-funds-regulation.json`
- Create: `data/smart-notes/local-eco-025-financial-inclusion-digital-payments-fintech.json`

- [ ] **Step 1: Extract topic evidence**

Search both Economy extracts for RBI functions, bank types, policy instruments,
transmission, NPA recognition and resolution, money-market instruments, bond
pricing, market products, regulators, inclusion, and payment systems.

- [ ] **Step 2: Create notes 019-025**

Use categories `Money and Banking`, `Monetary Policy`, and `Financial Sector`.
Apply the full minimum-depth contract and these boundaries:

```text
019 central bank functions -> bank architecture -> differentiated regulation
020 policy stance and instruments -> operating target -> transmission channels
021 asset stress -> recognition/provisioning -> resolution and recapitalisation
022 overnight-to-one-year funding -> instrument features -> liquidity management
023 bond cash flows -> price-yield inverse relation -> duration and sovereign curve
024 ownership and risk-transfer instruments -> market infrastructure -> investor protection
025 access-usage-quality -> digital rails and fintech -> exclusion and consumer risk
```

- [ ] **Step 3: Parse and inspect the batch**

Parse exactly notes `019-025` and rerun the dedicated Economy test.

Expected: seven JSON files parse. The collection test remains red only because
notes `026-039` are absent.

- [ ] **Step 4: Commit the batch**

```powershell
git add -- data/smart-notes/local-eco-019-*.json data/smart-notes/local-eco-020-*.json data/smart-notes/local-eco-021-*.json data/smart-notes/local-eco-022-*.json data/smart-notes/local-eco-023-*.json data/smart-notes/local-eco-024-*.json data/smart-notes/local-eco-025-*.json
git commit -m "Add secondary banking and market notes"
```

### Task 4: Generate External-Sector and Agriculture Batch

**Files:**
- Create: `data/smart-notes/local-eco-026-bop-current-account-external-debt.json`
- Create: `data/smart-notes/local-eco-027-exchange-rates-neer-reer-forex.json`
- Create: `data/smart-notes/local-eco-028-fdi-fpi-ecb-capital-flows.json`
- Create: `data/smart-notes/local-eco-029-trade-policy-wto-ftas-ipr.json`
- Create: `data/smart-notes/local-eco-030-global-financial-development-institutions.json`
- Create: `data/smart-notes/local-eco-031-agricultural-productivity-irrigation-cropping.json`
- Create: `data/smart-notes/local-eco-032-msp-procurement-buffers-food-security.json`

- [ ] **Step 1: Extract topic evidence**

Search both extracts for BoP accounting, current and capital flows, external
debt, exchange-rate indices, forex tools, investment flows, WTO agreements,
multilateral institutions, agricultural inputs, irrigation, MSP, procurement,
buffer stocks, and food distribution.

- [ ] **Step 2: Create notes 026-032**

Use categories `External Sector`, `Global Economy`, and `Agriculture`. Apply the
full minimum-depth contract and these boundaries:

```text
026 current-account transactions -> financing flows -> external vulnerability
027 nominal rate -> effective and real indices -> intervention and reserve use
028 control and horizon of capital -> risk-return -> flow-management trade-offs
029 tariff and non-tariff policy -> WTO/FTA disciplines -> IPR-development balance
030 mandate, finance and voting -> crisis/development tools -> reform questions
031 land-water-input-technology -> productivity -> sustainability and resilience
032 price support -> procurement and storage -> distribution and nutrition security
```

- [ ] **Step 3: Parse and inspect the batch**

Parse exactly notes `026-032` and rerun the dedicated Economy test.

Expected: seven JSON files parse. The collection test remains red only because
notes `033-039` are absent.

- [ ] **Step 4: Commit the batch**

```powershell
git add -- data/smart-notes/local-eco-026-*.json data/smart-notes/local-eco-027-*.json data/smart-notes/local-eco-028-*.json data/smart-notes/local-eco-029-*.json data/smart-notes/local-eco-030-*.json data/smart-notes/local-eco-031-*.json data/smart-notes/local-eco-032-*.json
git commit -m "Add external sector and food economy notes"
```

### Task 5: Generate Agriculture, Industry, and Development Batch

**Files:**
- Create: `data/smart-notes/local-eco-033-agricultural-markets-fpos-warehousing.json`
- Create: `data/smart-notes/local-eco-034-farm-credit-insurance-input-subsidies.json`
- Create: `data/smart-notes/local-eco-035-allied-sectors-food-processing-value-chains.json`
- Create: `data/smart-notes/local-eco-036-industrial-policy-msmes-pli-manufacturing.json`
- Create: `data/smart-notes/local-eco-037-infrastructure-finance-ppp-monetisation-logistics.json`
- Create: `data/smart-notes/local-eco-038-lpg-privatisation-disinvestment-services.json`
- Create: `data/smart-notes/local-eco-039-employment-poverty-inequality-human-capital.json`

- [ ] **Step 1: Extract topic evidence**

Search both extracts for APMC, e-NAM, FPOs, negotiable receipts, credit,
insurance, fertiliser, livestock, fisheries, processing, MSMEs, PLI,
infrastructure finance, PPPs, monetisation, LPG reforms, services, employment,
poverty, inequality, skilling, and demographic dividend.

- [ ] **Step 2: Create notes 033-039**

Use categories `Agriculture`, `Sectors of Economy`, `Indian Economy`, and
`Development Economics`. Apply the full minimum-depth contract and boundaries:

```text
033 price discovery -> aggregation -> storage, logistics and market access
034 formal credit and risk pooling -> subsidy incentives -> fiscal and ecological effects
035 allied income -> processing and cold chain -> value capture and loss reduction
036 firm capability and scale -> industrial incentives -> jobs, exports and competition
037 project risk allocation -> financing and PPP -> monetisation and logistics outcomes
038 1991 reform channels -> ownership and competition -> services-led structural change
039 labour measurement -> poverty and inequality -> capability and demographic opportunity
```

- [ ] **Step 3: Run the dedicated test**

Run:

```powershell
npx vitest run __tests__/economy-secondary-notes.test.ts
```

Expected: PASS with 39 Economy notes and 28 complete secondary notes.

- [ ] **Step 4: Commit the batch**

```powershell
git add -- data/smart-notes/local-eco-033-*.json data/smart-notes/local-eco-034-*.json data/smart-notes/local-eco-035-*.json data/smart-notes/local-eco-036-*.json data/smart-notes/local-eco-037-*.json data/smart-notes/local-eco-038-*.json data/smart-notes/local-eco-039-*.json
git commit -m "Complete secondary Economy note library"
```

### Task 6: Verify Content Integrity and the Application

**Files:**
- Verify: `data/smart-notes/*.json`
- Verify: `__tests__/economy-secondary-notes.test.ts`

- [ ] **Step 1: Validate all JSON and global uniqueness**

Parse every Smart Note and fail on duplicate IDs or slugs.

Expected: zero parse errors, zero duplicate IDs, zero duplicate slugs, and 39
Economy records.

- [ ] **Step 2: Scan for stale or unsupported current claims**

Search notes `012-039` for rate, percentage, target, rank, and year expressions.
For every changing figure, confirm that it is dated and attributed or remove
it. Confirm each `dataReport` names an official refresh source.

Expected: no undated claim that a repo rate, tax rate, deficit target, poverty
estimate, trade share, or institutional membership is currently valid.

- [ ] **Step 3: Verify Economy loader output**

Run a `tsx` expression importing `getLocalPublishedSmartNotes`.

Expected:

```text
count=39
secondary=28
first=local-eco-001
last=local-eco-039
```

- [ ] **Step 4: Run project checks**

Run:

```powershell
npm run typecheck
npm test
npm run build
```

Expected: all commands exit successfully. Existing framework warnings may be
reported separately but cannot be introduced by the JSON note batch.

- [ ] **Step 5: Inspect branch scope**

Run:

```powershell
git status --short
git diff --stat codex/kautilya-product-shell..HEAD
git diff --check codex/kautilya-product-shell..HEAD
```

Expected: 28 Economy note files and one dedicated contract test on the feature
branch; approved design and plan documents remain on the base branch. Unrelated
product-shell changes remain outside the isolated worktree.
