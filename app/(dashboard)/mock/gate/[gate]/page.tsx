import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { readFileSync } from 'fs'
import { join } from 'path'
import TestEngine from './TestEngine'
import type { PrelimsQuestion, ClientQuestion } from '@/lib/mock/types'
import { bankFileForGate, getMockCatalogItem, type MockCatalogItem } from '@/lib/mock/catalog'
import { canAccessPlan } from '@/lib/plans'

interface Props {
  params: Promise<{ gate: string }>
}

export default async function MockGatePage({ params }: Props) {
  const { gate: gateStr } = await params
  const gate = parseInt(gateStr, 10)
  const staticMeta = getMockCatalogItem(gate)

  if (isNaN(gate) || !staticMeta) redirect('/mock')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  if (!canAccessPlan(userData?.plan_type, staticMeta.unlock_plan)) {
    redirect('/upgrade?reason=mock')
  }

  const { data: mockTest } = await supabase
    .from('mock_tests')
    .select('id, gate_number, title, test_type, section, duration_mins, total_questions, max_score, is_baseline, unlock_plan, topic_tags')
    .eq('gate_number', gate)
    .single()

  const testMeta: MockCatalogItem = mockTest
    ? {
        gate_number: mockTest.gate_number,
        title: mockTest.title,
        test_type: mockTest.test_type,
        section: mockTest.section,
        duration_mins: mockTest.duration_mins,
        total_questions: mockTest.total_questions,
        max_score: mockTest.max_score,
        is_baseline: mockTest.is_baseline,
        unlock_plan: mockTest.unlock_plan,
        topic_tags: mockTest.topic_tags ?? [],
      } as MockCatalogItem
    : staticMeta

  if (mockTest) {
    const { data: existingAttempt } = await supabase
      .from('test_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('mock_test_id', mockTest.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    if (existingAttempt) {
      redirect(`/mock/gate/${gate}/result/${existingAttempt.id}`)
    }
  }

  let questions: PrelimsQuestion[] = []
  try {
    const filePath = join(process.cwd(), 'data', 'question-bank', bankFileForGate(gate))
    const raw = readFileSync(filePath, 'utf-8')
    const bank = JSON.parse(raw) as { questions: PrelimsQuestion[] }
    questions = bank.questions
  } catch {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-inkdim">
        <div className="max-w-md text-center">
          <p className="mb-2 text-clay">The bank for Paper {gate} is still being inked.</p>
          <p className="text-sm">This paper is in the catalog. Upload its bank file to activate it.</p>
          <a href="/mock" className="mt-4 inline-block text-sm text-copper hover:underline">
            Back to the Paper Library
          </a>
        </div>
      </div>
    )
  }

  const clientQuestions: ClientQuestion[] = questions.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ answer, explanation, elimination_path, ...q }) => q,
  )

  return <TestEngine gate={gate} questions={clientQuestions} testMeta={testMeta} />
}
