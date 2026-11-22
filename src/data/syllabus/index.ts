import type { SubjectId, UnitId } from '../../types'
import type { UnitSyllabus } from './types'
import { TAFL_UNITS, TAFL_STAGES } from './tafl'
import { DAA_UNITS, DAA_STAGES } from './daa'

export type { TopicNote, UnitSyllabus } from './types'
export { TAFL_UNITS, TAFL_STAGES } from './tafl'
export { DAA_UNITS, DAA_STAGES } from './daa'

export const UNITS_BY_SUBJECT: Record<SubjectId, UnitSyllabus[]> = {
  tafl: TAFL_UNITS,
  daa: DAA_UNITS,
}

export const STAGES_BY_SUBJECT: Record<SubjectId, typeof TAFL_STAGES> = {
  tafl: TAFL_STAGES,
  daa: DAA_STAGES,
}

export const UNIT_IDS_BY_SUBJECT: Record<SubjectId, UnitId[]> = {
  tafl: TAFL_UNITS.map((u) => u.id),
  daa: DAA_UNITS.map((u) => u.id),
}

export function unitsFor(subject: SubjectId): UnitSyllabus[] {
  return UNITS_BY_SUBJECT[subject]
}

export function stagesFor(subject: SubjectId) {
  return STAGES_BY_SUBJECT[subject]
}

export function unitByIdFor(subject: SubjectId, id: UnitId): UnitSyllabus {
  const unit = unitsFor(subject).find((u) => u.id === id)
  if (!unit) throw new Error(`Unknown unit ${id} for subject ${subject}`)
  return unit
}

export function topicsFor(subject: SubjectId) {
  return unitsFor(subject).flatMap((u) => u.topics.map((t) => ({ unit: u.id, topic: t.name })))
}

export const UNITS: UnitSyllabus[] = TAFL_UNITS
export const STAGES = TAFL_STAGES
export const unitById = (id: UnitId): UnitSyllabus => unitByIdFor('tafl', id)
export const stageById = (id: number) => STAGES.find((s) => s.id === id) ?? STAGES[0]
export const ALL_TOPICS = topicsFor('tafl')
