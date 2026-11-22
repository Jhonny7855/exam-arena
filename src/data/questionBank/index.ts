import type { Difficulty, Question, SubjectId, UnitId } from '../../types'
import { makeDraft, type Family } from './build'
import { rngFrom } from '../../lib/rng'
import { unit1Families } from './unit1'
import { unit2Families } from './unit2'
import { unit3Families } from './unit3'
import { unit4Families, unit5Families } from './unit45'
import { unit6Families, unit7Families } from './unit67'
import { daaFamilies } from './daa'
import { ESSENTIAL_QUESTIONS } from '../essentials'

export const TAFL_FAMILIES: Family[] = [
  ...unit1Families,
  ...unit2Families,
  ...unit3Families,
  ...unit4Families,
  ...unit5Families,
  ...unit6Families,
  ...unit7Families,
].map((f) => ({ ...f, subject: 'tafl' as SubjectId }))

export const DAA_FAMILY_LIST: Family[] = daaFamilies.map((f) => ({ ...f, subject: 'daa' as SubjectId }))

export const FAMILIES_BY_SUBJECT: Record<SubjectId, Family[]> = {
  tafl: TAFL_FAMILIES,
  daa: DAA_FAMILY_LIST,
}

export const FAMILIES: Family[] = [...TAFL_FAMILIES, ...DAA_FAMILY_LIST]

const VARIANT_FACTOR = 4
const PER_FAMILY_CAP = 3

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').replace(/[“”"']/g, '').trim()
}

function signature(q: Question): string {
  return normalize(q.question) + '||' + q.options.map(normalize).join('|')
}

export interface BankIssue {
  id: string
  family: string
  reason: string
}

function validateDraft(q: Question): string | null {
  if (!q.question || q.question.length < 8) return 'question text too short'
  if (q.options.length !== 4) return 'not exactly four options'
  if (new Set(q.options.map((o) => o.trim())).size !== 4) return 'duplicate option text'
  if (q.options.some((o) => !o || !o.trim())) return 'empty option'
  if (q.correctAnswer < 0 || q.correctAnswer > 3) return 'correctAnswer out of range'
  if (!q.explanation || q.explanation.length < 40) return 'explanation too short'
  if (q.optionExplanations.length !== 4) return 'optionExplanations length wrong'
  if (q.optionExplanations.some((e) => !e || e.length < 10)) return 'shallow option explanation'
  if (!q.topic) return 'missing topic'
  return null
}

function buildBank(subject: SubjectId, families: Family[]): { questions: Question[]; issues: BankIssue[] } {
  const questions: Question[] = []
  const issues: BankIssue[] = []
  const seen = new Set<string>()
  const counters: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
  const prefix = subject.toUpperCase()

  for (const family of families) {
    let kept = 0
    const target = family.count * PER_FAMILY_CAP
    const attempts = family.count * VARIANT_FACTOR
    for (let i = 0; i < attempts && kept < target; i++) {
      const rng = rngFrom(`${family.id}#${i}`)
      let gen
      try {
        gen = family.gen(rng)
      } catch {
        issues.push({ id: `${family.id}#${i}`, family: family.id, reason: 'generator threw' })
        continue
      }
      const draft = makeDraft(family, gen, rng)
      if (!draft) {
        issues.push({ id: `${family.id}#${i}`, family: family.id, reason: 'draft could not be assembled' })
        continue
      }
      counters[family.unit] += 1
      const q: Question = {
        id: `${prefix}-U${family.unit}-${String(counters[family.unit]).padStart(4, '0')}`,
        ...draft,
      }
      const problem = validateDraft(q)
      if (problem) {
        counters[family.unit] -= 1
        issues.push({ id: q.id, family: family.id, reason: problem })
        continue
      }
      const sig = signature(q)
      if (seen.has(sig)) continue
      seen.add(sig)
      questions.push(q)
      kept += 1
    }
  }

  return { questions, issues }
}

const builtTafl = buildBank('tafl', TAFL_FAMILIES)
const builtDaa = buildBank('daa', DAA_FAMILY_LIST)

export const BANK_BY_SUBJECT: Record<SubjectId, Question[]> = {
  tafl: builtTafl.questions,
  daa: builtDaa.questions,
}

export const ISSUES_BY_SUBJECT: Record<SubjectId, BankIssue[]> = {
  tafl: builtTafl.issues,
  daa: builtDaa.issues,
}

export const QUESTIONS: Question[] = [...BANK_BY_SUBJECT.tafl, ...BANK_BY_SUBJECT.daa]
export const BANK_ISSUES: BankIssue[] = [...ISSUES_BY_SUBJECT.tafl, ...ISSUES_BY_SUBJECT.daa]

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  [...QUESTIONS, ...ESSENTIAL_QUESTIONS].map((q) => [q.id, q]),
)

export const ALL_QUESTIONS: Question[] = [...QUESTIONS, ...ESSENTIAL_QUESTIONS]

export function questionsOfSubject(subject: SubjectId): Question[] {
  return BANK_BY_SUBJECT[subject]
}

export function questionsOfUnit(subject: SubjectId, unit: UnitId): Question[] {
  return BANK_BY_SUBJECT[subject].filter((q) => q.unit === unit)
}

export function questionsByDifficulty(subject: SubjectId, d: Difficulty): Question[] {
  return BANK_BY_SUBJECT[subject].filter((q) => q.difficulty === d)
}

export function bankStats(subject: SubjectId) {
  const bank = BANK_BY_SUBJECT[subject]
  const units: UnitId[] = subject === 'tafl' ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5, 6]
  return {
    total: bank.length,
    byUnit: units.map((u) => ({ unit: u, count: bank.filter((q) => q.unit === u).length })),
    byDifficulty: (['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => ({
      difficulty: d,
      count: bank.filter((q) => q.difficulty === d).length,
    })),
    families: FAMILIES_BY_SUBJECT[subject].length,
    issues: ISSUES_BY_SUBJECT[subject].length,
  }
}

export const BANK_STATS = bankStats('tafl')

export function getQuestions(ids: readonly string[]): Question[] {
  return ids.map((id) => QUESTION_BY_ID[id]).filter((q): q is Question => Boolean(q))
}
