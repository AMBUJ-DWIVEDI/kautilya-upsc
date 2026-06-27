# KAUTILYA Command And Community Design

Date: 2026-06-27
Status: Approved design

## Objective

Extend KAUTILYA IAS into a complete authenticated civil-services command system while rebuilding the public landing page as a premium institutional command brief.

The product must remain diagnosis-first and command-first. It must not resemble a coaching dashboard, social feed, task manager, or motivation product.

## Product Structure

The authenticated product has four connected centers:

1. Command converts diagnosis and preparation signals into weekly and daily action.
2. Anchor preserves the private human context behind the attempt.
3. Leaderboard creates calibrated peer pressure through a transparent composite rank.
4. Forum supports focused, moderated problem-solving among aspirants.

The public landing page explains this real mechanism and helps each target aspirant recognize their preparation pattern.

## Visual System

Continue the existing KAUTILYA identity:

- warm ivory and paper surfaces
- deep navy typography
- bronze accents and seal motifs
- restrained borders and document shadows
- editorial spacing and institutional hierarchy
- composed motion with reduced-motion support

Avoid bright coaching colors, generic SaaS gradients, motivational spectacle, nested cards, and feed-like visual noise.

## Public Landing Page

Route: `/`

The landing page follows the supplied KAUTILYA master brief:

1. Hero: "The syllabus is visible. The real enemy is hidden."
2. Preparation problem and authority collapse.
3. Why KAUTILYA exists.
4. Aspirant profile index.
5. From chaos to command workflow.
6. Product previews grounded in real routes.
7. "Integration, not expansion" belief section.
8. Early access or diagnosis conversion.
9. Final command CTA.

The page must describe actual product capabilities. Primary actions lead to diagnosis or authenticated entry. Profile-specific offers lead to the most relevant diagnosis or audit entry point.

### Aspirant Profile Index

Desktop uses a compact profile rail with one expanded dossier. Mobile uses stacked disclosure rows. Each profile includes who they are, inner sentence, seen language, needed command, converting offer, and market blind spot.

1. **The Fragmented Maximalist**
   - Seen language: too many sources are fighting for authority.
   - Needs: source reduction, final-source declaration, revision hierarchy, weekly command, and resource chaos map.
   - Offer: Free Resource Chaos Audit.

2. **The Prelims Wall Aspirant**
   - Seen language: knowledge is present, but judgment is losing between two options.
   - Needs: elimination discipline, risk calibration, trap diagnosis, revision confidence, and micro-drills.
   - Offer: Prelims Nerve Diagnosis.

3. **The Mains Plateau Writer**
   - Seen language: knowledge is present; answer architecture is missing.
   - Needs: structure, dimension mapping, examples, disciplined answer flow, value addition, and feedback.
   - Offer: Mains Answer Architecture Audit.

4. **The Veteran Ghost**
   - Seen language: the years have made the exam part of the aspirant's identity; the next phase needs command, not panic.
   - Needs: attempt-stage diagnosis, identity separation, a 30-day evaluation window, source reduction, and emotional stabilization.
   - Offer: Long-War Diagnosis for Veterans.

5. **The Working Professional Splitter**
   - Seen language: limited energy needs protection, not a borrowed 12-hour timetable.
   - Needs: a minimal source plan, weekly command, energy-aware scheduling, micro-integration, and limited-time answer writing.
   - Offer: Limited-Time UPSC Command Plan.

6. **The First-Flight Idealist**
   - Seen language: idealism is not the problem; making every source urgent is the first danger.
   - Needs: source discipline, starter map, reality check, and a first 90-day command.
   - Offer: First 90-Day Long-War Map.

7. **The Mentorless Navigator**
   - Seen language: the aspirant is not unserious; they have been forced to make every strategic decision alone.
   - Needs: a minimum viable source stack, trusted notes, baseline tests, sequence, and decision support.
   - Offer: Solo Aspirant Starter Command.

8. **The Small-Town Solo Aspirant**
   - Seen language: a pin code should not decide the quality of command available.
   - Needs: low-bandwidth access, affordable source authority, trusted peer rooms, test access, and language-aware guidance.
   - Offer: Small-Town Command Access.

9. **The Inconsistent Fighter**
   - Seen language: the answer is not a harsher timetable; it is a system that notices the break and makes return small enough.
   - Needs: recovery logic, minimum valid days, restart commands, rhythm tracking, and shame-free recalibration.
   - Offer: Recovery Rhythm Diagnosis.

10. **The Optional Drifter**
    - Seen language: the optional may not be wrong; the aspirant's relationship with it is unstable.
    - Needs: optional audit, source finalization, answer-writing rhythm, and a topic confidence map.
    - Offer: Optional Stability Audit.

## Command

Primary route: `/kautilya/command`

The page hierarchy is:

1. Long-War Signal
2. This Week's Command
3. Today's Command
4. Do More / Do Less
5. Source Authority Decision
6. Prelims, Mains, Current Affairs, Optional, and Revision commands
7. Recovery or pressure note
8. Hold to Seal
9. Review and history

The active command is derived from diagnosis, resource, mock, writing, integration, optional, and missed-day signals. It is persisted in `kautilya_commands`; reviews are persisted in `kautilya_command_reviews`.

The current mock-only command shell must be connected to authenticated data. When required signals are missing, show a calm empty state with a direct path to diagnosis or the relevant baseline action.

## Anchor

Route: `/anchor`

Anchor is a private authenticated dossier, not a public profile or motivational page.

It contains:

- latest aspirant diagnosis report
- operating profile
- extracted emotional vault
- family and friends anchor points
- character and role-model anchor points
- cognitive archetype
- target score, target rank, and target post
- personal rules and laws
- relevant command and review history

All Anchor fields are read-only snapshots derived from diagnosis cards and report generation. A dedicated `kautilya_anchor_profiles` table stores normalized generated Anchor data; authenticated users can read only their own dossier, while trusted server generation writes it.

## Leaderboard

Route: `/leaderboard`

The leaderboard uses a transparent KAUTILYA composite rank:

- mock performance: 30%
- command consistency: 25%
- integration: 20%
- answer-writing execution: 15%
- recovery discipline: 10%

Each factor is normalized to a 0-100 score before weighting. The interface shows the factor breakdown, current-user position, and time-period filters.

Users choose a privacy-safe display name and can opt out of public listing. An opted-out user can still see their private rank and factor breakdown. Public data is served through a restricted view or server-side query that never exposes email, user ID, diagnosis content, or private Anchor data.

The board is for pressure calibration, not vanity. Empty and low-data states explain which baseline actions are needed before rank quality becomes meaningful.

## Discussion Forum

Route: `/forum`

The forum is an authenticated civil-services common room organized around command problems:

- Weekly Command Brief
- Resource Audit
- Prelims Nerve
- Mains Answer Architecture
- Current Affairs Integration
- Optional Stability
- Recovery Desk

Required interactions:

- list and filter rooms and threads
- create a thread
- open a thread
- post replies
- delete one's own thread or reply
- report a thread or reply
- admin or moderator hide and restore

Forum persistence uses rooms, threads, replies, and reports tables. Auth and authorization are re-checked on the server. Inputs are validated with Zod and constrained by length and rate limits. Hidden or deleted content does not remain visible to normal users.

The first version does not include direct messaging, follower counts, reactions, or algorithmic ranking.

## Shared Shell

The authenticated shell exposes Command, Anchor, Leaderboard, and Forum as first-class navigation items. Command remains the primary destination.

The command palette and route briefs use the same central shell configuration. Desktop and mobile navigation must remain route-aware, keyboard accessible, and visually consistent.

## Data And Security

New migrations add:

- `kautilya_anchor_profiles`
- leaderboard preferences and a restricted composite-rank view or function
- `kautilya_forum_rooms`
- `kautilya_forum_threads`
- `kautilya_forum_replies`
- `kautilya_forum_reports`

All private tables use row-level security. Public leaderboard reads expose only approved display fields. Forum writes require authentication. Moderator actions require a server-side admin check.

No service-role client is exposed to the browser. Server Actions or route handlers validate all mutable inputs and return structured errors.

## Failure States

- Missing diagnosis: route to diagnosis without fabricating an Anchor or Command.
- Sparse ranking data: show provisional factor coverage and baseline actions.
- Empty forum room: provide a focused create-thread action.
- Failed mutation: preserve the user's text and show an actionable error.
- Unauthorized mutation: return a neutral forbidden state and do not leak row existence.
- Database migration absent: fail visibly in development and use a composed unavailable state in production.

## Analytics

Track landing profile selection and offer clicks, Anchor views and edits, leaderboard views and period changes, forum thread/reply/report actions, and command generation, sealing, completion, and review.

Analytics payloads must not contain private diagnosis text, emotional anchor content, forum drafts, email addresses, or other personal content.

## Accessibility And Responsiveness

- semantic heading order and landmark regions
- complete keyboard access
- visible focus states
- explicit form labels and error associations
- readable contrast
- no hover-only controls
- reduced-motion support
- stable layouts at mobile and desktop widths
- long text wraps without covering adjacent content

## Testing

Unit tests cover:

- command derivation
- composite score normalization and weighting
- leaderboard visibility rules
- Anchor extraction and editable/read-only boundaries
- forum validation and authorization helpers
- landing profile configuration

Integration coverage exercises:

- authenticated Anchor read and edit
- private and public leaderboard states
- create thread, reply, report, delete, hide, and restore
- command load, seal, and review

Final verification includes typecheck, focused tests, production build, lint triage, and browser checks for the landing page plus all four authenticated centers at desktop and mobile widths.

## Scope Boundaries

This implementation does not add direct messages, social following, likes, gamified badges, live chat, AI moderation, or public Anchor profiles. It does not modify unrelated CHANAKYA, HAVEN, or BASTION projects.
