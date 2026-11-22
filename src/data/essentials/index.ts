import type { Question, SubjectId, UnitId } from '../../types'
import { buildEssentials, validateEssentials, type EssentialsSeed } from './build'
import { TAFL_U123 } from './tafl1'
import { TAFL_U45 } from './tafl2'
import { TAFL_U67 } from './tafl3'
import { DAA_U12 } from './daa1'
import { DAA_U34 } from './daa2'
import { DAA_U56 } from './daa3'

export const TAFL_ESSENTIAL_SEEDS: EssentialsSeed[] = [...TAFL_U123, ...TAFL_U45, ...TAFL_U67]
export const DAA_ESSENTIAL_SEEDS: EssentialsSeed[] = [...DAA_U12, ...DAA_U34, ...DAA_U56]

const SEEDS_BY_SUBJECT: Record<SubjectId, EssentialsSeed[]> = {
  tafl: TAFL_ESSENTIAL_SEEDS,
  daa: DAA_ESSENTIAL_SEEDS,
}

export const ESSENTIALS_BY_SUBJECT: Record<SubjectId, Question[]> = {
  tafl: buildEssentials('tafl', TAFL_ESSENTIAL_SEEDS),
  daa: buildEssentials('daa', DAA_ESSENTIAL_SEEDS),
}

export const ESSENTIAL_QUESTIONS: Question[] = [...ESSENTIALS_BY_SUBJECT.tafl, ...ESSENTIALS_BY_SUBJECT.daa]

export const ESSENTIAL_BY_ID: Record<string, Question> = Object.fromEntries(
  ESSENTIAL_QUESTIONS.map((q) => [q.id, q]),
)

export const ESSENTIAL_ISSUES: string[] = [
  ...validateEssentials(ESSENTIALS_BY_SUBJECT.tafl),
  ...validateEssentials(ESSENTIALS_BY_SUBJECT.daa),
]

export function essentialsOf(subject: SubjectId): Question[] {
  return ESSENTIALS_BY_SUBJECT[subject]
}

export function essentialsOfUnit(subject: SubjectId, unit: UnitId): Question[] {
  return ESSENTIALS_BY_SUBJECT[subject].filter((q) => q.unit === unit)
}

export function essentialsStats(subject: SubjectId) {
  const list = ESSENTIALS_BY_SUBJECT[subject]
  const units: UnitId[] = subject === 'tafl' ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5, 6]
  return {
    total: list.length,
    byUnit: units.map((u) => ({ unit: u, count: list.filter((q) => q.unit === u).length })),
    byDifficulty: (['Easy', 'Medium', 'Hard'] as const).map((d) => ({
      difficulty: d,
      count: list.filter((q) => q.difficulty === d).length,
    })),
    topics: new Set(list.map((q) => q.topic)).size,
  }
}

export { SEEDS_BY_SUBJECT }
