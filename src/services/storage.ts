import type { AppData, Attempt, RevisionItem, Settings } from '../types'

export const DATA_VERSION = 3
export const STORAGE_KEY = 'tafl-arena-data-v3'

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  sound: false,
  animations: true,
  examMinutes: 30,
  questionFontSize: 16,
  timerWarnings: true,
  keyboardShortcuts: true,
  instantFeedback: true,
  showHints: true,
  activeSubject: 'tafl',
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function emptyData(): AppData {
  return {
    version: DATA_VERSION,
    profile: { name: 'Student', createdAt: Date.now() },
    settings: { ...DEFAULT_SETTINGS },
    attempts: [],
    sessions: {},
    revision: [],
    savedQuestions: [],
    achievements: {},
    xp: 0,
    streak: { current: 0, best: 0, lastActiveDate: null },
    activeSessions: {},
    topicStats: {},
    dailyChallenge: { date: '', questionIds: [], completed: false, score: 0 },
    seenCounts: {},
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function migrate(raw: unknown): AppData {
  const base = emptyData()
  if (!isObject(raw)) return base
  const data: AppData = {
    ...base,
    ...(raw as Partial<AppData>),
    profile: { ...base.profile, ...(isObject(raw.profile) ? raw.profile : {}) },
    settings: { ...base.settings, ...(isObject(raw.settings) ? raw.settings : {}) },
    streak: { ...base.streak, ...(isObject(raw.streak) ? raw.streak : {}) },
    dailyChallenge: { ...base.dailyChallenge, ...(isObject(raw.dailyChallenge) ? raw.dailyChallenge : {}) },
    attempts: Array.isArray(raw.attempts) ? (raw.attempts as Attempt[]) : [],
    revision: Array.isArray(raw.revision) ? (raw.revision as RevisionItem[]) : [],
    savedQuestions: Array.isArray(raw.savedQuestions) ? (raw.savedQuestions as string[]) : [],
    achievements: isObject(raw.achievements) ? (raw.achievements as Record<string, number>) : {},
    sessions: isObject(raw.sessions) ? (raw.sessions as AppData['sessions']) : {},
    activeSessions: isObject(raw.activeSessions) ? (raw.activeSessions as AppData['activeSessions']) : {},
    topicStats: isObject(raw.topicStats) ? (raw.topicStats as AppData['topicStats']) : {},
    seenCounts: isObject(raw.seenCounts) ? (raw.seenCounts as Record<string, number>) : {},
    xp: typeof raw.xp === 'number' ? raw.xp : 0,
    version: DATA_VERSION,
  }
  return data
}

export function loadData(): AppData {
  if (typeof localStorage === 'undefined') return emptyData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    return migrate(JSON.parse(raw))
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage full or unavailable; keep app usable in memory
  }
}

export function exportData(data: AppData): string {
  return JSON.stringify({ ...data, version: DATA_VERSION, exportedAt: new Date().toISOString() }, null, 2)
}

export function parseImport(text: string): { ok: true; data: AppData } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(text)
    if (!isObject(parsed)) return { ok: false, error: 'File does not contain a data object.' }
    if (!Array.isArray(parsed.attempts) && !isObject(parsed.settings)) {
      return { ok: false, error: 'File is not a TAFL Arena export.' }
    }
    return { ok: true, data: migrate(parsed) }
  } catch {
    return { ok: false, error: 'File is not valid JSON.' }
  }
}

export function downloadJSON(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
