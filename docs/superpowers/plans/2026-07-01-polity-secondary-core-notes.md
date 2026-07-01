# Polity Secondary-Core Smart Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 32 source-grounded secondary-core Polity Smart Notes while preserving all 17 existing primary, uploaded, and legacy Polity records.

**Architecture:** Additive JSON files will use the existing `SmartNote` and `upsc12` contracts, with IDs `local-pol-113` through `local-pol-144`. A dedicated Vitest contract test will verify count, ID continuity, depth, legal-update markers, and preservation; four eight-note batches will keep generation and review bounded.

**Tech Stack:** JSON, TypeScript, Vitest, Next.js 16 Smart Notes loader

---

## File Structure

- Create: `__tests__/polity-secondary-notes.test.ts`
  - Validates total count, contiguous secondary IDs, uniqueness, depth, source metadata, and preservation of existing records.
- Create: `data/smart-notes/local-pol-113-*.json` through `local-pol-144-*.json`
  - One independently readable constitutional or governance module per file.
- Do not modify: any existing `data/smart-notes/*pol*.json` file.

### Task 1: Add the Secondary-Layer Contract Test

**Files:**
- Create: `__tests__/polity-secondary-notes.test.ts`
- Read: `lib/notes/local.ts`
- Read: `lib/notes/types.ts`

- [ ] **Step 1: Write the failing collection test**

```ts
import { describe, expect, it } from 'vitest'
import { getLocalPublishedSmartNotes } from '../lib/notes/local'

describe('Polity secondary-core smart notes', () => {
  const notes = getLocalPublishedSmartNotes('Polity')
  const secondary = notes.filter(note => {
    const number = Number(note.id.replace('local-pol-', ''))
    return number >= 113 && number <= 144
  })

  it('publishes the complete 49-note Polity library', () => {
    expect(notes).toHaveLength(49)
    expect(secondary.map(note => note.id).sort()).toEqual(
      Array.from({ length: 32 }, (_, index) =>
        `local-pol-${String(index + 113).padStart(3, '0')}`
      )
    )
  })

  it('keeps IDs and slugs unique', () => {
    expect(new Set(notes.map(note => note.id)).size).toBe(notes.length)
    expect(new Set(notes.map(note => note.slug)).size).toBe(notes.length)
  })

  it('gives every secondary note the full depth contract', () => {
    for (const note of secondary) {
      expect(note.source_type).toBe('uploaded-polity-static-pyq-secondary')
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
npx vitest run __tests__/polity-secondary-notes.test.ts
```

Expected: FAIL because the library contains 17 Polity notes and no IDs from
`local-pol-113` through `local-pol-144`.

- [ ] **Step 3: Commit the failing contract test**

```powershell
git add -- __tests__/polity-secondary-notes.test.ts
git commit -m "Test secondary Polity note coverage"
```

### Task 2: Generate Foundations and Core-Rights Batch

**Files:**
- Create: `data/smart-notes/local-pol-113-colonial-constitutional-evolution.json`
- Create: `data/smart-notes/local-pol-114-constituent-assembly-sources.json`
- Create: `data/smart-notes/local-pol-115-constitutionalism-government-separation-powers.json`
- Create: `data/smart-notes/local-pol-116-preamble-amendment-basic-structure.json`
- Create: `data/smart-notes/local-pol-117-union-territory-state-reorganisation.json`
- Create: `data/smart-notes/local-pol-118-citizenship-oci-framework.json`
- Create: `data/smart-notes/local-pol-119-equality-affirmative-action.json`
- Create: `data/smart-notes/local-pol-120-article-19-freedoms-restrictions.json`

- [ ] **Step 1: Extract topic evidence**

Search `tmp/pdfs/static_polity.txt` and
`tmp/pdfs/pyq_polity_governance.txt` for the exact topic vocabulary. Capture
Article numbers, amendment rules, institutional sequences, doctrines, verified
case-law patterns, and prelims comparisons. Treat OCR text as evidence, not
prose to copy.

- [ ] **Step 2: Create notes 113-120**

Use categories `Constitutional Framework` and `Fundamental Rights`, source type
`uploaded-polity-static-pyq-secondary`, and the full `SmartNote` contract.

Maintain these boundaries:

```text
113 colonial act -> institutional change -> constitutional legacy
114 Assembly composition and committees -> Objective Resolution -> borrowed adaptation
115 constitutional limits -> parliamentary responsibility -> checks and functional separation
116 Preamble principle -> Article 368 procedure -> basic-structure limitation
117 Articles 1-4 -> territory and boundary change -> State-UT distinction
118 constitutional citizenship baseline -> statutory acquisition/loss -> OCI distinction
119 equality code -> reasonable classification -> reservation and anti-discrimination
120 six freedoms -> citizen scope -> ground-specific reasonable restrictions
```

Every note must include at least six dimensions, four answer-body steps, three
mains examples, five prelims facts, four revision cards, three traps, and two
PYQ-pattern references. Each `dataReport` must name an official legal refresh
source.

- [ ] **Step 3: Parse and inspect the batch**

Run:

```powershell
$files = Get-ChildItem data/smart-notes/local-pol-*.json |
  Where-Object { $_.BaseName -match '^local-pol-1(1[3-9]|20)-' }
foreach ($file in $files) {
  Get-Content -Raw $file.FullName | ConvertFrom-Json | Out-Null
}
Write-Output "parsed=$($files.Count)"
npx vitest run __tests__/polity-secondary-notes.test.ts
```

Expected: `parsed=8`. The collection test remains red only because notes
`121-144` are absent.

- [ ] **Step 4: Commit the batch**

```powershell
git add -- data/smart-notes/local-pol-113-*.json data/smart-notes/local-pol-114-*.json data/smart-notes/local-pol-115-*.json data/smart-notes/local-pol-116-*.json data/smart-notes/local-pol-117-*.json data/smart-notes/local-pol-118-*.json data/smart-notes/local-pol-119-*.json data/smart-notes/local-pol-120-*.json
git commit -m "Add secondary constitutional foundation notes"
```

### Task 3: Generate Remaining Rights and Federalism Batch

**Files:**
- Create: `data/smart-notes/local-pol-121-criminal-safeguards-life-detention.json`
- Create: `data/smart-notes/local-pol-122-exploitation-religion-minority-rights.json`
- Create: `data/smart-notes/local-pol-123-constitutional-writs.json`
- Create: `data/smart-notes/local-pol-124-dpsp-duties-rights-balance.json`
- Create: `data/smart-notes/local-pol-125-centre-state-legislative-administrative-relations.json`
- Create: `data/smart-notes/local-pol-126-fiscal-federalism-finance-gst.json`
- Create: `data/smart-notes/local-pol-127-interstate-councils-water-disputes.json`
- Create: `data/smart-notes/local-pol-128-emergency-provisions.json`

- [ ] **Step 1: Extract topic evidence**

Search both Polity extracts for Articles 20-30, writs, DPSPs, duties,
legislative and administrative relations, Finance Commission, GST Council,
inter-State institutions, water disputes, and Articles 352, 356, and 360.

- [ ] **Step 2: Create notes 121-128**

Use categories `Fundamental Rights`, `DPSP`, and `Federalism`. Apply the full
depth contract and these boundaries:

```text
121 Articles 20-22 -> criminal and liberty safeguards -> preventive detention
122 Articles 23-30 -> exploitation, religion, culture and minority institutions
123 Article 32 versus 226 -> five writ purposes -> standing and respondent
124 DPSP classification -> duties -> harmony and constitutional morality
125 Seventh Schedule -> repugnancy and Union control -> administrative coordination
126 tax and grant architecture -> Finance Commission -> GST Council
127 Article 263 and councils -> zonal cooperation -> Article 262 water disputes
128 trigger -> approval -> duration -> effects -> revocation and safeguards
```

- [ ] **Step 3: Parse and inspect the batch**

Parse exactly notes `121-128` and rerun the dedicated Polity test.

Expected: eight JSON files parse. The collection test remains red only because
notes `129-144` are absent.

- [ ] **Step 4: Commit the batch**

```powershell
git add -- data/smart-notes/local-pol-121-*.json data/smart-notes/local-pol-122-*.json data/smart-notes/local-pol-123-*.json data/smart-notes/local-pol-124-*.json data/smart-notes/local-pol-125-*.json data/smart-notes/local-pol-126-*.json data/smart-notes/local-pol-127-*.json data/smart-notes/local-pol-128-*.json
git commit -m "Add secondary rights and federalism notes"
```

### Task 4: Generate Special Design, Executive, and Parliament Batch

**Files:**
- Create: `data/smart-notes/local-pol-129-fifth-sixth-schedules-article-371.json`
- Create: `data/smart-notes/local-pol-130-president-vice-president.json`
- Create: `data/smart-notes/local-pol-131-governor-discretion-federalism.json`
- Create: `data/smart-notes/local-pol-132-prime-chief-minister-councils.json`
- Create: `data/smart-notes/local-pol-133-parliament-composition-sessions-officers.json`
- Create: `data/smart-notes/local-pol-134-bill-types-legislative-procedure.json`
- Create: `data/smart-notes/local-pol-135-budget-grants-committees-control.json`
- Create: `data/smart-notes/local-pol-136-privileges-antidefection-accountability.json`

- [ ] **Step 1: Extract topic evidence**

Search both extracts for Fifth and Sixth Schedules, Article 371, President,
Vice-President, Governor, Prime Minister, Council of Ministers, Parliament,
bill classes, budget, grants, committees, privileges, and Tenth Schedule.

- [ ] **Step 2: Create notes 129-136**

Use categories `Federalism`, `Executive`, and `Parliament`. Apply the full depth
contract and boundaries:

```text
129 scheduled-area model -> autonomous-district model -> State-specific Article 371
130 election and qualifications -> aid and advice -> powers, veto and removal
131 appointment and tenure -> aid and advice -> discretion and constitutional limits
132 appointment and majority support -> collective responsibility -> cabinet coordination
133 House composition -> sessions and quorum -> presiding officers and parliamentary devices
134 ordinary, Money, Financial and amendment bills -> House powers -> assent and deadlock
135 Budget and Consolidated Fund -> grants and committees -> executive financial accountability
136 privilege source -> breach and discipline -> Tenth Schedule disqualification and review
```

- [ ] **Step 3: Parse and inspect the batch**

Parse exactly notes `129-136` and rerun the dedicated Polity test.

Expected: eight JSON files parse. The collection test remains red only because
notes `137-144` are absent.

- [ ] **Step 4: Commit the batch**

```powershell
git add -- data/smart-notes/local-pol-129-*.json data/smart-notes/local-pol-130-*.json data/smart-notes/local-pol-131-*.json data/smart-notes/local-pol-132-*.json data/smart-notes/local-pol-133-*.json data/smart-notes/local-pol-134-*.json data/smart-notes/local-pol-135-*.json data/smart-notes/local-pol-136-*.json
git commit -m "Add secondary executive and Parliament notes"
```

### Task 5: Generate State, Judiciary, and Governance Batch

**Files:**
- Create: `data/smart-notes/local-pol-137-state-legislatures-councils.json`
- Create: `data/smart-notes/local-pol-138-supreme-high-courts.json`
- Create: `data/smart-notes/local-pol-139-judicial-review-pil-doctrines.json`
- Create: `data/smart-notes/local-pol-140-subordinate-courts-tribunals-adr.json`
- Create: `data/smart-notes/local-pol-141-local-government-cooperatives.json`
- Create: `data/smart-notes/local-pol-142-eci-cag-upsc-finance-commission.json`
- Create: `data/smart-notes/local-pol-143-elections-rpa-delimitation-reform.json`
- Create: `data/smart-notes/local-pol-144-accountability-bodies.json`

- [ ] **Step 1: Extract topic evidence**

Search both extracts for State legislatures, Supreme and High Courts,
collegium, jurisdiction, judicial review, PIL, tribunals, ADR, Panchayats,
Municipalities, cooperatives, constitutional bodies, RPA, delimitation, CIC,
CVC, Lokpal, CBI, NIA, and NITI Aayog.

- [ ] **Step 2: Create notes 137-144**

Use categories `Parliament`, `Judiciary`, `Local Governance`,
`Constitutional Bodies`, and `Governance`. Apply the full depth contract:

```text
137 Assembly-Council structure -> creation and abolition -> bill and executive control
138 appointment and independence -> original, appellate, writ and supervisory jurisdiction
139 review source -> PIL and standing -> activism, restraint and major doctrines
140 subordinate hierarchy -> tribunal specialisation -> ADR, Lok Adalat and legal aid
141 73rd, 74th and cooperative design -> devolution -> finance and accountability
142 constitutional source -> composition and removal -> audit, election, service and devolution roles
143 electoral system -> RPA rules -> delimitation, parties, finance and reform
144 statutory or executive source -> investigation, vigilance, information and policy coordination
```

- [ ] **Step 3: Run the dedicated test**

Run:

```powershell
npx vitest run __tests__/polity-secondary-notes.test.ts
```

Expected: PASS with 49 Polity notes and 32 complete secondary notes.

- [ ] **Step 4: Commit the batch**

```powershell
git add -- data/smart-notes/local-pol-137-*.json data/smart-notes/local-pol-138-*.json data/smart-notes/local-pol-139-*.json data/smart-notes/local-pol-140-*.json data/smart-notes/local-pol-141-*.json data/smart-notes/local-pol-142-*.json data/smart-notes/local-pol-143-*.json data/smart-notes/local-pol-144-*.json
git commit -m "Complete secondary Polity note library"
```

### Task 6: Verify Legal Integrity and the Application

**Files:**
- Verify: `data/smart-notes/*.json`
- Verify: `__tests__/polity-secondary-notes.test.ts`

- [ ] **Step 1: Validate all JSON and global uniqueness**

Parse every Smart Note and fail on duplicate IDs or slugs.

Expected: zero parse errors, zero duplicate IDs, zero duplicate slugs, 49
Polity records, and 32 records with the secondary source type.

- [ ] **Step 2: Verify pre-existing Polity files are untouched**

Run:

```powershell
git diff --name-only codex/kautilya-product-shell..HEAD -- data/smart-notes |
  Where-Object { $_ -match 'pol' -and $_ -notmatch 'local-pol-1(1[3-9]|[2-3][0-9]|4[0-4])-' }
```

Expected: no output.

- [ ] **Step 3: Audit legal references and unstable claims**

Search notes `113-144` for Article, Schedule, amendment, majority, tenure,
removal, current officeholder, pending bill, and recent judgment claims.
Confirm internal consistency and ensure every changeable claim is dated and
directed to an official source.

Expected: no unsupported current officeholder, pending-as-enacted law,
undated recent judgment status, or contradictory majority and removal rule.

- [ ] **Step 4: Verify Polity loader output**

Run a `tsx` expression importing `getLocalPublishedSmartNotes`.

Expected:

```text
count=49
secondary=32
firstSecondary=local-pol-113
lastSecondary=local-pol-144
```

- [ ] **Step 5: Run project checks**

Run:

```powershell
npm run typecheck
npm test
npm run build
```

Expected: all commands exit successfully. Existing framework warnings may be
reported separately but cannot be introduced by the JSON note batch.

- [ ] **Step 6: Inspect branch scope**

Run:

```powershell
git status --short
git diff --stat codex/kautilya-product-shell..HEAD
git diff --check codex/kautilya-product-shell..HEAD
```

Expected: 32 Polity note files and one dedicated contract test on the feature
branch; approved design and plan documents remain on the base branch.
