import type { Difficulty, QuestionType, SubjectId, UnitId } from '../../types'

export interface Draft {
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

export interface CuratedDraft extends Draft {
  key: string
}

export interface OptionSet {
  prompt: string
  correct: string
  wrong: { text: string; why: string }[]
  explanation: string
  hint: string
}
