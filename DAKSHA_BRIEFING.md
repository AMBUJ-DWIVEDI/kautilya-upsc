# CHANAKYA SSC — Daksha Content Briefing
> Hand this document to Daksha along with the relevant template file.  
> One briefing = one generation task (one gate OR one batch of smart notes).

---

## Product Context (Read First)

CHANAKYA SSC is an SSC CGL preparation platform built on the thesis:
> *"Aspirants fail not from lack of content but lack of direction, anchoring, and personalized execution."*

Every question, note, and explanation must feel like it was written by a **mentor who has cracked CGL** — not a textbook author.

**Tone:** Direct. Confident. Slightly fierce. No padding.  
**Audience:** SSC CGL Tier 1 aspirants, 22-28 years old, Hindi-medium background mostly, preparing for 1-2 years.

---

## PART A — Smart Notes

### What a Smart Note Is
A Smart Note is a 5-layer memory system for one SSC topic:
1. **Story** — makes you remember it emotionally
2. **Core Concept** — makes you remember it correctly
3. **Mnemonic** — makes you remember it instantly
4. **Mind Map** — shows you the connected structure
5. **Key Facts + Common Traps** — prepares you for the actual exam

### Schema Reference
See: `data/smart-notes/TEMPLATE-note.json`

---

### Batch 1 — 25 GK Smart Notes (Priority Polity Topics)

Give Daksha this prompt for each topic:

```
You are Daksha, the CHANAKYA SSC content engine.

Generate a Smart Note for:
TOPIC: [TOPIC NAME]
SECTION: gk
CATEGORY: [CATEGORY]

Follow this schema EXACTLY:
[paste _blank_template from TEMPLATE-note.json]

Rules:
- Story: 150-200 words. Real historical context. Not a textbook. Creates emotion.
- Core concept: 80-120 words. Every sentence is exam-relevant.
- Mnemonic: ONE memory trick. Survives 6 months without revision.
- Mind Map: 3-5 branches, 2-4 children each. Labels max 4 words.
- Key facts: Exactly 5. Each directly askable in SSC CGL Tier 1.
- Common traps: Exactly 3. Be specific about WHICH wrong option aspirants pick.
- high_yield: true if asked 3+ times in last 10 years.
- source_type: "daksha-v1"

Return ONLY the JSON object, no markdown wrapper.
```

### Priority Topic List (Phase 1 — 25 topics)

**Polity (16 topics)**
1. Preamble
2. Article 14 — Right to Equality
3. Article 19 — Freedom of Speech
4. Article 21 — Right to Life *(example note in template)*
5. Article 21A — Right to Education
6. Article 32 — Right to Constitutional Remedies
7. Directive Principles of State Policy (DPSP)
8. Fundamental Duties (Article 51A)
9. Money Bill vs Finance Bill
10. President — Powers & Functions
11. Parliament — Structure & Powers (Lok Sabha vs Rajya Sabha)
12. Supreme Court — Composition & Jurisdiction
13. CAG (Comptroller & Auditor General)
14. Election Commission of India
15. Article 312 — All India Services
16. 42nd Amendment — "Mini Constitution"

**Miscellaneous GK (6 topics)**
17. Sattriya Dance (Assam classical dance)
18. Bharatanatyam (Tamil Nadu, most asked classical dance)
19. Kathakali (Kerala — ask about costume/themes)
20. Jnanpith Award (India's highest literary award)
21. National Emblem (Lion Capital of Ashoka)
22. Thomas Cup (Badminton, men's team)

**Science (5 topics)**
23. Mitochondria — Powerhouse of the Cell
24. pH Scale — Acids, Bases, Neutral
25. Ohm's Law — V=IR, resistance
26. Ozone Layer — depletion, Montreal Protocol
27. Red Data Book — IUCN, endangered species

---

## PART B — Mock Tests (Gates 2–6)

### Structure (Same for All Gates)
- **100 questions, 60 minutes, max 200 marks**
- **Marking:** +2 correct, −0.5 wrong, 0 skipped
- **Sections:** 25 Reasoning | 25 GK | 25 Quant | 25 English

### Schema Reference
See: `data/question-bank/TEMPLATE-question.json`

### Difficulty Mix
| Level | Target | Where |
|-------|--------|-------|
| Easy | ~40% (40Q) | Spread across sections — build confidence |
| Medium | ~40% (40Q) | Core section — most aspirants should attempt |
| Hard | ~20% (20Q) | Differentiator — separates 80-100 scorers |

---

### Gate-by-Gate Prompt Template

```
You are Daksha, the CHANAKYA SSC content engine.

Generate 100 SSC CGL Tier 1 mock questions for GATE [N].

Gate Title: [TITLE]
Gate Theme: [THEME]
Gate Focus: [FOCUS AREAS]

SECTION BREAKDOWN:
- Q1–25:   Reasoning (section code R)
- Q26–50:  GK — General Awareness (section code G)
- Q51–75:  Quantitative Aptitude (section code Q)
- Q76–100: English Comprehension (section code E)

ID FORMAT: G[NN]-[Section Code]-[000]
Example: G02-R-001, G02-G-012, G02-Q-025, G02-E-018

SCHEMA FOR EACH QUESTION:
[paste _blank_template from TEMPLATE-question.json]

QUALITY RULES:
1. All 4 options must be plausible — no obviously wrong filler
2. Explanation must name the most-tempting wrong option and say why it's wrong
3. SSC CGL Tier 1 level — not JEE, not UPSC, not IBPS
4. Do not repeat topics already in Gate 1 (Baseline topics)
5. Do not use questions verbatim from known PYQs — paraphrase patterns, change numbers
6. common_trap must be specific to THIS question, not generic

Return a JSON object: { "gate": N, "title": "...", "duration_minutes": 60, "questions": [...] }
Return ONLY the JSON. No markdown. No explanation.
```

---

### Per-Gate Brief

#### Gate 2 — Concept Consolidation
```
Gate Title: "Gate 2 — The Consolidation"
Gate Theme: Foundation solidification after the diagnostic

Reasoning Focus:
- Analogy (word, number, letter) — 6Q
- Series completion (number, letter, mixed) — 5Q
- Classification/Odd one out — 4Q
- Direction & Distance — 3Q
- Blood Relations — 3Q
- Coding-Decoding — 4Q

GK Focus:
- Indian History: Ancient & Medieval — 8Q
- Geography: India (rivers, mountains, passes) — 6Q
- Polity: Basic constitutional framework — 5Q
- Science: Biology basics (cells, organs) — 4Q
- Miscellaneous: Sports, Awards 2024 — 2Q

Quant Focus:
- Percentage — 6Q
- Ratio & Proportion — 5Q
- Average — 4Q
- Simple Interest — 4Q
- Number System (HCF/LCM, divisibility) — 6Q

English Focus:
- Synonyms — 5Q
- Antonyms — 5Q
- Fill in the blanks (vocabulary) — 5Q
- Error spotting — 5Q
- One-word substitution — 5Q
```

#### Gate 3 — Quantitative Surge
```
Gate Title: "Gate 3 — The Quant Surge"
Gate Theme: Strengthening quantitative aptitude — most-feared section

Reasoning Focus:
- Syllogism — 5Q
- Puzzle (seating arrangement, linear) — 5Q
- Venn Diagrams — 3Q
- Mathematical Operations — 4Q
- Mirror/Water Image — 3Q
- Paper Folding/Cutting — 3Q
- Figure Completion — 2Q

GK Focus:
- Modern Indian History: Freedom Movement — 7Q
- Economy: Budget, GDP, banking basics — 6Q
- Science: Physics basics (motion, light, sound) — 5Q
- Polity: Parliament, bills, amendments — 4Q
- Current Affairs: 2024-25 national events — 3Q

Quant Focus (heavier than usual — this is the Quant Surge):
- Profit, Loss, Discount — 6Q
- Time & Work — 5Q
- Speed, Distance, Time — 4Q
- Algebra (basic equations) — 4Q
- Data Interpretation (table) — 6Q

English Focus:
- Reading Comprehension (1 passage, 5Q) — 5Q
- Idioms & Phrases — 5Q
- Active/Passive Voice — 4Q
- Direct/Indirect Speech — 4Q
- Spellings — 3Q
- Sentence rearrangement (Para Jumbles) — 4Q
```

#### Gate 4 — English & GK Depth
```
Gate Title: "Gate 4 — The Vocabulary War"
Gate Theme: English and GK depth — the scoring zone

Reasoning Focus:
- Statement & Conclusion — 5Q
- Statement & Assumption — 4Q
- Cause & Effect — 3Q
- Clock problems — 3Q
- Calendar problems — 3Q
- Ranking/Ordering — 4Q
- Input-Output — 3Q

GK Focus:
- Geography: World (continents, oceans, climate zones) — 6Q
- Science: Chemistry (elements, acids, metals) — 6Q
- Polity: President, PM, Cabinet — 5Q
- Culture: Classical dances, music, festivals — 5Q
- Current Affairs: International events 2025 — 3Q

Quant Focus:
- Geometry (triangles, circles, quadrilaterals) — 6Q
- Trigonometry (basic values, identities) — 5Q
- Mensuration (area, volume — 2D & 3D) — 5Q
- Statistics (mean, median, mode) — 3Q
- Number System (fractions, surds, indices) — 6Q

English Focus (heavier than usual — this is the Vocabulary War):
- Synonyms — 5Q
- Antonyms — 5Q
- One-word substitution — 5Q
- Idioms & Phrases — 5Q
- Fill in blanks (grammar) — 5Q
```

#### Gate 5 — Full-Length Pressure Test
```
Gate Title: "Gate 5 — The Pressure Cooker"
Gate Theme: Full exam simulation — time pressure, mixed difficulty

Reasoning Focus:
- Analogy (mixed: word + number + letter) — 5Q
- Series (mixed) — 5Q
- Coding-Decoding (new pattern) — 3Q
- Sitting Arrangement (circular) — 4Q
- Blood Relations (complex) — 3Q
- Data Sufficiency — 2Q
- Embedded Figures — 3Q

GK Focus:
- Indian Polity (comprehensive) — 7Q
- Modern History + Freedom Movement — 5Q
- Science: Biology + Chemistry combined — 6Q
- Economy: Financial institutions, schemes — 4Q
- Sports + Awards 2025 — 3Q

Quant Focus:
- Profit/Loss + Discount (advanced) — 5Q
- Time & Work + Pipes & Cisterns — 5Q
- DI (Bar graph) — 5Q
- Algebra (quadratic, linear) — 4Q
- Geometry + Trigonometry (mixed) — 6Q

English Focus:
- Reading Comprehension (2 passages, 4Q each) — 8Q
- Error Spotting — 4Q
- Para Jumbles — 4Q
- Cloze Test (1 passage, 5 blanks) — 5Q
- Vocabulary (syn/ant/idiom mixed) — 4Q
```

#### Gate 6 — Weak Topic Assault
```
Gate Title: "Gate 6 — The Weak Zone"
Gate Theme: Topics most aspirants avoid or get wrong consistently

Reasoning Focus:
- Non-Verbal: Series (complex figures) — 5Q
- Non-Verbal: Analogies (figure-based) — 4Q
- Critical Reasoning (new format) — 4Q
- Distance & Direction (complex multi-step) — 4Q
- Mathematical operations (tricky substitution) — 4Q
- Missing number in matrix — 4Q

GK Focus:
- Ancient History (Maurya, Gupta, Harappa) — 5Q
- Medieval History (Delhi Sultanate, Mughal) — 5Q
- Environment & Ecology (pollution, biodiversity) — 5Q
- International Organizations (UN, WTO, IMF) — 5Q
- Geography: Indian agricultural zones — 5Q

Quant Focus:
- Probability (basic) — 4Q
- Permutation & Combination — 3Q
- Set Theory / Venn Diagrams (quant) — 3Q
- CI vs SI (compound interest) — 4Q
- Mixture & Alligation — 4Q
- Boat & Stream — 4Q
- Partnership — 3Q

English Focus:
- Cloze Test (full passage, 5 blanks) — 5Q
- Sentence Improvement — 5Q
- Synonyms (advanced/literary) — 4Q
- Antonyms (advanced/literary) — 4Q
- One-word substitution (advanced) — 4Q
- Spotting the Error (grammar-heavy) — 3Q
```

---

## Output File Naming

| Content | Save as |
|---------|---------|
| Gate 2 questions | `data/question-bank/gate-02.json` |
| Gate 3 questions | `data/question-bank/gate-03.json` |
| Gate 4 questions | `data/question-bank/gate-04.json` |
| Gate 5 questions | `data/question-bank/gate-05.json` |
| Gate 6 questions | `data/question-bank/gate-06.json` |
| Smart Note (topic) | `data/smart-notes/{slug}.json` |

---

## Validation Checklist (Before Accepting Daksha Output)

- [ ] Exactly 100 questions per gate
- [ ] 25 each: Reasoning, GK, Quant, English
- [ ] IDs follow `G0N-X-NNN` format, no gaps
- [ ] Every question has: text, 4 options, answer, explanation, common_trap, diagnoses
- [ ] No question repeats a verbatim PYQ
- [ ] Difficulty mix: ~40 Easy / 40 Medium / 20 Hard
- [ ] Smart Note: story is 150-200 words, key_facts = exactly 5, common_traps = exactly 3
