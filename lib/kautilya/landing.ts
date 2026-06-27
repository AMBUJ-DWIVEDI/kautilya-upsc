export interface KautilyaProfile {
  id: string
  name: string
  whoTheyAre: string
  innerSentence: string
  seenLanguage: string
  needs: string[]
  offer: { label: string; href: string }
  marketBlindSpot: string
}

export const KAUTILYA_LANDING_SECTIONS = [
  { id: 'problem', label: 'The hidden front' },
  { id: 'why', label: 'Why KAUTILYA' },
  { id: 'profiles', label: 'Who it serves' },
  { id: 'system', label: 'The command system' },
  { id: 'preview', label: 'Product preview' },
  { id: 'belief', label: 'Integration law' },
  { id: 'access', label: 'Early access' },
] as const

export const KAUTILYA_PROFILES: KautilyaProfile[] = [
  {
    id: 'fragmented-maximalist',
    name: 'The Fragmented Maximalist',
    whoTheyAre: 'Too many sources, PDFs, notes, compilations, current-affairs files, and borrowed strategies. Not lazy. Overloaded.',
    innerSentence: 'Maybe the next source will finally complete my preparation.',
    seenLanguage: 'You are not behind because you know too little. Too many sources are fighting for authority inside your head.',
    needs: ['Source reduction', 'Final-source declaration', 'Revision hierarchy', 'Weekly command', 'Resource chaos map'],
    offer: { label: 'Free Resource Chaos Audit', href: '/login' },
    marketBlindSpot: 'Most products profit from adding one more source. KAUTILYA helps remove.',
  },
  {
    id: 'prelims-wall',
    name: 'The Prelims Wall Aspirant',
    whoTheyAre: 'Knows the content, yet repeatedly gets trapped between two plausible options.',
    innerSentence: 'I know things, but the options confuse me.',
    seenLanguage: 'You do not lack knowledge. You are losing the war between two options.',
    needs: ['Elimination discipline', 'Risk calibration', 'Statement-trap diagnosis', 'Revision confidence', 'Micro-drills'],
    offer: { label: 'Prelims Nerve Diagnosis', href: '/login' },
    marketBlindSpot: 'More tests do not explain why the attractive wrong option keeps winning.',
  },
  {
    id: 'mains-plateau',
    name: 'The Mains Plateau Writer',
    whoTheyAre: 'Reads deeply and understands issues, but cannot convert knowledge into strong answer copies.',
    innerSentence: 'I know the topic, but my answer feels ordinary.',
    seenLanguage: 'Your knowledge is present. Your answer architecture is missing.',
    needs: ['Answer structure', 'Dimension mapping', 'Examples', 'Disciplined answer flow', 'Feedback loop'],
    offer: { label: 'Mains Answer Architecture Audit', href: '/login' },
    marketBlindSpot: 'Model answers display the destination without rebuilding answer thinking.',
  },
  {
    id: 'veteran-ghost',
    name: 'The Veteran Ghost',
    whoTheyAre: 'Multiple attempts, deep knowledge, and an exhausted identity fused to the examination.',
    innerSentence: 'I cannot imagine leaving UPSC. I cannot imagine continuing like this.',
    seenLanguage: 'You have not wasted years. But the years have made the exam part of your identity. The war needs command, not panic.',
    needs: ['Attempt-stage diagnosis', 'Identity separation', '30-day evaluation window', 'Source reduction', 'Emotional stabilization'],
    offer: { label: 'Long-War Diagnosis for Veterans', href: '/login' },
    marketBlindSpot: 'Beginner content does not address the grief and pressure carried across attempts.',
  },
  {
    id: 'working-professional',
    name: 'The Working Professional Splitter',
    whoTheyAre: 'Balances work or college with limited hours, high guilt, and plans designed for full-time aspirants.',
    innerSentence: 'I am serious, but my day does not look like a full-time aspirant day.',
    seenLanguage: 'You do not need a 12-hour plan. You need a command system that protects limited energy.',
    needs: ['Minimal source plan', 'Weekly command', 'Energy-aware scheduling', 'Micro-integration', 'Limited-time answer writing'],
    offer: { label: 'Limited-Time UPSC Command Plan', href: '/login' },
    marketBlindSpot: 'Most schedules assume preparation has the whole day.',
  },
  {
    id: 'first-flight',
    name: 'The First-Flight Idealist',
    whoTheyAre: 'New, service-driven, and vulnerable to making every source urgent before a stable foundation exists.',
    innerSentence: 'I want to do this right, but I do not know where to begin.',
    seenLanguage: 'Your idealism is not the problem. Your first danger is letting every source become urgent.',
    needs: ['Source discipline', 'Starter map', 'UPSC reality check', 'First 90-day command'],
    offer: { label: 'First 90-Day Long-War Map', href: '/login' },
    marketBlindSpot: 'Early enthusiasm is often monetized before source discipline is built.',
  },
  {
    id: 'mentorless-navigator',
    name: 'The Mentorless Navigator',
    whoTheyAre: 'Lacks reliable notes, tests, sequence, and a trusted person to resolve strategic decisions.',
    innerSentence: 'I am preparing alone, and every decision feels expensive.',
    seenLanguage: 'You are not directionless because you lack seriousness. You have been forced to make every strategic decision alone.',
    needs: ['Minimum viable source stack', 'Trusted notes', 'Baseline tests', 'Study sequence', 'Decision support'],
    offer: { label: 'Solo Aspirant Starter Command', href: '/login' },
    marketBlindSpot: 'Content libraries assume the aspirant already knows what deserves authority.',
  },
  {
    id: 'small-town-solo',
    name: 'The Small-Town Solo Aspirant',
    whoTheyAre: 'Prepares beyond the coaching hubs with weaker access, thinner peer networks, and tighter budgets.',
    innerSentence: 'My location should not decide the quality of my preparation.',
    seenLanguage: 'Your pin code should not decide the quality of command available to you.',
    needs: ['Low-bandwidth access', 'Affordable source authority', 'Trusted peer rooms', 'Test access', 'Language-aware guidance'],
    offer: { label: 'Small-Town Command Access', href: '/login' },
    marketBlindSpot: 'Access is treated as equal even when infrastructure and guidance are not.',
  },
  {
    id: 'inconsistent-fighter',
    name: 'The Inconsistent Fighter',
    whoTheyAre: 'Works in intense bursts, then loses days and returns through guilt instead of a recovery protocol.',
    innerSentence: 'I can work hard. I cannot keep the rhythm alive.',
    seenLanguage: 'You do not need a harsher timetable. You need a system that notices the break and makes return small enough.',
    needs: ['Recovery logic', 'Minimum valid days', 'Restart commands', 'Rhythm tracking', 'Shame-free recalibration'],
    offer: { label: 'Recovery Rhythm Diagnosis', href: '/login' },
    marketBlindSpot: 'Discipline advice rarely designs the return after a broken week.',
  },
  {
    id: 'optional-drifter',
    name: 'The Optional Drifter',
    whoTheyAre: 'Keeps doubting the optional, changing strategy, stopping, restarting, and comparing with other subjects.',
    innerSentence: 'Maybe I chose the wrong optional.',
    seenLanguage: 'Your optional may not be wrong. Your relationship with it is unstable.',
    needs: ['Optional audit', 'Source finalization', 'Answer-writing rhythm', 'Topic confidence map'],
    offer: { label: 'Optional Stability Audit', href: '/login' },
    marketBlindSpot: 'Optional advice compares subjects without measuring the aspirant relationship with one.',
  },
]
