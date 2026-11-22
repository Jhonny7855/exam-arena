import type { AppData, Attempt, Difficulty, Question, SubjectId, UnitId } from '../types'
import { unitsFor } from '../data/syllabus'
import { BANK_BY_SUBJECT } from '../data/questionBank'

export interface UnitPerformance {
  unit: UnitId
  title: string
  accent: string
  answered: number
  correct: number
  accuracy: number
  mastery: MasteryBand
  attempted: number
  available: number
}

export type MasteryBand = 'Critical' | 'Weak' | 'Developing' | 'Strong' | 'Mastered'

export function masteryFor(accuracy: number, answered: number): MasteryBand {
  if (answered === 0) return 'Critical'
  if (accuracy < 40) return 'Critical'
  if (accuracy < 60) return 'Weak'
  if (accuracy < 75) return 'Developing'
  if (accuracy < 90) return 'Strong'
  return 'Mastered'
}

export const MASTERY_TONE: Record<MasteryBand, string> = {
  Critical: 'var(--danger)',
  Weak: 'var(--warning)',
  Developing: 'var(--accent)',
  Strong: 'var(--success)',
  Mastered: 'var(--secondary)',
}

export interface TopicPerformance {
  topic: string
  unit: UnitId
  answered: number
  correct: number
  accuracy: number
  skipped: number
  totalTimeMs: number
  avgTimeMs: number
  mastery: MasteryBand
  questionCount: number
}

export function attemptsOfSubject(data: AppData, subject: SubjectId): Attempt[] {
  return data.attempts.filter((a) => a.subject === subject)
}

export function computeTopicPerformance(data: AppData, subject: SubjectId): TopicPerformance[] {
  const bank = BANK_BY_SUBJECT[subject]
  const byId = new Map(bank.map((q) => [q.id, q]))
  const stats = new Map<string, { correct: number; total: number; skipped: number; time: number }>()

  for (const attempt of attemptsOfSubject(data, subject)) {
    for (const answer of attempt.answers) {
      const q = byId.get(answer.questionId)
      if (!q) continue
      const entry = stats.get(q.topic) ?? { correct: 0, total: 0, skipped: 0, time: 0 }
      if (answer.selected === null) entry.skipped += 1
      else {
        entry.total += 1
        if (answer.selected === q.correctAnswer) entry.correct += 1
      }
      entry.time += answer.timeMs
      stats.set(q.topic, entry)
    }
  }

  return unitsFor(subject).flatMap((unit) =>
    unit.topics.map((topic) => {
      const s = stats.get(topic.name) ?? { correct: 0, total: 0, skipped: 0, time: 0 }
      const accuracy = s.total ? (s.correct / s.total) * 100 : 0
      return {
        topic: topic.name,
        unit: unit.id,
        answered: s.total,
        correct: s.correct,
        accuracy,
        skipped: s.skipped,
        totalTimeMs: s.time,
        avgTimeMs: s.total ? s.time / s.total : 0,
        mastery: masteryFor(accuracy, s.total),
        questionCount: bank.filter((q) => q.topic === topic.name).length,
      }
    }),
  )
}

export function computeUnitPerformance(data: AppData, subject: SubjectId): UnitPerformance[] {
  const bank = BANK_BY_SUBJECT[subject]
  const attempts = attemptsOfSubject(data, subject)
  return unitsFor(subject).map((unit) => {
    const pool = bank.filter((q) => q.unit === unit.id)
    const poolIds = new Set(pool.map((q) => q.id))
    let correct = 0
    let answered = 0
    const seen = new Set<string>()

    for (const attempt of attempts) {
      for (const a of attempt.answers) {
        if (!poolIds.has(a.questionId)) continue
        const q = pool.find((x) => x.id === a.questionId)!
        seen.add(q.id)
        if (a.selected === null) continue
        answered += 1
        if (a.selected === q.correctAnswer) correct += 1
      }
    }

    const accuracy = answered ? (correct / answered) * 100 : 0
    return {
      unit: unit.id,
      title: unit.title,
      accent: unit.accent,
      answered,
      correct,
      accuracy,
      mastery: masteryFor(accuracy, answered),
      attempted: seen.size,
      available: pool.length,
    }
  })
}

export interface DifficultyPerformance {
  difficulty: Difficulty
  answered: number
  correct: number
  accuracy: number
}

export function computeDifficultyPerformance(data: AppData, subject: SubjectId): DifficultyPerformance[] {
  const byId = new Map(BANK_BY_SUBJECT[subject].map((q) => [q.id, q]))
  const buckets: Record<Difficulty, { correct: number; total: number }> = {
    Easy: { correct: 0, total: 0 },
    Medium: { correct: 0, total: 0 },
    Hard: { correct: 0, total: 0 },
  }

  for (const attempt of attemptsOfSubject(data, subject)) {
    for (const a of attempt.answers) {
      const q = byId.get(a.questionId)
      if (!q || a.selected === null) continue
      buckets[q.difficulty].total += 1
      if (a.selected === q.correctAnswer) buckets[q.difficulty].correct += 1
    }
  }

  return (['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => ({
    difficulty: d,
    answered: buckets[d].total,
    correct: buckets[d].correct,
    accuracy: buckets[d].total ? (buckets[d].correct / buckets[d].total) * 100 : 0,
  }))
}

export interface OverallStats {
  testsCompleted: number
  totalAttempts: number
  averageScore: number
  bestScore: number
  accuracy: number
  questionsAnswered: number
  studyTimeMs: number
  completionRate: number
  avgTimePerQuestionMs: number
  totalTests: number
}

export function computeOverallStats(data: AppData, subject: SubjectId): OverallStats {
  const attempts = attemptsOfSubject(data, subject)
  const prefix = subject === 'tafl' ? 'T' : 'D'
  const standardTests = new Set(attempts.filter((a) => a.testId.startsWith(prefix)).map((a) => a.testId))
  const totalCorrect = attempts.reduce((s, a) => s + a.correct, 0)
  const totalAnswered = attempts.reduce((s, a) => s + (a.total - a.unanswered), 0)
  const studyTimeMs = attempts.reduce((s, a) => s + a.durationMs, 0)
  const totalTests = 100

  return {
    testsCompleted: standardTests.size,
    totalAttempts: attempts.length,
    averageScore: attempts.length ? attempts.reduce((s, a) => s + a.score, 0) / attempts.length : 0,
    bestScore: attempts.reduce((s, a) => Math.max(s, a.score), 0),
    accuracy: totalAnswered ? (totalCorrect / totalAnswered) * 100 : 0,
    questionsAnswered: totalAnswered,
    studyTimeMs,
    completionRate: (standardTests.size / totalTests) * 100,
    avgTimePerQuestionMs: totalAnswered ? studyTimeMs / totalAnswered : 0,
    totalTests,
  }
}

export interface ScorePoint {
  index: number
  label: string
  score: number
  percentage: number
  date: number
  testName: string
}

export function scoreTrend(data: AppData, subject: SubjectId, limit = 20): ScorePoint[] {
  return attemptsOfSubject(data, subject)
    .sort((a, b) => a.submittedAt - b.submittedAt)
    .slice(-limit)
    .map((a, i) => ({
      index: i + 1,
      label: new Date(a.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: a.score,
      percentage: a.percentage,
      date: a.submittedAt,
      testName: a.testName,
    }))
}

export interface TrendInsight {
  text: string
  tone: 'positive' | 'negative' | 'neutral'
}

export function computeInsights(data: AppData, subject: SubjectId): TrendInsight[] {
  const insights: TrendInsight[] = []
  const attempts = attemptsOfSubject(data, subject).sort((a, b) => a.submittedAt - b.submittedAt)
  if (attempts.length === 0) return insights

  if (attempts.length >= 6) {
    const recent = attempts.slice(-5)
    const older = attempts.slice(-10, -5)
    if (older.length) {
      const recentAvg = recent.reduce((s, a) => s + a.percentage, 0) / recent.length
      const olderAvg = older.reduce((s, a) => s + a.percentage, 0) / older.length
      const delta = recentAvg - olderAvg
      if (Math.abs(delta) >= 2) {
        insights.push({
          text: `Your average score ${delta > 0 ? 'improved' : 'dropped'} by ${Math.abs(Math.round(delta))}% over your last 5 attempts compared with the 5 before.`,
          tone: delta > 0 ? 'positive' : 'negative',
        })
      }
    }
  }

  const units = computeUnitPerformance(data, subject).filter((u) => u.answered >= 5)
  if (units.length >= 2) {
    const best = units.reduce((a, b) => (b.accuracy > a.accuracy ? b : a))
    const worst = units.reduce((a, b) => (b.accuracy < a.accuracy ? b : a))
    insights.push({
      text: `Strongest unit: ${best.title} at ${Math.round(best.accuracy)}% accuracy. Weakest: ${worst.title} at ${Math.round(worst.accuracy)}%.`,
      tone: 'neutral',
    })
    if (best.unit !== worst.unit && best.accuracy - worst.accuracy >= 15) {
      insights.push({
        text: `There is a ${Math.round(best.accuracy - worst.accuracy)} point gap between your best and weakest unit — focus practice on ${worst.title}.`,
        tone: 'negative',
      })
    }
  }

  const difficulty = computeDifficultyPerformance(data, subject)
  const hard = difficulty.find((d) => d.difficulty === 'Hard')
  if (hard && hard.answered >= 10) {
    insights.push({
      text: `Hard questions are at ${Math.round(hard.accuracy)}% accuracy across ${hard.answered} attempts${hard.accuracy < 60 ? ' — this is the main score ceiling.' : '.'}`,
      tone: hard.accuracy >= 70 ? 'positive' : 'negative',
    })
  }

  const unanswered = attempts.reduce((s, a) => s + a.unanswered, 0)
  const totalQ = attempts.reduce((s, a) => s + a.total, 0)
  if (totalQ > 0 && unanswered / totalQ > 0.1) {
    insights.push({
      text: `${Math.round((unanswered / totalQ) * 100)}% of questions were left unanswered. Since there is no negative marking, never skip a question.`,
      tone: 'negative',
    })
  }

  if (data.streak.current >= 3) {
    insights.push({ text: `You are on a ${data.streak.current}-day streak. Consistency is compounding.`, tone: 'positive' })
  }

  return insights
}

export interface WeakTopic {
  topic: string
  unit: UnitId
  accuracy: number
  answered: number
  skipped: number
  mastery: MasteryBand
  reason: string
  score: number
}

export function computeWeakTopics(data: AppData, subject: SubjectId): WeakTopic[] {
  const topics = computeTopicPerformance(data, subject)
  const weak: WeakTopic[] = []

  for (const t of topics) {
    let score = 0
    const reasons: string[] = []

    if (t.answered === 0) {
      score += 30
      reasons.push('not practised yet')
    } else {
      if (t.accuracy < 60) {
        score += (60 - t.accuracy) * 1.2
        reasons.push(`accuracy ${Math.round(t.accuracy)}% is below 60%`)
      }
      if (t.answered - t.correct >= 3) {
        score += 15
        reasons.push(`${t.answered - t.correct} incorrect attempts`)
      }
    }

    if (t.skipped >= 2) {
      score += 10
      reasons.push(`${t.skipped} questions skipped`)
    }

    if (t.avgTimeMs > 90000 && t.answered > 0) {
      score += 8
      reasons.push('slow average answer time')
    }

    if (reasons.length) {
      weak.push({
        topic: t.topic,
        unit: t.unit,
        accuracy: t.accuracy,
        answered: t.answered,
        skipped: t.skipped,
        mastery: t.mastery,
        reason: reasons.join('; '),
        score,
      })
    }
  }

  return weak.sort((a, b) => b.score - a.score)
}

export function pickWeakQuestionIds(data: AppData, subject: SubjectId, count: number): string[] {
  const bank = BANK_BY_SUBJECT[subject]
  const weak = computeWeakTopics(data, subject).slice(0, 6)
  if (!weak.length) return []
  const pool: Question[] = []
  for (const w of weak) {
    pool.push(...bank.filter((q) => q.topic === w.topic))
  }
  const unique = [...new Map(pool.map((q) => [q.id, q])).values()]
  const shuffled = unique.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((q) => q.id)
}

export function attemptsForTest(data: AppData, testId: string): Attempt[] {
  return data.attempts.filter((a) => a.testId === testId).sort((a, b) => b.submittedAt - a.submittedAt)
}

export function bestScoreForTest(data: AppData, testId: string): number | null {
  const list = attemptsForTest(data, testId)
  if (!list.length) return null
  return Math.max(...list.map((a) => a.score))
}
