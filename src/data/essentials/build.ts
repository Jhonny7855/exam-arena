import type { Difficulty, Question, QuestionType, SubjectId, UnitId } from '../../types'
import { rngFrom, shuffle } from '../../lib/rng'

export interface EssentialsSeed {
  u: UnitId
  t: string
  d: Difficulty
  q: string
  o: [string, string, string, string]
  e: string
  x: [string, string, string, string]
  ty?: QuestionType
  hint?: string
}

export function buildEssentials(subject: SubjectId, seeds: readonly EssentialsSeed[]): Question[] {
  const prefix = subject.toUpperCase()
  return seeds.map((seed, index) => {
    const rng = rngFrom(`ess-${subject}-${index}-${seed.q.slice(0, 16)}`)
    const entries = shuffle(
      rng,
      seed.o.map((text, i) => ({ text, why: seed.x[i], ok: i === 0 })),
    )
    const correctAnswer = entries.findIndex((e) => e.ok) as 0 | 1 | 2 | 3
    return {
      id: `${prefix}-ESS-${String(index + 1).padStart(3, '0')}`,
      subject,
      unit: seed.u,
      topic: seed.t,
      subtopic: seed.t,
      difficulty: seed.d,
      type: seed.ty ?? 'Conceptual',
      question: seed.q,
      options: entries.map((e) => e.text) as [string, string, string, string],
      correctAnswer,
      explanation: seed.e,
      optionExplanations: entries.map((e) => e.why) as [string, string, string, string],
      hint: seed.hint ?? '',
      tags: [seed.t],
      estimatedSeconds: 60,
    }
  })
}

export function validateEssentials(questions: readonly Question[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const q of questions) {
    if (seen.has(q.id)) problems.push(`${q.id}: duplicate id`)
    seen.add(q.id)
    if (q.question.length < 8) problems.push(`${q.id}: question too short`)
    if (q.options.length !== 4) problems.push(`${q.id}: needs four options`)
    if (new Set(q.options.map((o) => o.trim())).size !== 4) problems.push(`${q.id}: duplicate options`)
    if (q.options.some((o) => !o.trim())) problems.push(`${q.id}: empty option`)
    if (q.correctAnswer < 0 || q.correctAnswer > 3) problems.push(`${q.id}: answer index out of range`)
    if (q.explanation.length < 40) problems.push(`${q.id}: explanation too short`)
    if (q.optionExplanations.length !== 4) problems.push(`${q.id}: wrong option explanation count`)
    if (q.optionExplanations.some((e) => !e || e.length < 10)) problems.push(`${q.id}: shallow option explanation`)
    if (!q.topic) problems.push(`${q.id}: missing topic`)
  }
  return problems
}
