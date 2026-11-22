import { create } from 'zustand'
import type {
  ActiveSession,
  AppData,
  Attempt,
  ExamMode,
  Question,
  ScoredAttempt,
  Settings,
  SubjectId,
  UnitId,
} from '../types'
import { emptyData, loadData, saveData, todayKey } from '../services/storage'
import { scoreAttempt, toAttempt, type SubmitInput } from '../services/scoring'
import { evaluateAchievements, levelForXp, recordSession, xpForAttempt } from '../services/gamification'
import { addOrUpdateRevision, dueRevisionQuestions, toggleSaved } from '../services/revision'
import { QUESTIONS, QUESTION_BY_ID } from '../data/questionBank'
import { balancedRandomQuestions } from '../data/tests'
import { pickWeakQuestionIds } from '../services/analytics'
import { DEFAULT_SUBJECT } from '../data/subjects'

export interface StartExamOptions {
  key: string
  subject: SubjectId
  testId: string
  testName: string
  mode: ExamMode
  questions: Question[]
  durationMs: number | null
}

interface ArenaState {
  data: AppData
  hydrated: boolean
  lastUnlock: string[]
  lastSubmit: { attempt: Attempt; scored: ScoredAttempt } | null
  hydrate: () => void
  updateSettings: (patch: Partial<Settings>) => void
  setSubject: (subject: SubjectId) => void
  setProfileName: (name: string) => void
  startExam: (options: StartExamOptions) => ActiveSession
  getSession: (key: string) => ActiveSession | undefined
  selectAnswer: (key: string, questionId: string, option: number | null) => void
  toggleMark: (key: string, questionId: string) => void
  markVisited: (key: string, questionId: string) => void
  setCurrentIndex: (key: string, index: number) => void
  addTime: (key: string, questionId: string, ms: number) => void
  submitExam: (key: string) => { attempt: Attempt; scored: ScoredAttempt } | null
  abandonSession: (key: string) => void
  toggleSaveQuestion: (questionId: string) => boolean
  clearUnlocks: () => void
  resetAll: () => void
  importData: (data: AppData) => void
  ensureDailyChallenge: () => Question[]
  completeDailyChallenge: (attemptId: string) => void
}

function persist(data: AppData) {
  saveData(data)
}

function recomputeTopicStats(data: AppData, attempt: Attempt) {
  const perUnit = new Map<number, { correct: number; total: number }>()

  for (const a of attempt.answers) {
    const q = QUESTION_BY_ID[a.questionId]
    if (!q) continue
    const stats = data.topicStats[q.topic] ?? { correct: 0, total: 0, skipped: 0, totalTimeMs: 0 }
    if (a.selected === null) stats.skipped += 1
    else {
      stats.total += 1
      if (a.selected === q.correctAnswer) stats.correct += 1
    }
    stats.totalTimeMs += a.timeMs
    data.topicStats[q.topic] = stats

    const u = perUnit.get(q.unit) ?? { correct: 0, total: 0 }
    if (a.selected !== null) {
      u.total += 1
      if (a.selected === q.correctAnswer) u.correct += 1
    }
    perUnit.set(q.unit, u)

    data.seenCounts[q.id] = (data.seenCounts[q.id] ?? 0) + 1
  }

  for (const [unit, v] of perUnit) {
    const key = `unit:${unit}`
    const stats = data.topicStats[key] ?? { correct: 0, total: 0, skipped: 0, totalTimeMs: 0 }
    stats.correct += v.correct
    stats.total += v.total
    data.topicStats[key] = stats
  }
}

export const useArena = create<ArenaState>((set, get) => ({
  data: emptyData(),
  hydrated: false,
  lastUnlock: [],
  lastSubmit: null,

  hydrate: () => {
    const data = loadData()
    set({ data, hydrated: true })
  },

  updateSettings: (patch) => {
    set((state) => {
      const data = { ...state.data, settings: { ...state.data.settings, ...patch } }
      persist(data)
      return { data }
    })
  },

  setSubject: (subject) => {
    set((state) => {
      if (state.data.settings.activeSubject === subject) return state
      const data = { ...state.data, settings: { ...state.data.settings, activeSubject: subject } }
      persist(data)
      return { data }
    })
  },

  setProfileName: (name) => {
    set((state) => {
      const data = { ...state.data, profile: { ...state.data.profile, name: name.trim() || 'Student' } }
      persist(data)
      return { data }
    })
  },

  startExam: (options) => {
    const state = get()
    const existing = state.data.activeSessions[options.key]
    if (existing && existing.questionIds.length === options.questions.length) return existing

    const now = Date.now()
    const session: ActiveSession = {
      key: options.key,
      subject: options.subject,
      testId: options.testId,
      testName: options.testName,
      mode: options.mode,
      questionIds: options.questions.map((q) => q.id),
      answers: {},
      currentIndex: 0,
      startedAt: now,
      endsAt: options.durationMs === null ? null : now + options.durationMs,
      durationMs: options.durationMs ?? 0,
    }
    const data = { ...state.data, activeSessions: { ...state.data.activeSessions, [options.key]: session } }
    persist(data)
    set({ data })
    return session
  },

  getSession: (key) => get().data.activeSessions[key],

  selectAnswer: (key, questionId, option) => {
    set((state) => {
      const session = state.data.activeSessions[key]
      if (!session) return state
      const prev = session.answers[questionId] ?? { selected: null, marked: false, visited: true, timeMs: 0 }
      const updated: ActiveSession = {
        ...session,
        answers: { ...session.answers, [questionId]: { ...prev, selected: option, visited: true } },
      }
      const data = { ...state.data, activeSessions: { ...state.data.activeSessions, [key]: updated } }
      persist(data)
      return { data }
    })
  },

  toggleMark: (key, questionId) => {
    set((state) => {
      const session = state.data.activeSessions[key]
      if (!session) return state
      const prev = session.answers[questionId] ?? { selected: null, marked: false, visited: true, timeMs: 0 }
      const updated: ActiveSession = {
        ...session,
        answers: { ...session.answers, [questionId]: { ...prev, marked: !prev.marked, visited: true } },
      }
      const data = { ...state.data, activeSessions: { ...state.data.activeSessions, [key]: updated } }
      persist(data)
      return { data }
    })
  },

  markVisited: (key, questionId) => {
    set((state) => {
      const session = state.data.activeSessions[key]
      if (!session) return state
      const prev = session.answers[questionId]
      if (prev?.visited) return state
      const updated: ActiveSession = {
        ...session,
        answers: {
          ...session.answers,
          [questionId]: prev
            ? { ...prev, visited: true }
            : { selected: null, marked: false, visited: true, timeMs: 0 },
        },
      }
      const data = { ...state.data, activeSessions: { ...state.data.activeSessions, [key]: updated } }
      persist(data)
      return { data }
    })
  },

  setCurrentIndex: (key, index) => {
    set((state) => {
      const session = state.data.activeSessions[key]
      if (!session) return state
      const updated: ActiveSession = { ...session, currentIndex: index }
      const data = { ...state.data, activeSessions: { ...state.data.activeSessions, [key]: updated } }
      persist(data)
      return { data }
    })
  },

  addTime: (key, questionId, ms) => {
    const session = get().data.activeSessions[key]
    if (!session) return
    const prev = session.answers[questionId]
    if (!prev) return
    prev.timeMs += ms
  },

  submitExam: (key) => {
    const state = get()
    const session = state.data.activeSessions[key]
    if (!session) return null

    const questions = session.questionIds
      .map((id) => QUESTION_BY_ID[id])
      .filter((q): q is Question => Boolean(q))

    const input: SubmitInput = {
      subject: session.subject,
      testId: session.testId,
      testName: session.testName,
      mode: session.mode,
      questions,
      answers: session.answers,
      startedAt: session.startedAt,
      submittedAt: Date.now(),
    }

    const scored = scoreAttempt(input)
    const attempt = toAttempt(input, scored)

    const data: AppData = {
      ...state.data,
      attempts: [...state.data.attempts, attempt],
      activeSessions: { ...state.data.activeSessions },
    }
    delete data.activeSessions[key]

    recomputeTopicStats(data, attempt)

    const xpGain = xpForAttempt(attempt)
    data.xp += xpGain
    recordSession(data, {
      xp: xpGain,
      questions: attempt.total - attempt.unanswered,
      tests: attempt.mode === 'standard' || attempt.mode === 'random' ? 1 : 0,
      challenge: attempt.mode === 'daily',
    })

    for (const a of attempt.answers) {
      if (a.selected === null) continue
      const q = QUESTION_BY_ID[a.questionId]
      if (!q) continue
      const isCorrect = a.selected === q.correctAnswer
      if (!isCorrect) addOrUpdateRevision(data, q.id, 'wrong', false)
      else if (data.revision.some((r) => r.questionId === q.id)) addOrUpdateRevision(data, q.id, 'wrong', true)
    }

    if (attempt.mode === 'daily') {
      data.dailyChallenge = { ...data.dailyChallenge, completed: true, score: attempt.score }
    }

    const unlockResult = evaluateAchievements(data, QUESTION_BY_ID)
    persist(data)
    set({ data, lastSubmit: { attempt, scored }, lastUnlock: unlockResult.newlyUnlocked.map((a) => a.name) })
    return { attempt, scored }
  },

  abandonSession: (key) => {
    set((state) => {
      const sessions = { ...state.data.activeSessions }
      delete sessions[key]
      const data = { ...state.data, activeSessions: sessions }
      persist(data)
      return { data }
    })
  },

  toggleSaveQuestion: (questionId) => {
    const state = get()
    const data: AppData = {
      ...state.data,
      savedQuestions: [...state.data.savedQuestions],
      revision: [...state.data.revision],
    }
    const nowSaved = toggleSaved(data, questionId)
    persist(data)
    set({ data })
    return nowSaved
  },

  clearUnlocks: () => set({ lastUnlock: [] }),

  resetAll: () => {
    const data = emptyData()
    persist(data)
    set({ data, lastSubmit: null, lastUnlock: [] })
  },

  importData: (data) => {
    persist(data)
    set({ data, lastSubmit: null, lastUnlock: [] })
  },

  ensureDailyChallenge: () => {
    const today = todayKey()
    const state = get()
    const subject = state.data.settings.activeSubject ?? DEFAULT_SUBJECT
    if (state.data.dailyChallenge.date === today && state.data.dailyChallenge.questionIds.length === 10) {
      return state.data.dailyChallenge.questionIds
        .map((id) => QUESTION_BY_ID[id])
        .filter((q): q is Question => Boolean(q))
    }
    const questions = balancedRandomQuestions(subject, 10, `daily-${today}`)
    const data: AppData = {
      ...state.data,
      dailyChallenge: {
        date: today,
        questionIds: questions.map((q) => q.id),
        completed: false,
        score: 0,
      },
    }
    persist(data)
    set({ data })
    return questions
  },

  completeDailyChallenge: () => {
    // handled in submitExam; kept for API completeness
  },
}))

export const useSettings = () => useArena((s) => s.data.settings)
export const useData = () => useArena((s) => s.data)

export function unitPracticeQuestions(subject: SubjectId, unit: UnitId, count: number): Question[] {
  return balancedRandomQuestions(subject, count, `${subject}-unit-${unit}-${count}`, [unit])
}

export function randomExamQuestions(subject: SubjectId, count = 30): Question[] {
  return balancedRandomQuestions(subject, count, `${subject}-random-${Date.now()}`)
}

export function weakTrainingQuestions(subject: SubjectId): Question[] {
  const data = useArena.getState().data
  const ids = pickWeakQuestionIds(data, subject, 20)
  if (ids.length >= 5) return ids.map((id) => QUESTION_BY_ID[id]).filter(Boolean)
  return balancedRandomQuestions(subject, 20, `${subject}-weak-fallback-${Date.now()}`)
}

export function revisionQuestions(subject: SubjectId): Question[] {
  const data = useArena.getState().data
  const due = dueRevisionQuestions(data, 25).filter((q) => q.subject === subject)
  if (due.length >= 5) return due
  return balancedRandomQuestions(subject, 20, `${subject}-revision-fallback-${Date.now()}`)
}

export function levelState(xp: number) {
  return levelForXp(xp)
}

export { QUESTIONS }
