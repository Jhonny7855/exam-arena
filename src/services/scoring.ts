import type { AnswerRecord, Attempt, ExamMode, Question, ScoredAttempt, SubjectId, UnitId } from '../types'

export interface SubmitInput {
  subject: SubjectId
  testId: string
  testName: string
  mode: ExamMode
  questions: Question[]
  answers: Record<string, { selected: number | null; marked: boolean; visited: boolean; timeMs: number }>
  startedAt: number
  submittedAt: number
}

export function scoreAttempt(input: SubmitInput): ScoredAttempt {
  let correct = 0
  let incorrect = 0
  let unanswered = 0
  const perQuestion: ScoredAttempt['perQuestion'] = []

  for (const q of input.questions) {
    const a = input.answers[q.id]
    const selected = a?.selected ?? null
    if (selected === null || selected === undefined) {
      unanswered += 1
      perQuestion.push({ questionId: q.id, selected: null, correct: false, answered: false })
      continue
    }
    const isCorrect = selected === q.correctAnswer
    if (isCorrect) correct += 1
    else incorrect += 1
    perQuestion.push({ questionId: q.id, selected, correct: isCorrect, answered: true })
  }

  const total = input.questions.length
  const score = correct
  const percentage = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0

  return { score, correct, incorrect, unanswered, percentage, perQuestion }
}

export function toAttempt(input: SubmitInput, scored: ScoredAttempt): Attempt {
  const answers: AnswerRecord[] = input.questions.map((q) => {
    const a = input.answers[q.id]
    return {
      questionId: q.id,
      selected: a?.selected ?? null,
      marked: a?.marked ?? false,
      visited: a?.visited ?? false,
      timeMs: a?.timeMs ?? 0,
    }
  })

  const units = [...new Set(input.questions.map((q) => q.unit))].sort() as UnitId[]

  return {
    id: `A${input.submittedAt}-${Math.random().toString(36).slice(2, 7)}`,
    subject: input.subject,
    testId: input.testId,
    testName: input.testName,
    mode: input.mode,
    startedAt: input.startedAt,
    submittedAt: input.submittedAt,
    durationMs: Math.max(0, input.submittedAt - input.startedAt),
    total: input.questions.length,
    score: scored.score,
    correct: scored.correct,
    incorrect: scored.incorrect,
    unanswered: scored.unanswered,
    percentage: scored.percentage,
    answers,
    units,
    questionIds: input.questions.map((q) => q.id),
  }
}

export type ScoreBand = {
  label: string
  tone: 'critical' | 'weak' | 'developing' | 'strong' | 'mastered'
  message: string
}

export function classifyScore(marks: number): ScoreBand {
  if (marks <= 10) {
    return {
      label: 'Needs Improvement',
      tone: 'critical',
      message: 'The fundamentals need another pass. Start with Unit 1 and 2 practice, then return to this stage.',
    }
  }
  if (marks <= 17) {
    return {
      label: 'Developing',
      tone: 'weak',
      message: 'Core ideas are landing but conversions and tracing are costing marks. Target your weakest unit next.',
    }
  }
  if (marks <= 23) {
    return {
      label: 'Good',
      tone: 'developing',
      message: 'Solid working knowledge. Sharpen the hard questions and tighten your timing to reach excellence.',
    }
  }
  if (marks <= 27) {
    return {
      label: 'Excellent',
      tone: 'strong',
      message: 'Strong command of the syllabus. Review the few misses and push into the Master Arena.',
    }
  }
  return {
    label: 'Mastery',
    tone: 'mastered',
    message: 'Near-perfect execution. Keep the streak alive with hard-mode and mixed-syllabus tests.',
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
