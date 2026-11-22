export type SubjectId = 'tafl' | 'daa'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type QuestionType =
  | 'Conceptual'
  | 'Definition'
  | 'Application'
  | 'Analysis'
  | 'Design'
  | 'Proof'
  | 'Computation'

export type UnitId = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface Question {
  id: string
  subject: SubjectId
  unit: UnitId
  topic: string
  subtopic: string
  difficulty: Difficulty
  type: QuestionType
  question: string
  options: [string, string, string, string]
  correctAnswer: 0 | 1 | 2 | 3
  explanation: string
  optionExplanations: [string, string, string, string]
  hint: string
  tags: string[]
  estimatedSeconds: number
}

export type StageId = 1 | 2 | 3 | 4 | 5

export interface Stage {
  id: StageId
  name: string
  range: [number, number]
  goal: string
  mix: { Easy: number; Medium: number; Hard: number }
}

export interface TestDef {
  id: string
  subject: SubjectId
  number: number
  name: string
  stage: StageId
  units: UnitId[]
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed'
  focus: string
  questionIds: string[]
}

export type ExamMode = 'standard' | 'practice' | 'unit' | 'random' | 'weak' | 'revision' | 'daily'

export interface AnswerRecord {
  questionId: string
  selected: number | null
  marked: boolean
  visited: boolean
  timeMs: number
}

export interface Attempt {
  id: string
  subject: SubjectId
  testId: string
  testName: string
  mode: ExamMode
  startedAt: number
  submittedAt: number
  durationMs: number
  total: number
  score: number
  correct: number
  incorrect: number
  unanswered: number
  percentage: number
  answers: AnswerRecord[]
  units: UnitId[]
  questionIds: string[]
}

export interface ActiveSession {
  key: string
  subject: SubjectId
  testId: string
  testName: string
  mode: ExamMode
  questionIds: string[]
  answers: Record<string, { selected: number | null; marked: boolean; visited: boolean; timeMs: number }>
  currentIndex: number
  startedAt: number
  endsAt: number | null
  durationMs: number
}

export interface Settings {
  theme: 'dark' | 'light'
  sound: boolean
  animations: boolean
  examMinutes: number
  questionFontSize: number
  timerWarnings: boolean
  keyboardShortcuts: boolean
  instantFeedback: boolean
  showHints: boolean
  activeSubject: SubjectId
}

export interface Profile {
  name: string
  createdAt: number
}

export interface AchievementState {
  unlocked: Record<string, number>
}

export interface RevisionItem {
  questionId: string
  source: 'wrong' | 'saved' | 'marked'
  addedAt: number
  dueAt: number
  intervalIndex: number
  lapses: number
  successes: number
  mastered: boolean
  lastReviewedAt: number | null
}

export interface SessionRecord {
  date: string
  xpEarned: number
  questionsAnswered: number
  testsCompleted: number
  challengeDone: boolean
}

export interface AppData {
  version: number
  profile: Profile
  settings: Settings
  attempts: Attempt[]
  sessions: Record<string, SessionRecord>
  revision: RevisionItem[]
  savedQuestions: string[]
  achievements: Record<string, number>
  xp: number
  streak: { current: number; best: number; lastActiveDate: string | null }
  activeSessions: Record<string, ActiveSession>
  topicStats: Record<string, { correct: number; total: number; skipped: number; totalTimeMs: number }>
  dailyChallenge: { date: string; questionIds: string[]; completed: boolean; score: number }
  seenCounts: Record<string, number>
}

export interface ScoredAttempt {
  score: number
  correct: number
  incorrect: number
  unanswered: number
  percentage: number
  perQuestion: {
    questionId: string
    selected: number | null
    correct: boolean
    answered: boolean
  }[]
}
