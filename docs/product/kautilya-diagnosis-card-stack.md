# KAUTILYA IAS Diagnosis Card Stack

Generated from the deployed diagnosis registry. This is the complete 60-card instrument, including the curated Free 40 subset and every silent option mapping.

## Instrument Shape

| Level | Name | Free 40 | Premium 60 total |
| --- | --- | ---: | ---: |
| L1 | The Journey So Far | 5 | 7 |
| L2 | The Why | 6 | 9 |
| L3 | The Daily Reality | 5 | 6 |
| L4 | The Resource Map | 4 | 6 |
| L5 | The Mind Under Fire | 5 | 8 |
| L6 | The Emotional Core | 5 | 8 |
| L7 | The Anchor | 5 | 9 |
| L8 | The Mirror | 5 | 7 |
| **Total** |  | **40** | **60** |

## How Mapping Works

1. Every numeric dimension begins at its baseline.
2. The selected option adds or subtracts its listed deltas.
3. Scores are rounded and clamped to 0-100 after all answers are processed.
4. Factual routes set stage, purpose, self-belief, attempts, age, employment, or risk flags.
5. Every selected answer is also passed to the report generator as readable narrative evidence, including options with no numeric delta.
6. Attempt pressure is computed from attempts used and age runway, then adjusted by explicit pressure signals.
7. Integration score is the only exposed meta-score: `100 - resource_chaos`.

A positive delta increases the named dimension. For protective dimensions such as clarity, consistency, recovery, Prelims nerve, and Mains stamina, higher is generally stronger. For volatility, friction, distraction, chaos, identity fusion, and external pressure, higher indicates greater risk or load.

## Silent Dimension Baselines

| Dimension | Baseline | Meaning |
| --- | ---: | --- |
| Purpose intensity | 40 | Strength and durability of the reason for pursuing UPSC. |
| Anchor strength | 40 | How reliably a person, vow, purpose, or identity returns the aspirant to action. |
| Emotional volatility | 30 | How strongly results, comparison, and uncertainty disturb emotional steadiness. |
| Cognitive clarity | 45 | Ability to structure, connect, explain, and decide from available knowledge. |
| Execution friction | 30 | Gap between knowing the next action and actually beginning or completing it. |
| Distraction risk | 25 | Exposure to digital noise, comparison, novelty, and attention leakage. |
| Marathon consistency | 45 | Capacity to sustain repeatable preparation across ordinary and difficult weeks. |
| Recovery speed | 50 | Speed and quality of return after failure, interruption, or emotional impact. |
| Prelims nerve | 50 | Judgement, elimination discipline, and risk control under objective-paper pressure. |
| Mains stamina | 40 | Ability to write structured answers and sustain full-paper output. |
| Resource chaos | 0 | Source proliferation and integration debt. Higher is worse. |
| Identity fusion | 25 | Degree to which exam outcome and personal worth have become fused. Higher is riskier. |
| External pressure | 25 | Family, money, age, work, social timeline, and obligation pressure. |

## Archetype Cascade

The first matching rule wins:

1. **Comeback Warrior:** stage is `RETURNING` and purpose intensity is at least 75.
2. **Prelims-Trap Scholar:** stage is `PRELIMS_WALL`, attempts are at least 2, cognitive clarity is at least 75, and Prelims nerve is at most 40.
3. **Working-Professional Splitter:** employed and external pressure is at least 60.
4. **Fragmented Maximalist:** resource chaos is at least 80.
5. **First-Flight Idealist:** stage is `FRESH`.
6. Otherwise, the nearest of the five archetype centroids is selected.

Up to three war-pattern tags are added from explicit flags and score thresholds: Notes Hoarder, Mains Avoider, Newspaper Collector, Revision Collapser, and Strategy Consumer.

## Report Composition

| Output | Main evidence |
| --- | --- |
| Cognitive archetype | Stage, attempts, employment, clarity, nerve, pressure, chaos, consistency, recovery, and all silent dimensions. |
| Strengths and vulnerabilities | Repeated behavioural evidence across levels; one answer should not overrule contradictory evidence. |
| Target profile | L2-07 post family, L2-08 rank band, and L2-09 score orientation. Exact numbers are never invented. |
| Emotional vault | L6-08 trigger, corroborated by wounds, comparison, result response, family climate, identity fusion, and pressure. |
| Anchor vault | Human relationship, emotional role, character category, purpose, worst-day return, and embodied anchor effect. |
| Personal laws | L8-06 explicit law plus repeated behavioural leaks from resource, consistency, test, recovery, and operating evidence. |
| Operating profile | L8-07 rhythm combined with employment, available hours, consistency, friction, distraction, recovery, and accountability. |
| Attack plan | Weakest engines, stage, exam-hall behaviour, source pattern, and recovery needs. |

## Level 1: The Journey So Far

> Facts first. No judgment lives here.

Cards: 7 total; 5 in Free 40; 2 additional in Premium 60.

### L1-01 - Free 40 + Premium 60

**Question:** How long has UPSC been part of your life — not preparation hours, but the dream itself living in your head?

**Feeds:** Aspirant diagnosis | Attempt-stage profile | Cognitive archetype | Operating profile | Preparation-age context | Veteran/first-flight calibration

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Less than a year. The dream is new. | Fact: prep_years=0.5 |
| B | One to two years. | Fact: prep_years=1.5 |
| C | Two to three years. It has roots now. | Identity fusion +5; Fact: prep_years=2.5 |
| D | Three to four years. It has shaped who I am. | Identity fusion +10; Fact: prep_years=3.5 |
| E | More than four years. I don't remember who I was before it. | Identity fusion +18; Fact: prep_years=5; Flags: GHOST_CANDIDATE, VETERAN_GHOST |

### L1-02 - Free 40 + Premium 60

**Question:** How many Prelims have you actually sat for — admit card in hand, hall entered?

**Feeds:** Aspirant diagnosis | Attempt-stage profile | Cognitive archetype | Operating profile | Attempt pressure | Prelims-wall routing

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | None yet. My first is ahead of me. | Fact: attempts_taken=0 |
| B | One. | Fact: attempts_taken=1 |
| C | Two. | Fact: attempts_taken=2 |
| D | Three. | Fact: attempts_taken=3 |
| E | Four or more. | Attempt pressure +10; Fact: attempts_taken=4 |

### L1-03 - Free 40 + Premium 60

**Question:** How far has the war taken you so far?

**Feeds:** Aspirant diagnosis | Attempt-stage profile | Cognitive archetype | Operating profile | Stage pattern | Archetype cascade | Prelims verdict

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Haven't taken Prelims yet. | Stage=FRESH |
| B | Attempted Prelims. Haven't cleared it yet. | Stage=PRELIMS_WALL |
| C | Cleared Prelims. Mains is my wall. | Stage=MAINS_PLATEAU; Flags: PLATEAU_CANDIDATE |
| D | Reached the interview. Missed the list. | Stage=INTERVIEW_EDGE; Flags: HEARTBREAK_CANDIDATE |
| E | In a service already — fighting for a higher one. | Stage=CLEARED_LOWER |
| F | I left preparation for a while. I'm back. | Stage=RETURNING |

### L1-04 - Premium 60 only

**Question:** Mains — the nine papers, the writing marathon. How many times have you faced it?

**Feeds:** Aspirant diagnosis | Attempt-stage profile | Cognitive archetype | Operating profile | Mains exposure | Mains plateau signal

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Never reached it yet. | Narrative evidence only; no numeric delta or routing override. |
| B | Once. I know its taste now. | Narrative evidence only; no numeric delta or routing override. |
| C | Twice — and my score barely moved between them. | Mains stamina -5; Flags: PLATEAU_CANDIDATE |
| D | Twice or more — and I improved each time. | Recovery speed +8; Mains stamina +5 |
| E | Three or more times. The wall knows my name. | Attempt pressure +8; Flags: PLATEAU_CANDIDATE |

### L1-05 - Premium 60 only

**Question:** Was there ever a season you stepped away from preparation completely — months where the books stayed closed?

**Feeds:** Aspirant diagnosis | Attempt-stage profile | Cognitive archetype | Operating profile | Continuity pattern | Return pattern

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | No. I've been continuous since I started. | Marathon consistency +8 |
| B | A short break — weeks, to breathe. Then back. | Recovery speed +5 |
| C | Yes — a job, a duty, a life chapter took me away. I've returned. | Stage=RETURNING |
| D | Yes — I broke after a result and stayed away a long time. | Recovery speed -10 |
| E | I'm technically "preparing" but honestly half-away right now. | Marathon consistency -12; Execution friction +8 |

### L1-06 - Free 40 + Premium 60

**Question:** Where are you on the eligibility runway? (Used only for planning math — never shown back to you.)

**Feeds:** Aspirant diagnosis | Attempt-stage profile | Cognitive archetype | Operating profile | Eligibility runway | Attempt pressure

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | 24 or younger. Long runway. | Fact: age=23 |
| B | 25 to 27. Mid-runway. | Fact: age=26 |
| C | 28 to 30. The window is real now. | Attempt pressure +8; Fact: age=29 |
| D | 31 or beyond / final attempts territory. | Attempt pressure +15; Fact: age=31 |

### L1-07 - Free 40 + Premium 60

**Question:** Think of your last result — Prelims, Mains, or the final list. What did the following MONTH of preparation look like?

**Feeds:** Aspirant diagnosis | Attempt-stage profile | Cognitive archetype | Operating profile | Post-result recovery | Emotional vault

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | I haven't had a result yet. | Narrative evidence only; no numeric delta or routing override. |
| B | Back at the desk within days, plan adjusted, moving. | Recovery speed +18; Marathon consistency +5 |
| C | Two or three weeks of fog, then I rebuilt. | Recovery speed +5 |
| D | The month was a write-off. Recovery took a season. | Recovery speed -12 |
| E | Honestly — I'm still not fully back from it. | Recovery speed -20; Emotional volatility +8 |

## Level 2: The Why

> The engine under the engine.

Cards: 9 total; 6 in Free 40; 3 additional in Premium 60.

### L2-01 - Free 40 + Premium 60

**Question:** Finish the sentence with the answer that is true at 2 a.m., not the one for interviews: "I want to clear UPSC because…"

**Feeds:** Purpose profile | Motivators | Target profile | Anchor vault | Purpose type | Deep motivator

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | …there are specific things broken in this country I want my hands on. | Purpose intensity +15; Purpose=SERVICE |
| B | …my family's sacrifices deserve a destination. | Purpose intensity +12; External pressure +8; Purpose=RESTORATION |
| C | …I cannot spend my life in the job/life I'm currently in. | Purpose intensity +8; Purpose=ESCAPE |
| D | …the respect, the position, the name. I want to matter. | Purpose intensity +8; Purpose=STATUS |
| E | …someone said I couldn't. I intend to correct them. | Purpose intensity +10; Purpose=PROOF |
| F | …honestly, I've never examined it. It arrived before the reasons did. | Purpose intensity -5; Purpose=UNTESTED |

### L2-02 - Free 40 + Premium 60

**Question:** Trace the dream to its birth. Whose was it first?

**Feeds:** Purpose profile | Motivators | Target profile | Anchor vault | Dream origin | Human/purpose anchor

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Mine — a specific moment, person, or injustice lit it. | Purpose intensity +12; Anchor strength +5 |
| B | It grew slowly out of my own reading and conviction. | Purpose intensity +8 |
| C | My family planted it. I adopted it and made it mine. | External pressure +5 |
| D | My family planted it. I'm still deciding if it's mine. | Purpose intensity -8; External pressure +10; Purpose=UNTESTED |
| E | A topper's story / the aura of the service pulled me in. | Purpose intensity -3 |

### L2-03 - Free 40 + Premium 60

**Question:** Selection happens tomorrow. Your name, the list, real. The first feeling — before celebration — would be:

**Feeds:** Purpose profile | Motivators | Target profile | Anchor vault | Selection meaning | Identity pressure

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Relief. The weight finally off. | External pressure +8; Identity fusion +5 |
| B | Vindication. Faces flash before my eyes. | Purpose intensity +5 |
| C | Hunger — straight to "now the real work begins." | Purpose intensity +12 |
| D | My family's faces. Nothing else for the first hour. | Anchor strength +10 |
| E | Honestly… emptiness scares me. What would I chase next? | Identity fusion +15; Flags: FUSION_WATCH |

### L2-04 - Free 40 + Premium 60

**Question:** A friend who loves you asks: "Why not state PCS, SSC, a corporate job — the easier doors?" Your honest internal answer:

**Feeds:** Purpose profile | Motivators | Target profile | Anchor vault | Alternative-path stability | Identity fusion

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Because the work I want to do only exists behind this door. | Purpose intensity +15 |
| B | Because I'd regret not trying for the top, forever. | Purpose intensity +10 |
| C | I have considered them. They're my honest plan B, and that's okay. | Recovery speed +5 |
| D | Because stepping down now would feel like a verdict on me. | Identity fusion +12 |
| E | The question rattles me more than I admit. | Purpose intensity -8 |

### L2-05 - Premium 60 only

**Question:** Which scene do you replay more often in your head?

**Feeds:** Purpose profile | Motivators | Target profile | Anchor vault | Service/status/restoration imagery

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Me in the field — a district, a crisis, a decision that helps real people. | Purpose intensity +10; Purpose=SERVICE |
| B | The result moment — my name, the calls, the celebration. | Purpose intensity +3 |
| C | Walking into my old neighbourhood after selection. | Purpose=PROOF |
| D | My parents' faces when the news lands. | Anchor strength +8; Purpose=RESTORATION |
| E | I mostly replay past failures, not future wins. | Emotional volatility +10; Recovery speed -5 |

### L2-06 - Free 40 + Premium 60

**Question:** Strange question. If UPSC vanished tomorrow — exam abolished — who would you be?

**Feeds:** Purpose profile | Motivators | Target profile | Anchor vault | Identity separation | Walk-away resilience

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | The same person, pointed at a different mountain within a month. | Identity fusion -10; Recovery speed +10 |
| B | Disoriented for a while, but I'd find a path. | Identity fusion 0 |
| C | Honestly lost. This exam is my entire architecture. | Identity fusion +20; Flags: FUSION_WATCH |
| D | Relieved — and that answer surprises me. | Purpose intensity -10; External pressure +10 |
| E | I refuse to think about this. | Identity fusion +15; Flags: FUSION_WATCH |

### L2-07 - Free 40 + Premium 60

**Question:** When you picture the work after selection, which chair are you actually preparing to earn?

**Feeds:** Purpose profile | Motivators | Target profile | Anchor vault | Target post/service family

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | IAS: field administration, policy, and executive responsibility. | Purpose intensity +8; Cognitive clarity +3 |
| B | IPS: command, public order, and institutional leadership. | Purpose intensity +8; Cognitive clarity +3 |
| C | IFS: diplomacy, negotiation, and representing India abroad. | Purpose intensity +8; Cognitive clarity +3 |
| D | Revenue or economic services: taxation, finance, trade, or regulation. | Purpose intensity +6; Cognitive clarity +3 |
| E | Another Group A service whose work fits me better than its prestige. | Purpose intensity +6; Cognitive clarity +5 |
| F | I want selection first; I have not chosen a service honestly yet. | Cognitive clarity -3 |

### L2-08 - Premium 60 only

**Question:** Strip away polite modesty. What rank band is the campaign in your head built to pursue?

**Feeds:** Purpose profile | Motivators | Target profile | Anchor vault | Target rank band

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Top 10. I am preparing for first-choice certainty. | Purpose intensity +8 |
| B | Top 50. My target assumes a very high service allocation. | Purpose intensity +6 |
| C | Top 100. I want a strong chance at a preferred service. | Purpose intensity +5 |
| D | A rank that secures my chosen service, whatever that number becomes. | Cognitive clarity +5 |
| E | Any place in the final list would change the war. | External pressure +5 |
| F | I have never converted the dream into a rank target. | Cognitive clarity -4 |

### L2-09 - Premium 60 only

**Question:** Which numerical line is most real in your preparation plan right now?

**Feeds:** Purpose profile | Motivators | Target profile | Anchor vault | Target score orientation

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | A repeatable Prelims GS score with a clear safety margin above recent cutoffs. | Prelims nerve +5; Cognitive clarity +4 |
| B | A CSAT score that makes qualification boring rather than frightening. | Prelims nerve +5; Cognitive clarity +4 |
| C | A Mains written score strong enough that the interview is not a rescue mission. | Mains stamina +5; Cognitive clarity +4 |
| D | A final aggregate benchmark tied to my preferred service and rank. | Cognitive clarity +6 |
| E | I track improvement and safety margin, not one permanent number. | Cognitive clarity +4 |
| F | No score line is written down yet. | Cognitive clarity -5; Execution friction +3 |

## Level 3: The Daily Reality

> The war as it actually is.

Cards: 6 total; 5 in Free 40; 1 additional in Premium 60.

### L3-01 - Free 40 + Premium 60

**Question:** Your current life structure, as it actually is:

**Feeds:** Operating profile | External-pressure model | Rules and laws | Vulnerabilities | Employment constraint | Available-time architecture

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Full-time preparation. The exam is my job. | Fact: employed=false |
| B | Full-time job + preparation in the margins. | External pressure +10; Fact: employed=true |
| C | College/degree + preparation alongside. | Fact: employed=false |
| D | Family responsibilities + preparation — caregiving, business, duties. | External pressure +12 |
| E | Part-time work / teaching to fund the preparation itself. | External pressure +8; Fact: employed=true |

### L3-02 - Free 40 + Premium 60

**Question:** Averaged over the last 30 days — not your best day, the average — your real deep-study hours:

**Feeds:** Operating profile | External-pressure model | Rules and laws | Vulnerabilities | Real study-hour baseline | Operating rhythm

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Under 2 hours. The margins are thin right now. | Marathon consistency -8 |
| B | 2–4 hours, mostly protected. | Marathon consistency +5 |
| C | 4–7 hours, fairly consistent. | Marathon consistency +12 |
| D | 7+ hours, machine mode. | Marathon consistency +15 |
| E | Wildly inconsistent — 9 hours one day, zero for three. | Marathon consistency -15; Emotional volatility +8 |

### L3-03 - Free 40 + Premium 60

**Question:** The money question, privately: how long can your current arrangement sustain this preparation?

**Feeds:** Operating profile | External-pressure model | Rules and laws | Vulnerabilities | Financial runway | External pressure

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Years if needed. Runway is not my constraint. | External pressure -8 |
| B | Comfortably through the next attempt cycle. | External pressure 0 |
| C | About a year. After that, hard conversations. | External pressure +12 |
| D | Months. The clock is loud. | External pressure +20 |
| E | I'm funding it myself, paycheck to preparation. | External pressure +15 |

### L3-04 - Free 40 + Premium 60

**Question:** The conversation about your preparation at home is best described as:

**Feeds:** Operating profile | External-pressure model | Rules and laws | Vulnerabilities | Family climate | Family anchors

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Full backing. They'd fund a decade if I asked. | External pressure -10; Anchor strength +5 |
| B | Supportive, with a quietly ticking clock underneath. | External pressure +8 |
| C | Conditional — "this attempt, then we talk." | External pressure +18 |
| D | They don't fully know how serious / how hard this is. | External pressure +8; Flags: ISOLATION |
| E | Tense. The topic itself is a wound at home. | External pressure +20; Emotional volatility +5 |

### L3-05 - Premium 60 only

**Question:** The other timelines — marriage talk, peer salaries, "settle down" pressure. How loud are they in your head?

**Feeds:** Operating profile | External-pressure model | Rules and laws | Vulnerabilities | Social timeline pressure

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Silent. I've fenced them off completely. | External pressure -5 |
| B | Background hum. Noticed, not steering. | External pressure +5 |
| C | Loud during result seasons and weddings. | External pressure +10; Emotional volatility +5 |
| D | Constant. Every life update from peers costs me focus. | External pressure +15; Distraction risk +8 |
| E | It's become the real opponent — louder than the syllabus. | External pressure +22 |

### L3-06 - Free 40 + Premium 60

**Question:** Last 90 days. On how many of them did you genuinely study — even one focused hour counts?

**Feeds:** Operating profile | External-pressure model | Rules and laws | Vulnerabilities | Consistency evidence | Minimum viable day

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | 80+. The rhythm holds. | Marathon consistency +18 |
| B | 60–80. Solid, with human gaps. | Marathon consistency +10 |
| C | 40–60. Stop-start. Momentum keeps escaping. | Marathon consistency -5; Execution friction +8 |
| D | Under 40. The plan exists; the days don't obey it. | Marathon consistency -15; Execution friction +12 |
| E | I genuinely cannot estimate — I've stopped tracking. | Marathon consistency -10; Flags: REVISION_COLLAPSER |

## Level 4: The Resource Map

> Count everything. Honestly.

Cards: 6 total; 4 in Free 40; 2 additional in Premium 60.

### L4-01 - Premium 60 only

**Question:** Open your phone in your mind. How many UPSC-related Telegram channels and WhatsApp groups live there right now?

**Feeds:** Resource-chaos map | Integration engine | Personal laws | Vulnerabilities | Digital-source noise

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Zero to two. Curated and quiet. | Resource chaos -10; Distraction risk -5 |
| B | Three to seven. Manageable noise. | Resource chaos +8 |
| C | Eight to fifteen. The forwards never stop. | Resource chaos +18; Distraction risk +10 |
| D | Fifteen to thirty. I've muted most, deleted none. | Resource chaos +28; Distraction risk +15 |
| E | I've lost count. Joining them feels like preparation. | Resource chaos +35; Distraction risk +18; Flags: NEWSPAPER_COLLECTOR, NEWSPAPER_PROXY |

### L4-02 - Free 40 + Premium 60

**Question:** Count honestly: how many sources do you currently follow for Polity alone?

**Feeds:** Resource-chaos map | Integration engine | Personal laws | Vulnerabilities | Subject source authority | Fragmented Maximalist routing

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | One. Locked. | Resource chaos 0 |
| B | Two — a book and a PDF. | Resource chaos +15 |
| C | Three to four. | Resource chaos +35 |
| D | Five or more. | Resource chaos +55 |
| E | I've genuinely lost count. | Resource chaos +70; Execution friction +10 |

### L4-03 - Free 40 + Premium 60

**Question:** Note systems — notebooks, Notion, Evernote, loose sheets, that one beautiful register. How many have you started and abandoned?

**Feeds:** Resource-chaos map | Integration engine | Personal laws | Vulnerabilities | Note-system churn | Notes Hoarder flag

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | One system, still alive, still growing. | Resource chaos -8; Execution friction -5 |
| B | Two. One died; its successor survives. | Resource chaos +5 |
| C | Three or four graveyards so far. | Resource chaos +15; Execution friction +10; Flags: NOTES_HOARDER |
| D | Five-plus. Starting fresh notes IS my coping ritual. | Resource chaos +25; Execution friction +18; Flags: NOTES_HOARDER |
| E | I mostly collect others' notes and never make my own. | Resource chaos +20; Execution friction +12; Flags: NOTES_HOARDER |

### L4-04 - Premium 60 only

**Question:** A new topper-strategy video drops — "How I cleared in my first attempt." You:

**Feeds:** Resource-chaos map | Integration engine | Personal laws | Vulnerabilities | Strategy consumption

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Rarely watch them anymore. My system is set. | Execution friction -8 |
| B | Watch occasionally, extract one tactic, move on. | Cognitive clarity +5 |
| C | Watch most of them "for motivation." | Distraction risk +8; Execution friction +5 |
| D | Watch, take notes on the strategy, redesign my plan. Again. | Execution friction +18; Flags: STRATEGY_CONSUMER |
| E | I know toppers' timetables better than my own subjects. | Execution friction +22; Distraction risk +10; Flags: STRATEGY_CONSUMER |

### L4-05 - Free 40 + Premium 60

**Question:** Your current-affairs stack, described without mercy:

**Feeds:** Resource-chaos map | Integration engine | Personal laws | Vulnerabilities | Current-affairs integration

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | One newspaper OR one monthly magazine. Done daily/monthly. Closed loop. | Resource chaos -8 |
| B | Newspaper + one compilation. Mostly current. | Resource chaos +5 |
| C | Newspaper + 2-3 monthlies + daily quiz + YouTube analysis. | Resource chaos +18; Flags: NEWSPAPER_COLLECTOR, NEWSPAPER_PROXY |
| D | A growing pile of unread monthlies that judges me from the shelf. | Resource chaos +22; Execution friction +10; Flags: NEWSPAPER_COLLECTOR, NEWSPAPER_PROXY |
| E | I've abandoned CA out of overwhelm. I'll "cover it before Prelims." | Resource chaos +15; Prelims nerve -8 |

### L4-06 - Free 40 + Premium 60

**Question:** Thought experiment: tonight you must delete every source except ONE per subject. The feeling in your chest is:

**Feeds:** Resource-chaos map | Integration engine | Personal laws | Vulnerabilities | Source-reduction readiness

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Relief. Please. Someone make me do it. | Resource chaos +5; Purpose intensity +5 |
| B | Acceptance — I basically already live this way. | Resource chaos -10 |
| C | Anxiety — what if the dropped source had THE question? | Resource chaos +15; Emotional volatility +8 |
| D | Resistance. My collection feels like my preparation. | Resource chaos +22; Flags: NOTES_HOARDER |
| E | I'd agree, then quietly re-download everything by Friday. | Resource chaos +18; Execution friction +8 |

## Level 5: The Mind Under Fire

> The exam hall lives in the mind.

Cards: 8 total; 5 in Free 40; 3 additional in Premium 60.

### L5-01 - Free 40 + Premium 60

**Question:** A full 3-hour Mains test paper is scheduled for tomorrow morning. Tonight, your honest pattern:

**Feeds:** Cognitive archetype | Prelims/Mains verdict | Strengths and vulnerabilities | Attack plan | Full-paper avoidance/stamina

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | I'll sit it fully. Writing tests is non-negotiable in my week. | Mains stamina +18 |
| B | I'll sit it, though my hand and mind fade by hour three. | Mains stamina +8 |
| C | I'll probably convert it into "reading the questions and framing mentally." | Mains stamina -10; Flags: MAINS_AVOIDER |
| D | I'll postpone it — one more revision round first. Always one more. | Mains stamina -15; Execution friction +10; Flags: MAINS_AVOIDER |
| E | Full honesty: I haven't written a complete timed paper yet. | Mains stamina -20; Flags: MAINS_AVOIDER |

### L5-02 - Premium 60 only

**Question:** A 10-marker stares at you. You know maybe 60% of it. The clock is moving. You:

**Feeds:** Cognitive archetype | Prelims/Mains verdict | Strengths and vulnerabilities | Attack plan | Answer conversion under partial knowledge

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Write immediately — structure first, fill with what I have, move on. | Mains stamina +15; Prelims nerve +5 |
| B | Take a minute to frame, then write a decent 60% answer. | Mains stamina +10 |
| C | Stall — the imperfection of what I'd write paralyzes the pen. | Mains stamina -12; Execution friction +8 |
| D | Skip it, promise to return, usually don't. | Mains stamina -15 |
| E | Over-write it to compensate, and bleed time from three other answers. | Mains stamina -8; Emotional volatility +5 |

### L5-03 - Free 40 + Premium 60

**Question:** "Consider the following statements… How many of the above are correct?" Your gut, the moment you see this format:

**Feeds:** Cognitive archetype | Prelims/Mains verdict | Strengths and vulnerabilities | Attack plan | Statement-question method

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Good. Each statement is a separate true/false battle. I like the structure. | Prelims nerve +15; Cognitive clarity +8 |
| B | Steady. Slower than direct questions, but I have a method. | Prelims nerve +8 |
| C | Mild dread — one slippery statement poisons the whole question. | Prelims nerve -8 |
| D | This format is personally responsible for my Prelims scores. | Prelims nerve -15 |
| E | I still haven't built a method for these. I improvise each time. | Prelims nerve -10; Cognitive clarity -5 |

### L5-04 - Free 40 + Premium 60

**Question:** Your Prelims attempt-count philosophy — the real one you executed last time, not the ideal:

**Feeds:** Cognitive archetype | Prelims/Mains verdict | Strengths and vulnerabilities | Attack plan | Attempt-risk calibration

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Around 85–95 attempted. Calculated aggression with elimination. | Prelims nerve +15 |
| B | 75–85. Sure ones plus disciplined 50-50 gambles. | Prelims nerve +10 |
| C | Under 70. I only touch what I'm certain of. The −0.66 haunts me. | Prelims nerve -15 |
| D | It varies wildly with my mood in the hall. | Prelims nerve -8; Emotional volatility +12 |
| E | Haven't sat a real Prelims yet — my strategy is theoretical. | Prelims nerve -5 |

### L5-05 - Premium 60 only

**Question:** You read a strong editorial on, say, federal tensions. What does your mind do with it?

**Feeds:** Cognitive archetype | Prelims/Mains verdict | Strengths and vulnerabilities | Attack plan | Static-current integration

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Auto-links it — Finance Commission, Governor's role, a Mains question forms itself. | Cognitive clarity +18 |
| B | I understand it fully and file it mentally under its topic. | Cognitive clarity +10 |
| C | I understand it while reading; it evaporates by evening. | Cognitive clarity -5; Flags: REVISION_COLLAPSER |
| D | I highlight it, screenshot it, save it to the pile. The pile. | Cognitive clarity -3; Resource chaos +10; Flags: NEWSPAPER_COLLECTOR, NEWSPAPER_PROXY |
| E | Editorials feel like a foreign language I'm pretending to read. | Cognitive clarity -12 |

### L5-06 - Free 40 + Premium 60

**Question:** Prelims hall. Question 71. You've eliminated two options; two remain. 40 seconds. What happens in your body?

**Feeds:** Cognitive archetype | Prelims/Mains verdict | Strengths and vulnerabilities | Attack plan | Two-option nerve

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Calm coin-flip with logic — I take the shot. | Prelims nerve +20 |
| B | I mark it for review and never come back. | Prelims nerve -10; Execution friction +5 |
| C | I freeze, burn 3 minutes, guess in panic. | Prelims nerve -20 |
| D | I skip — I only answer when 100% sure. | Prelims nerve -15 |
| E | Depends entirely on how the first 70 went. | Emotional volatility +15 |

### L5-07 - Premium 60 only

**Question:** CSAT. The qualifying paper that disqualifies thousands. Your honest relationship with it:

**Feeds:** Cognitive archetype | Prelims/Mains verdict | Strengths and vulnerabilities | Attack plan | CSAT readiness

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Comfortable. I clear it with margin in every mock. | Prelims nerve +5 |
| B | Respectful — I give it weekly time because I've seen it kill. | Marathon consistency +5; Prelims nerve +5 |
| C | Uneasy. Comprehension is fine; maths makes my hands cold. | Prelims nerve -8 |
| D | I ignore it and pray. "It's just qualifying." | Prelims nerve -12; Execution friction +8 |
| E | CSAT has already cost me an attempt. | Prelims nerve -10; Attempt pressure +8 |

### L5-08 - Free 40 + Premium 60

**Question:** You studied a topic thoroughly last week. Today someone asks you to explain it in two minutes. What comes out?

**Feeds:** Cognitive archetype | Prelims/Mains verdict | Strengths and vulnerabilities | Attack plan | Recall structure | Explanation clarity

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | A clean, structured two minutes — intro, three points, close. | Cognitive clarity +15; Mains stamina +5 |
| B | The substance, in slightly tangled order. | Cognitive clarity +8 |
| C | Fragments — I recognize everything they say but can't produce it myself. | Cognitive clarity -8; Flags: REVISION_COLLAPSER |
| D | Honestly, a week is enough for most of it to vanish without revision. | Cognitive clarity -5; Marathon consistency -5; Flags: REVISION_COLLAPSER |
| E | I'd deflect — explaining aloud exposes me, so I avoid it. | Mains stamina -8; Flags: ISOLATION |

## Level 6: The Emotional Core

> What results do to you.

Cards: 8 total; 5 in Free 40; 3 additional in Premium 60.

### L6-01 - Free 40 + Premium 60

**Question:** A mock result lands 30 marks below what you expected. Trace the next 48 hours honestly:

**Feeds:** Emotional vault | Recovery protocol | Warnings | Strengths and vulnerabilities | Mock-result recovery protocol

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Two hours of sting → error analysis that same night → adjusted plan by morning. | Recovery speed +18; Emotional volatility -5 |
| B | A dark evening, then back at the desk next day. | Recovery speed +10 |
| C | Two or three days of fog before I can look at the paper again. | Recovery speed -8; Emotional volatility +8 |
| D | I question the entire preparation, the dream, and myself. For a week. | Recovery speed -15; Emotional volatility +15 |
| E | I stopped taking mocks partly to avoid exactly this. | Recovery speed -10; Prelims nerve -8; Flags: MAINS_AVOIDER |

### L6-02 - Premium 60 only

**Question:** Result day. The PDF is out. How do you actually check?

**Feeds:** Emotional vault | Recovery protocol | Warnings | Strengths and vulnerabilities | Result-day regulation

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Open it myself, immediately, alone and steady. | Emotional volatility -8 |
| B | Open it myself after an hour of pacing. | Emotional volatility +5 |
| C | Someone else checks while I sit elsewhere, heart hammering. | Emotional volatility +12 |
| D | I delay for hours — sometimes a full day — until I'm "ready." | Emotional volatility +15 |
| E | I've learned my results from other people's condolence messages. | Emotional volatility +18 |

### L6-03 - Free 40 + Premium 60

**Question:** Your deepest preparation wound so far — the result or moment that cut worst. How healed is it, truly?

**Feeds:** Emotional vault | Recovery protocol | Warnings | Strengths and vulnerabilities | Deepest preparation wound

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Fully metabolized. It teaches now instead of bleeding. | Recovery speed +15 |
| B | Mostly healed. It aches in result season only. | Recovery speed +8 |
| C | Scarred over but I route around it — certain topics, certain dates. | Recovery speed -5 |
| D | Open. It sits in the room while I study. | Recovery speed -15; Emotional volatility +10 |
| E | No real wound yet — my journey is young. | Narrative evidence only; no numeric delta or routing override. |

### L6-04 - Free 40 + Premium 60

**Question:** A batchmate's name appears in this year's final list. The honest first feeling?

**Feeds:** Emotional vault | Recovery protocol | Warnings | Strengths and vulnerabilities | Comparison response

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Pure fuel — my turn is coming. | Recovery speed +15; Self-belief=high |
| B | Happy for them, hollow for me. | Identity fusion +10 |
| C | I avoided everyone for a week. | Emotional volatility +20; Flags: ISOLATION |
| D | Did the math on my remaining attempts. | Attempt pressure +12 |
| E | Felt nothing. That scared me more. | Identity fusion +10; Flags: GHOST_CANDIDATE, VETERAN_GHOST |

### L6-05 - Premium 60 only

**Question:** A relative at a function asks, "So beta, what do you do?" Your current answer:

**Feeds:** Emotional vault | Recovery protocol | Warnings | Strengths and vulnerabilities | Public identity and shame armour

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | I say it plainly — "I'm preparing for UPSC" — and hold their gaze. | Identity fusion +5; Anchor strength +5 |
| B | I say it with a joke attached, armor pre-installed. | Emotional volatility +5 |
| C | I mention a course/degree/job and leave UPSC out. | External pressure +8; Flags: ISOLATION |
| D | I avoid functions during preparation seasons entirely. | External pressure +10; Identity fusion +8; Flags: ISOLATION |
| E | My family answers for me before I can speak. That says everything. | External pressure +12 |

### L6-06 - Premium 60 only

**Question:** During result weeks — yours or the batch's — your screen time:

**Feeds:** Emotional vault | Recovery protocol | Warnings | Strengths and vulnerabilities | Result-week digital spiral

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Unchanged. I fence the noise out. | Distraction risk -8; Emotional volatility -5 |
| B | Rises — checking discussions, cutoffs, analysis threads. | Distraction risk +8; Emotional volatility +5 |
| C | Explodes — refresh loops, comparison spirals, 2 a.m. forums. | Distraction risk +18; Emotional volatility +12 |
| D | I go fully dark — uninstall everything until the storm passes. | Emotional volatility +10 |
| E | Result weeks cost me the following two study weeks. Every time. | Recovery speed -12; Distraction risk +10 |

### L6-07 - Free 40 + Premium 60

**Question:** Sit with this sentence: "My rank will decide what I am worth." Your truthful reaction:

**Feeds:** Emotional vault | Recovery protocol | Warnings | Strengths and vulnerabilities | Worth/rank separation

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | False. The exam measures preparation, not my worth. I actually believe this. | Identity fusion -15 |
| B | I know it's false. I don't always feel it's false. | Identity fusion +8 |
| C | On bad days, it is simply true. | Identity fusion +15 |
| D | It is true, and everyone pretending otherwise hasn't lived this. | Identity fusion +25; Flags: FUSION_WATCH |
| E | Reading that sentence made my chest tight. | Identity fusion +18; Emotional volatility +8; Flags: FUSION_WATCH |

### L6-08 - Free 40 + Premium 60

**Question:** Which thought has the most reliable key to the room you do not show people?

**Feeds:** Emotional vault | Recovery protocol | Warnings | Strengths and vulnerabilities | Primary emotional-vault trigger

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | "What if the years amount to nothing?" | Identity fusion +8; Emotional volatility +5 |
| B | "What if I disappoint the people who carried me?" | External pressure +8; Anchor strength +5 |
| C | "What if others move ahead and I remain here?" | Emotional volatility +8; Distraction risk +4 |
| D | "What if I am financially dependent for too long?" | External pressure +10 |
| E | "What if failure proves I was never as capable as I believed?" | Identity fusion +10; Emotional volatility +6 |
| F | "What if nobody really understands what this preparation is costing me?" | Emotional volatility +7; Recovery speed -3 |

## Level 7: The Anchor

> What holds you when nothing else does.

Cards: 9 total; 5 in Free 40; 4 additional in Premium 60.

### L7-01 - Free 40 + Premium 60

**Question:** On the worst day of this journey so far, what actually kept you in the fight?

**Feeds:** Anchor vault | Human/character anchors | Motivators | Comeback line | Worst-day return anchor

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | A person — their face ended the quitting thought. | Anchor strength +18 |
| B | A vow I made — to myself or someone — that I refuse to break. | Anchor strength +15; Purpose intensity +8 |
| C | The vision of the work itself — the officer I intend to be. | Anchor strength +12; Purpose intensity +10 |
| D | Inertia, honestly. Continuing was easier than deciding to stop. | Anchor strength -10; Identity fusion +8 |
| E | Nothing held me. I left for a while. | Anchor strength -8; Recovery speed +5 |

### L7-02 - Premium 60 only

**Question:** The reason you started and the reason you continue — are they still the same reason?

**Feeds:** Anchor vault | Human/character anchors | Motivators | Comeback line | Anchor evolution

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Same fire, now with deeper roots. | Anchor strength +12; Purpose intensity +8 |
| B | It evolved — the early reason matured into a truer one. | Anchor strength +10; Cognitive clarity +5 |
| C | The original reason faded. A newer, thinner one took its place. | Anchor strength -8 |
| D | I continue mostly because I've already come this far. | Anchor strength -12; Identity fusion +12; Flags: GHOST_CANDIDATE, VETERAN_GHOST |
| E | I've never audited this. The question itself is uncomfortable. | Purpose intensity -5 |

### L7-03 - Free 40 + Premium 60

**Question:** When the quitting thought visits — and it visits everyone — what kills it?

**Feeds:** Anchor vault | Human/character anchors | Motivators | Comeback line | Quitting-thought interrupt

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | My anchor appears, and the thought has no oxygen. | Anchor strength +18 |
| B | Logic — I re-derive why this path beats the alternatives. | Cognitive clarity +8; Anchor strength +8 |
| C | Fear of the "what will people say" aftermath. | External pressure +12; Anchor strength -5 |
| D | The sunk years. Quitting would mean they meant nothing. | Identity fusion +15; Anchor strength -8; Flags: GHOST_CANDIDATE, VETERAN_GHOST |
| E | It doesn't fully die anymore. It lives here now, quietly. | Anchor strength -12; Purpose intensity -8 |

### L7-04 - Free 40 + Premium 60

**Question:** Is there a person you cannot disappoint — whose face appears uninvited during low moments?

**Feeds:** Anchor vault | Human/character anchors | Motivators | Comeback line | Human anchor pressure/fuel

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Yes. They power me. The thought of their pride is fuel. | Anchor strength +15; Purpose=RESTORATION |
| B | Yes — and it's equal parts fuel and weight. | Anchor strength +10; External pressure +10 |
| C | Yes — and honestly, it's mostly weight now. | External pressure +18; Anchor strength -5 |
| D | No single person. My anchor is internal. | Anchor strength +8 |
| E | The person I can't disappoint is my younger self. | Anchor strength +12; Purpose intensity +8 |

### L7-05 - Premium 60 only

**Question:** Hold your anchor in your mind for five full seconds. What did holding it just create in your body?

**Feeds:** Anchor vault | Human/character anchors | Motivators | Comeback line | Embodied anchor effect

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Energy. A literal straightening of the spine. | Anchor strength +18 |
| B | Warmth and steadiness. Quiet fuel. | Anchor strength +12 |
| C | A complicated mix — love and pressure tangled together. | Anchor strength +5; External pressure +8 |
| D | Heaviness. The anchor has become cargo. | Anchor strength -10; External pressure +12 |
| E | Honestly — nothing. And I noticed the nothing. | Anchor strength -15; Flags: GHOST_CANDIDATE, VETERAN_GHOST |

### L7-06 - Free 40 + Premium 60

**Question:** When the fight becomes private, whose presence has the strongest claim on your courage?

**Feeds:** Anchor vault | Human/character anchors | Motivators | Comeback line | Human anchor relationship

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | My mother. | Anchor strength +12 |
| B | My father. | Anchor strength +12 |
| C | My parents or family as a whole; separating one person would be false. | Anchor strength +12 |
| D | My partner, sibling, or closest friend. | Anchor strength +10 |
| E | A teacher, mentor, or senior who saw something in me. | Anchor strength +10 |
| F | No single person. My strongest anchor is not human. | Anchor strength +5 |

### L7-07 - Premium 60 only

**Question:** What does that person or circle actually do inside your preparation?

**Feeds:** Anchor vault | Human/character anchors | Motivators | Comeback line | Human anchor emotional role

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Their sacrifice turns quitting into a debt I refuse to leave unpaid. | Anchor strength +12; External pressure +5 |
| B | They believed before there was evidence, and I protect that belief. | Anchor strength +14 |
| C | They calm my nervous system when the exam makes everything feel unstable. | Anchor strength +12; Recovery speed +5 |
| D | They hold me accountable and do not let my excuses become a lifestyle. | Anchor strength +10; Execution friction -4 |
| E | They represent the life and security I want to build after selection. | Anchor strength +10; Purpose intensity +5 |
| F | They are part of a memory or legacy I carry forward. | Anchor strength +12; Purpose intensity +5 |
| G | My anchor is not a person, so none of these is the closest truth. | Anchor strength +3 |

### L7-08 - Premium 60 only

**Question:** When you need to remember the kind of person this war is meant to build, which figure do you reach for?

**Feeds:** Anchor vault | Human/character anchors | Motivators | Comeback line | Character anchor

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | A constitutional public servant known for courage and administrative integrity. | Purpose intensity +7; Anchor strength +7 |
| B | A reformer or freedom fighter who accepted a long struggle. | Purpose intensity +7; Anchor strength +7 |
| C | A strategist, thinker, or historical leader whose discipline steadies me. | Cognitive clarity +5; Anchor strength +7 |
| D | A family elder whose character matters more to me than public fame. | Anchor strength +9 |
| E | A mentor, senior, or selected aspirant whose conduct feels attainable. | Anchor strength +7 |
| F | No borrowed figure. I work best from my own principles. | Cognitive clarity +5 |

### L7-09 - Free 40 + Premium 60

**Question:** If applause, comparison, and family expectations went silent for one year, what would still make you return to the desk?

**Feeds:** Anchor vault | Human/character anchors | Motivators | Comeback line | Deep motivator without external applause

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | The work itself: I want responsibility over problems that matter. | Purpose intensity +12; Purpose=SERVICE |
| B | Restoration: I want to change what is possible for my family. | Purpose intensity +10; Anchor strength +5; Purpose=RESTORATION |
| C | Proof: I need to know what my full capacity can do. | Purpose intensity +9; Purpose=PROOF |
| D | Freedom: the career would give me agency, security, and a larger life. | Purpose intensity +8; Purpose=ESCAPE |
| E | Mastery: becoming capable enough for this exam has meaning of its own. | Purpose intensity +9; Cognitive clarity +4 |
| F | Recognition: I want the authority and standing that selection brings. | Purpose intensity +7; Purpose=STATUS |
| G | A promise: something unfinished would remain unfinished if I walked away. | Purpose intensity +10; Anchor strength +8 |

## Level 8: The Mirror

> The bravest five minutes of this app.

Cards: 7 total; 5 in Free 40; 2 additional in Premium 60.

### L8-01 - Free 40 + Premium 60

**Question:** The naked question. Beneath strategy, beneath hope: do you believe you will clear this exam?

**Feeds:** Self-belief profile | Rules and laws | Operating profile | Strengths and vulnerabilities | Belief state

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Yes — and I can point to evidence: scores, growth, work done. | Purpose intensity +8; Self-belief=high |
| B | Yes — though if I'm honest, it's faith more than evidence. | Self-belief=volatile |
| C | I believed once. Results have been eroding it. | Recovery speed -8; Self-belief=low |
| D | I don't know — I've never been tested at this scale. | Self-belief=medium |
| E | Some weeks yes, some weeks no. Belief follows my last mock score. | Emotional volatility +12; Self-belief=volatile |

### L8-02 - Premium 60 only

**Question:** Wherever that belief stands — what is it actually built on?

**Feeds:** Self-belief profile | Rules and laws | Operating profile | Strengths and vulnerabilities | Belief evidence source

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Track record — I've done hard things before and this is the next one. | Recovery speed +8; Self-belief=high |
| B | Work evidence — my mock trajectory and answer growth are real. | Cognitive clarity +5; Self-belief=high |
| C | Other people's belief in me. They see something; I borrow it. | Anchor strength +5; Self-belief=volatile |
| D | Necessity — I believe because the alternative is unthinkable. | Identity fusion +12; External pressure +8 |
| E | Honestly examined: I'm not sure it's built on anything yet. | Self-belief=medium |

### L8-03 - Free 40 + Premium 60

**Question:** The last time you identified a real weakness in yourself — not a topic, a pattern — what happened in the following two weeks?

**Feeds:** Self-belief profile | Rules and laws | Operating profile | Strengths and vulnerabilities | Self-correction capacity

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | I built a counter-system and it largely worked. | Execution friction -12; Recovery speed +8 |
| B | I addressed it partially. Progress, not victory. | Execution friction -5 |
| C | I planned the fix beautifully. The plan is still waiting. | Execution friction +15; Flags: STRATEGY_CONSUMER |
| D | I noted it, felt bad, and changed nothing. | Execution friction +12 |
| E | I avoid the self-audit entirely. It costs too much morale. | Execution friction +10; Emotional volatility +8 |

### L8-04 - Premium 60 only

**Question:** In a moment, KAUTILYA will tell you things about yourself that may be uncomfortable. Your honest posture toward that:

**Feeds:** Self-belief profile | Rules and laws | Operating profile | Strengths and vulnerabilities | Feedback-readiness and stabilization tone

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Bring it. Accurate and harsh beats kind and useless. | Recovery speed +8; Purpose intensity +5 |
| B | Ready — as long as it comes with a repair path. | Cognitive clarity +5 |
| C | Nervous, but I'd rather know than not. | Narrative evidence only; no numeric delta or routing override. |
| D | I'll read it, defend against it internally, accept it three days later. | Execution friction +8 |
| E | If it's too dark, I may not come back to this app. Being honest. | Emotional volatility +12; Flags: FUSION_WATCH |

### L8-05 - Free 40 + Premium 60

**Question:** Does this journey have a walk-away line — a point where you'd choose a different life with pride?

**Feeds:** Self-belief profile | Rules and laws | Operating profile | Strengths and vulnerabilities | Walk-away law | Identity-fusion risk

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Yes — a defined attempt/age line, decided calmly, in writing. | Identity fusion -10; Self-belief=high |
| B | I refuse to think about it. | Identity fusion +20; Flags: FUSION_WATCH |
| C | My family's investment makes quitting impossible. | External pressure +20; Purpose=RESTORATION |
| D | This exam IS the plan. There is no other me. | Identity fusion +30; Flags: FUSION_WATCH |
| E | I had one. I crossed it already. | Identity fusion +15; Attempt pressure +10; Flags: GHOST_CANDIDATE, VETERAN_GHOST |

### L8-06 - Free 40 + Premium 60

**Question:** Which law, obeyed for the next 90 days, would protect you from your most predictable self-sabotage?

**Feeds:** Self-belief profile | Rules and laws | Operating profile | Strengths and vulnerabilities | Explicit 90-day personal law

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | One final source per subject; repetition outranks collection. | Resource chaos -8; Cognitive clarity +5 |
| B | A daily minimum survives even when the ideal schedule collapses. | Marathon consistency +6; Execution friction -4 |
| C | Testing and retrieval happen before I feel perfectly prepared. | Prelims nerve +5; Mains stamina +5; Execution friction -4 |
| D | Every week ends with evidence, review, and one corrected command. | Cognitive clarity +6; Marathon consistency +5 |
| E | A bad result earns analysis and recovery, never disappearance. | Recovery speed +7; Emotional volatility -3 |
| F | Plans are written from available hours and energy, not fantasy. | Cognitive clarity +6; Execution friction -4 |
| G | I know my weakness, but I have not yet chosen the law that governs it. | Execution friction +5 |

### L8-07 - Free 40 + Premium 60

**Question:** Under real pressure, which operating rhythm produces your best work most consistently?

**Feeds:** Self-belief profile | Rules and laws | Operating profile | Strengths and vulnerabilities | Natural operating rhythm

| Option | Answer | Silent mapping |
| --- | --- | --- |
| A | Quiet repetition: stable hours, fixed sources, low drama. | Marathon consistency +7; Resource chaos -4 |
| B | Structured sprints: intense blocks followed by deliberate recovery. | Recovery speed +5; Marathon consistency +4 |
| C | Deadline command: clear tests and public dates sharpen me. | Execution friction -4; Mains stamina +4 |
| D | Human accountability: I execute better when someone expects evidence. | Execution friction -4; Anchor strength +4 |
| E | Protected solitude: deep work improves when messages and comparison disappear. | Distraction risk -5; Cognitive clarity +4 |
| F | Energy-aware adaptation: I need different tasks for high- and low-energy windows. | Cognitive clarity +5; Recovery speed +4 |
| G | I keep borrowing rhythms from others and have not found my own. | Execution friction +5; Cognitive clarity -4 |

## Audit Notes

- All 60 cards are multiple choice.
- Free 40 is curated across all eight levels, not the first 40 in sequence.
- Premium 60 contains every Free 40 card plus 20 deeper-context cards.
- Original 50-card content is fingerprint-protected by automated tests.
- Raw silent scores are not displayed to aspirants.
