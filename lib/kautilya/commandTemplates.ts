import type { KautilyaCommand, KautilyaCommandType } from './commandTypes'

type Template = Omit<
  KautilyaCommand,
  'id' | 'userId' | 'type' | 'status' | 'window' | 'createdAt' | 'updatedAt'
>

export const kautilyaCommandTemplates: Record<KautilyaCommandType, Template> = {
  weekly: {
    title: 'Integration, Not Expansion',
    seenText:
      'You are not behind because you know too little. You are behind because too many sources are still allowed to speak.',
    longWarSignal: 'Integration debt is destabilizing the week.',
    primaryLeak: 'Open-front expansion',
    command:
      'Freeze expansion for seven days. Revise declared sources, write one answer daily, and link current affairs to static ground.',
    doMore: [
      'Revise final sources',
      'Write one answer daily',
      'Link current affairs to static topics',
    ],
    doLess: [
      'Do not open new PDFs',
      'Do not change the booklist',
      'Do not watch another strategy video',
    ],
    focusAreas: {
      prelims: 'Thirty statement questions from one static block.',
      mains: 'One GS answer before additional reading.',
      currentAffairs: 'One issue mapped to static, prelims, mains, essay, and interview.',
      revision: 'One final source revised twice before any new input.',
    },
    avoidToday: 'Do not expand the source pile.',
    whyThisMatters:
      'UPSC rewards arranged recall and judgement, not possession of more material.',
  },
  daily: {
    title: 'Close One Source Loop',
    seenText:
      'The day does not need a new plan. It needs one open loop closed with authority.',
    longWarSignal: 'The daily front is vulnerable to switching.',
    primaryLeak: 'Execution scattering',
    command:
      'Take one subject source and mark it Final, Secondary, Parked, or Dead. Revise only the Final source today.',
    doMore: ['Close one loop', 'Write after reading', 'Log the leak'],
    doLess: ['Do not restart the timetable', 'Do not compare with another plan'],
    focusAreas: {
      revision: 'One source, one closed loop, one recall block.',
    },
    avoidToday: 'Do not redesign the week.',
    whyThisMatters:
      'A civil-services day is won by closure, not by a larger list of intentions.',
  },
  source_reduction: {
    title: 'Declare Source Authority',
    seenText:
      'You are not behind because you know too little. You are behind because too many sources are fighting for authority inside your head.',
    longWarSignal: 'Resource chaos is destabilizing revision.',
    primaryLeak: 'Source authority collapse',
    command:
      'Mark active sources as Final, Secondary, Parked, or Dead. Revise only the Final source today.',
    doMore: ['Revise declared final sources', 'Close open source loops', 'Reduce active material'],
    doLess: ['Do not open new PDFs', 'Do not change booklist today', 'Do not watch strategy videos'],
    focusAreas: {
      prelims: 'One final static source becomes the question base.',
      mains: 'One answer must use only the final source.',
      currentAffairs: 'No new current affairs source today.',
      revision: 'Park everything that cannot be revised this week.',
    },
    avoidToday: 'Do not add another source.',
    whyThisMatters:
      'UPSC does not reward possession of material. It rewards recall and judgment under pressure.',
  },
  prelims: {
    title: 'Repair Prelims Judgement',
    seenText:
      'You do not lack knowledge. You are losing judgement between two options.',
    longWarSignal: 'Prelims nerve is distorting elimination.',
    primaryLeak: 'Option attraction error',
    command:
      'Solve 30 statement-based questions. For every wrong answer, write why the wrong option attracted you.',
    doMore: ['Solve statement questions', 'Record attraction errors', 'Revise traps'],
    doLess: ['Do not chase a new test pack', 'Do not skip post-test analysis'],
    focusAreas: {
      prelims: 'Thirty questions, every wrong attraction named.',
      revision: 'Revise only the trap that produced the wrong option.',
    },
    avoidToday: 'Do not take an unanalyzed mock.',
    whyThisMatters:
      'Prelims punishes unstable judgement more than it punishes missing facts.',
  },
  mains: {
    title: 'Repair Answer Architecture',
    seenText:
      'Your knowledge is present. It is arriving without architecture.',
    longWarSignal: 'Mains output is not matching input.',
    primaryLeak: 'Answer structure weakness',
    command:
      'Write one GS answer using intro, three dimensions, one example, and way forward. Do not read more before writing.',
    doMore: ['Write one answer', 'Use fixed structure', 'Review missing dimensions'],
    doLess: ['Do not consume more notes before writing', 'Do not compare with topper copies first'],
    focusAreas: {
      mains: 'One answer with intro, three dimensions, example, and way forward.',
      currentAffairs: 'Add one live issue only after the answer skeleton exists.',
    },
    avoidToday: 'Do not read before producing one answer.',
    whyThisMatters:
      'Mains rewards arranged knowledge, not stored knowledge.',
  },
  current_affairs: {
    title: 'Integrate Current Affairs',
    seenText:
      'Your current affairs are not weak. They are disconnected from the static map.',
    longWarSignal: 'Current affairs is floating without exam hooks.',
    primaryLeak: 'Issue integration gap',
    command:
      'Take one current issue and link it to static topic, Prelims fact, Mains dimension, essay hook, and interview angle.',
    doMore: ['Map one issue deeply', 'Attach static ground', 'Create one Mains hook'],
    doLess: ['Do not skim five issues', 'Do not save a thread without integration'],
    focusAreas: {
      currentAffairs: 'One issue, five exam hooks.',
      mains: 'Use the issue inside one answer framework.',
    },
    avoidToday: 'Do not collect disconnected current affairs.',
    whyThisMatters:
      'Current affairs converts only when it can enter Prelims judgement and Mains structure.',
  },
  optional: {
    title: 'Stabilize Optional',
    seenText:
      'The optional subject cannot remain a side room. It must hold a fixed weekly seat.',
    longWarSignal: 'Optional instability is eating the main plan.',
    primaryLeak: 'Optional drift',
    command:
      'Lock one optional slot this week. Revise one core topic and write one short answer from it.',
    doMore: ['Protect optional time', 'Revise core topic', 'Write one optional answer'],
    doLess: ['Do not postpone optional to Sunday', 'Do not read without output'],
    focusAreas: {
      optional: 'One protected optional slot with written output.',
    },
    avoidToday: 'Do not treat optional as leftover time.',
    whyThisMatters:
      'Optional marks come from protected repetition, not emergency reading.',
  },
  recovery: {
    title: 'Return Without Redesign',
    seenText:
      'You did not lose the war today. You lost rhythm.',
    longWarSignal: 'Attempt fatigue is pushing the mind toward redesign.',
    primaryLeak: 'Recovery delay',
    command:
      'Do not redesign the entire plan tonight. Complete one 25-minute revision block. Then log the leak.',
    doMore: ['One revision block', 'One short log', 'Sleep without redesign'],
    doLess: ['Do not punish the week', 'Do not rebuild the timetable at night'],
    focusAreas: {
      revision: 'Twenty-five minutes, one known topic, no expansion.',
    },
    avoidToday: 'Do not make a lifetime decision after a missed day.',
    whyThisMatters:
      'Recovery speed protects long-war continuity better than shame or heroic resets.',
  },
  revision: {
    title: 'Recover Recall Authority',
    seenText:
      'Reading again is not revision. Proving recall is revision.',
    longWarSignal: 'Recall is weaker than exposure.',
    primaryLeak: 'Passive rereading',
    command:
      'Close the book and recall ten points from one finished topic. Then reopen only to repair the missing points.',
    doMore: ['Active recall', 'Gap repair', 'Second recall'],
    doLess: ['Do not reread passively', 'Do not highlight without testing'],
    focusAreas: {
      revision: 'Ten-point recall before rereading.',
    },
    avoidToday: 'Do not call exposure revision.',
    whyThisMatters:
      'The exam tests retrievable knowledge, not familiar pages.',
  },
}

export function createMockKautilyaCommand(type: KautilyaCommandType = 'source_reduction'): KautilyaCommand {
  const now = new Date().toISOString()
  const template = kautilyaCommandTemplates[type]

  return {
    id: `mock-${type}`,
    userId: 'demo-user',
    type,
    status: 'active',
    window: type === 'daily' ? 'today' : 'this_week',
    createdAt: now,
    updatedAt: now,
    ...template,
  }
}
