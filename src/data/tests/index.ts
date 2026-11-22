import type { Difficulty, Question, StageId, SubjectId, TestDef, UnitId } from '../../types'
import { stagesFor, unitsFor } from '../syllabus'
import { BANK_BY_SUBJECT } from '../questionBank'
import { rngFrom, shuffle, pickMany } from '../../lib/rng'
import {
  TEST_NAMES_BY_SUBJECT,
  UNIT_BY_STAGE_BY_SUBJECT,
  UNIT_PATTERNS_BY_SUBJECT,
} from './names'

export const TOTAL_TESTS = 100
export const QUESTIONS_PER_TEST = 30

function stageOf(number: number): StageId {
  if (number <= 20) return 1
  if (number <= 40) return 2
  if (number <= 60) return 3
  if (number <= 80) return 4
  return 5
}

function difficultyTargets(subject: SubjectId, stage: StageId, count: number): Record<Difficulty, number> {
  const mix = stagesFor(subject).find((s) => s.id === stage)!.mix
  const easy = Math.round(mix.Easy * count)
  const hard = Math.round(mix.Hard * count)
  const medium = count - easy - hard
  return { Easy: easy, Medium: medium, Hard: hard }
}

function topicTagsFor(qs: Question[]): string[] {
  const counts = new Map<string, number>()
  for (const q of qs) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t)
}

function buildTest(subject: SubjectId, number: number): TestDef {
  const stage = stageOf(number)
  const stageObj = stagesFor(subject).find((s) => s.id === stage)!
  const rng = rngFrom(`${subject}-test-${number}-v1`)
  const unitByStage = UNIT_BY_STAGE_BY_SUBJECT[subject][stage]
  const patternIndex = unitByStage[(number - 1) % unitByStage.length]
  const units = UNIT_PATTERNS_BY_SUBJECT[subject][patternIndex]
  const bank = BANK_BY_SUBJECT[subject]
  const pool = bank.filter((q) => units.includes(q.unit))
  const targets = difficultyTargets(subject, stage, QUESTIONS_PER_TEST)

  const chosen: Question[] = []
  const used = new Set<string>()

  for (const difficulty of ['Easy', 'Medium', 'Hard'] as Difficulty[]) {
    const want = targets[difficulty]
    const candidates = shuffle(rng, pool.filter((q) => q.difficulty === difficulty && !used.has(q.id)))
    for (const q of candidates.slice(0, want)) {
      chosen.push(q)
      used.add(q.id)
    }
  }

  if (chosen.length < QUESTIONS_PER_TEST) {
    const remaining = shuffle(rng, pool.filter((q) => !used.has(q.id)))
    for (const q of remaining) {
      if (chosen.length >= QUESTIONS_PER_TEST) break
      chosen.push(q)
      used.add(q.id)
    }
  }

  if (chosen.length < QUESTIONS_PER_TEST) {
    const extra = shuffle(rng, bank.filter((q) => !used.has(q.id)))
    for (const q of extra) {
      if (chosen.length >= QUESTIONS_PER_TEST) break
      chosen.push(q)
      used.add(q.id)
    }
  }

  const ordered = shuffle(rng, chosen)
  const dominant = ordered.filter((q) => q.difficulty === 'Hard').length
  const difficulty: TestDef['difficulty'] =
    dominant >= 17 ? 'Hard' : dominant <= 4 ? 'Easy' : 'Mixed'

  const names = TEST_NAMES_BY_SUBJECT[subject][stage]
  const name = names[(number - 1) % names.length]
  const prefix = subject === 'tafl' ? 'T' : 'D'

  return {
    id: `${prefix}${String(number).padStart(3, '0')}`,
    subject,
    number,
    name: `Test ${String(number).padStart(2, '0')} · ${name}`,
    stage,
    units,
    topics: topicTagsFor(ordered),
    difficulty,
    focus: stageObj.goal,
    questionIds: ordered.map((q) => q.id),
  }
}

function buildAll(subject: SubjectId): TestDef[] {
  return Array.from({ length: TOTAL_TESTS }, (_, i) => buildTest(subject, i + 1))
}

export const TESTS_BY_SUBJECT: Record<SubjectId, TestDef[]> = {
  tafl: buildAll('tafl'),
  daa: buildAll('daa'),
}

export const TESTS: TestDef[] = TESTS_BY_SUBJECT.tafl

export const TEST_BY_ID: Record<string, TestDef> = Object.fromEntries(
  [...TESTS_BY_SUBJECT.tafl, ...TESTS_BY_SUBJECT.daa].map((t) => [t.id, t]),
)

export function testsOf(subject: SubjectId): TestDef[] {
  return TESTS_BY_SUBJECT[subject]
}

export function testById(id: string): TestDef | undefined {
  return TEST_BY_ID[id]
}

export function testsForStage(subject: SubjectId, stage: StageId): TestDef[] {
  return TESTS_BY_SUBJECT[subject].filter((t) => t.stage === stage)
}

export function balancedRandomQuestions(
  subject: SubjectId,
  count: number,
  seed: string,
  units?: UnitId[],
): Question[] {
  const rng = rngFrom(seed)
  const all = BANK_BY_SUBJECT[subject]
  const pool = units && units.length ? all.filter((q) => units.includes(q.unit)) : all
  const byUnit = new Map<UnitId, Question[]>()
  for (const q of pool) {
    const list = byUnit.get(q.unit) ?? []
    list.push(q)
    byUnit.set(q.unit, list)
  }

  const keys = [...byUnit.keys()].sort((a, b) => a - b)
  const perUnit = Math.floor(count / keys.length)
  const extra = count - perUnit * keys.length
  const out: Question[] = []
  const used = new Set<string>()

  keys.forEach((u, index) => {
    const want = perUnit + (index < extra ? 1 : 0)
    const list = byUnit.get(u) ?? []
    const easy = list.filter((q) => q.difficulty === 'Easy')
    const medium = list.filter((q) => q.difficulty === 'Medium')
    const hard = list.filter((q) => q.difficulty === 'Hard')
    const buckets = [
      pickMany(rng, easy, Math.ceil(want / 3)),
      pickMany(rng, medium, Math.ceil(want / 3)),
      pickMany(rng, hard, Math.floor(want / 3)),
    ]
    const picked: Question[] = []
    for (const b of buckets) {
      for (const q of b) {
        if (picked.length >= want) break
        if (!used.has(q.id)) {
          picked.push(q)
          used.add(q.id)
        }
      }
    }
    if (picked.length < want) {
      for (const q of shuffle(rng, list)) {
        if (picked.length >= want) break
        if (!used.has(q.id)) {
          picked.push(q)
          used.add(q.id)
        }
      }
    }
    out.push(...picked)
  })

  if (out.length < count) {
    for (const q of shuffle(rng, pool)) {
      if (out.length >= count) break
      if (!used.has(q.id)) {
        out.push(q)
        used.add(q.id)
      }
    }
  }

  return shuffle(rng, out).slice(0, count)
}

export function questionsForTest(test: TestDef): Question[] {
  const bank = BANK_BY_SUBJECT[test.subject]
  const map = new Map(bank.map((q) => [q.id, q]))
  return test.questionIds.map((id) => map.get(id)).filter((q): q is Question => Boolean(q))
}

export function testStats(subject: SubjectId) {
  return {
    total: TESTS_BY_SUBJECT[subject].length,
    perStage: stagesFor(subject).map((s) => ({
      stage: s.id,
      name: s.name,
      count: testsForStage(subject, s.id).length,
    })),
  }
}

export const TEST_STATS = testStats('tafl')

export { unitsFor }
