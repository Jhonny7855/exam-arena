import type { AppData, Question, RevisionItem } from '../types'
import { QUESTION_BY_ID } from '../data/questionBank'

export const REVISION_INTERVALS_DAYS = [1, 3, 7, 14, 30]

const DAY_MS = 24 * 60 * 60 * 1000

export function nextInterval(lapses: number, successes: number): number {
  const index = Math.min(REVISION_INTERVALS_DAYS.length - 1, Math.max(0, successes - lapses))
  return REVISION_INTERVALS_DAYS[Math.max(0, index)]
}

export function addOrUpdateRevision(
  data: AppData,
  questionId: string,
  source: RevisionItem['source'],
  wasCorrect: boolean,
): void {
  const now = Date.now()
  const existing = data.revision.find((r) => r.questionId === questionId)

  if (existing) {
    if (wasCorrect) {
      existing.successes += 1
      existing.intervalIndex = Math.min(REVISION_INTERVALS_DAYS.length - 1, existing.intervalIndex + 1)
    } else {
      existing.lapses += 1
      existing.intervalIndex = 0
    }
    existing.dueAt = now + REVISION_INTERVALS_DAYS[existing.intervalIndex] * DAY_MS
    existing.lastReviewedAt = now
    existing.mastered = existing.successes >= 4 && existing.intervalIndex >= REVISION_INTERVALS_DAYS.length - 1
    return
  }

  if (wasCorrect) return

  data.revision.push({
    questionId,
    source,
    addedAt: now,
    dueAt: now,
    intervalIndex: 0,
    lapses: 1,
    successes: 0,
    mastered: false,
    lastReviewedAt: now,
  })
}

export function toggleSaved(data: AppData, questionId: string): boolean {
  const index = data.savedQuestions.indexOf(questionId)
  if (index >= 0) {
    data.savedQuestions.splice(index, 1)
    data.revision = data.revision.filter((r) => !(r.questionId === questionId && r.source === 'saved'))
    return false
  }
  data.savedQuestions.push(questionId)
  const now = Date.now()
  if (!data.revision.some((r) => r.questionId === questionId)) {
    data.revision.push({
      questionId,
      source: 'saved',
      addedAt: now,
      dueAt: now,
      intervalIndex: 0,
      lapses: 0,
      successes: 0,
      mastered: false,
      lastReviewedAt: null,
    })
  }
  return true
}

export interface RevisionBucket {
  wrong: RevisionItem[]
  saved: RevisionItem[]
  due: RevisionItem[]
  mastered: RevisionItem[]
  all: RevisionItem[]
}

export function revisionBuckets(data: AppData): RevisionBucket {
  const now = Date.now()
  const valid = data.revision.filter((r) => Boolean(QUESTION_BY_ID[r.questionId]))
  return {
    wrong: valid.filter((r) => r.source === 'wrong' && !r.mastered),
    saved: valid.filter((r) => r.source === 'saved' && !r.mastered),
    due: valid.filter((r) => !r.mastered && r.dueAt <= now),
    mastered: valid.filter((r) => r.mastered),
    all: valid,
  }
}

export function dueRevisionQuestions(data: AppData, limit = 30): Question[] {
  const now = Date.now()
  const scored = data.revision
    .filter((r) => !r.mastered)
    .map((r) => {
      const q = QUESTION_BY_ID[r.questionId]
      if (!q) return null
      const overdue = now - r.dueAt
      const priority = (r.lapses * 3 + 1) * (1 + overdue / DAY_MS) * (r.successes > 0 ? 1 : 1.5)
      return { q, priority }
    })
    .filter((x): x is { q: Question; priority: number } => Boolean(x))

  return scored
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map((s) => s.q)
}

export function markMastered(data: AppData, questionId: string): void {
  const item = data.revision.find((r) => r.questionId === questionId)
  if (item) {
    item.mastered = true
    item.successes = Math.max(item.successes, 4)
    item.intervalIndex = REVISION_INTERVALS_DAYS.length - 1
    item.dueAt = Date.now() + REVISION_INTERVALS_DAYS[REVISION_INTERVALS_DAYS.length - 1] * DAY_MS
  }
}

export function removeRevision(data: AppData, questionId: string): void {
  data.revision = data.revision.filter((r) => r.questionId !== questionId)
  data.savedQuestions = data.savedQuestions.filter((id) => id !== questionId)
}

export function dailyChallengeQuestions(data: AppData, todayStr: string): Question[] {
  if (data.dailyChallenge.date === todayStr && data.dailyChallenge.questionIds.length) {
    return data.dailyChallenge.questionIds
      .map((id) => QUESTION_BY_ID[id])
      .filter((q): q is Question => Boolean(q))
  }
  return []
}
