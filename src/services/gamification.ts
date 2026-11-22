import type { AchievementDef, LevelInfo } from '../types/gamification'
import type { AppData, Attempt, Question } from '../types'
import { todayKey } from './storage'

export const LEVELS: LevelInfo[] = Array.from({ length: 20 }, (_, i) => {
  const level = i + 1
  const required = level === 1 ? 0 : Math.round(200 * Math.pow(level - 1, 1.55))
  return { level, requiredXp: required }
})

export function levelForXp(xp: number): { current: LevelInfo; next: LevelInfo | null; progress: number; intoLevel: number; needed: number } {
  let current = LEVELS[0]
  for (const l of LEVELS) if (xp >= l.requiredXp) current = l
  const next = LEVELS.find((l) => l.level === current.level + 1) ?? null
  const intoLevel = xp - current.requiredXp
  const needed = next ? next.requiredXp - current.requiredXp : 0
  const progress = next ? Math.min(1, intoLevel / Math.max(1, needed)) : 1
  return { current, next, progress, intoLevel, needed }
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-victory', name: 'First Victory', description: 'Complete your first exam.', icon: 'trophy' },
  { id: 'exams-5', name: 'Five Exams', description: 'Complete 5 exams.', icon: 'layers' },
  { id: 'exams-10', name: 'Ten Exams', description: 'Complete 10 exams.', icon: 'layers' },
  { id: 'exams-25', name: 'Twenty-Five Exams', description: 'Complete 25 exams.', icon: 'layers' },
  { id: 'exams-50', name: 'Fifty Exams', description: 'Complete 50 exams.', icon: 'layers' },
  { id: 'exams-100', name: 'Hundred Exams', description: 'Complete all 100 exams.', icon: 'crown' },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Score 30/30 on any exam.', icon: 'star' },
  { id: 'dfa-specialist', name: 'DFA Specialist', description: '90% accuracy across 20+ Unit 3 questions.', icon: 'cpu' },
  { id: 'grammar-architect', name: 'Grammar Architect', description: '90% accuracy across 20+ Unit 4 questions.', icon: 'git-branch' },
  { id: 'pda-champion', name: 'PDA Champion', description: '90% accuracy across 15+ Unit 5 questions.', icon: 'layers-2' },
  { id: 'turing-master', name: 'Turing Master', description: '90% accuracy across 15+ Unit 6 questions.', icon: 'terminal' },
  { id: 'computability-expert', name: 'Computability Expert', description: '90% accuracy across 15+ Unit 7 questions.', icon: 'brain' },
  { id: 'streak-7', name: '7-Day Streak', description: 'Study 7 days in a row.', icon: 'flame' },
  { id: 'streak-30', name: '30-Day Streak', description: 'Study 30 days in a row.', icon: 'flame' },
  { id: 'questions-1000', name: '1000 Questions Solved', description: 'Answer 1000 questions in total.', icon: 'check-check' },
  { id: 'questions-500', name: '500 Questions Solved', description: 'Answer 500 questions in total.', icon: 'check' },
  { id: 'revision-master', name: 'Revision Master', description: 'Mark 10 revision items as mastered.', icon: 'repeat' },
  { id: 'hard-mode', name: 'Hard Mode', description: 'Score 24+ on a Hard-difficulty exam.', icon: 'zap' },
]

const UNIT_ACHIEVEMENT: Record<number, { id: string; min: number }> = {
  3: { id: 'dfa-specialist', min: 20 },
  4: { id: 'grammar-architect', min: 20 },
  5: { id: 'pda-champion', min: 15 },
  6: { id: 'turing-master', min: 15 },
  7: { id: 'computability-expert', min: 15 },
}

export interface UnlockResult {
  newlyUnlocked: AchievementDef[]
  xpAwarded: number
}

export function totalQuestionsAnswered(data: AppData): number {
  return data.attempts.reduce((sum, a) => sum + (a.total - a.unanswered), 0)
}

export function evaluateAchievements(
  data: AppData,
  questions: Record<string, Question>,
): UnlockResult {
  const unlocked: AchievementDef[] = []
  const now = Date.now()

  const check = (id: string, condition: boolean) => {
    if (!condition) return
    if (data.achievements[id]) return
    const def = ACHIEVEMENTS.find((a) => a.id === id)
    if (!def) return
    data.achievements[id] = now
    unlocked.push(def)
  }

  const examCount = data.attempts.filter((a) => a.mode === 'standard' || a.mode === 'random' || a.mode === 'daily').length

  check('first-victory', data.attempts.length >= 1)
  check('exams-5', examCount >= 5)
  check('exams-10', examCount >= 10)
  check('exams-25', examCount >= 25)
  check('exams-50', examCount >= 50)
  check('exams-100', examCount >= 100)
  check('perfect-score', data.attempts.some((a) => a.total >= 30 && a.score === a.total))
  check('streak-7', data.streak.current >= 7 || data.streak.best >= 7)
  check('streak-30', data.streak.current >= 30 || data.streak.best >= 30)

  const answered = totalQuestionsAnswered(data)
  check('questions-500', answered >= 500)
  check('questions-1000', answered >= 1000)

  check('revision-master', data.revision.filter((r) => r.mastered).length >= 10)

  const hardAttempt = data.attempts.some((a) => {
    if (a.score < 24) return false
    const hardCount = a.questionIds.filter((id) => questions[id]?.difficulty === 'Hard').length
    return hardCount >= 15
  })
  check('hard-mode', hardAttempt)

  for (const [unitKey, config] of Object.entries(UNIT_ACHIEVEMENT)) {
    const unit = Number(unitKey)
    const stats = data.topicStats[`unit:${unit}`]
    if (!stats) continue
    if (stats.total >= config.min && stats.correct / stats.total >= 0.9) check(config.id, true)
  }

  const xpAwarded = unlocked.length * 50
  data.xp += xpAwarded

  return { newlyUnlocked: unlocked, xpAwarded }
}

export function xpForAttempt(attempt: Attempt): number {
  let xp = 50
  if (attempt.score === attempt.total && attempt.total > 0) xp += 100
  if (attempt.mode === 'daily') xp += 25
  if (attempt.percentage >= 80) xp += 20
  return xp
}

export function recordSession(data: AppData, patch: { xp?: number; questions?: number; tests?: number; challenge?: boolean }) {
  const key = todayKey()
  const existing = data.sessions[key] ?? { date: key, xpEarned: 0, questionsAnswered: 0, testsCompleted: 0, challengeDone: false }
  const updated = {
    date: key,
    xpEarned: existing.xpEarned + (patch.xp ?? 0),
    questionsAnswered: existing.questionsAnswered + (patch.questions ?? 0),
    testsCompleted: existing.testsCompleted + (patch.tests ?? 0),
    challengeDone: existing.challengeDone || Boolean(patch.challenge),
  }
  data.sessions[key] = updated

  if (data.streak.lastActiveDate !== key) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yKey = todayKey(yesterday)
    if (data.streak.lastActiveDate === yKey) data.streak.current += 1
    else data.streak.current = 1
    data.streak.lastActiveDate = key
    data.streak.best = Math.max(data.streak.best, data.streak.current)
  }
}
