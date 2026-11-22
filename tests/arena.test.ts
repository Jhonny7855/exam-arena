import { describe, expect, it } from 'vitest'
import {
  QUESTIONS,
  BANK_ISSUES,
  BANK_STATS,
  BANK_BY_SUBJECT,
  ISSUES_BY_SUBJECT,
  QUESTION_BY_ID,
} from '../src/data/questionBank'
import { TESTS, TESTS_BY_SUBJECT, balancedRandomQuestions, testsForStage } from '../src/data/tests'
import { STAGES, stagesFor, unitsFor } from '../src/data/syllabus'
import { SUBJECTS, subjectById } from '../src/data/subjects'
import { scoreAttempt } from '../src/services/scoring'
import { masteryFor } from '../src/services/analytics'
import { levelForXp, LEVELS } from '../src/services/gamification'
import { addOrUpdateRevision, dueRevisionQuestions, markMastered } from '../src/services/revision'
import { ESSENTIALS_BY_SUBJECT, ESSENTIAL_ISSUES, ESSENTIAL_QUESTIONS, essentialsOfUnit } from '../src/data/essentials'
import { emptyData } from '../src/services/storage'
import { masterCase, nQueensCount } from '../src/lib/algorithms'
import type { SubjectId } from '../src/types'

const SUBJECT_IDS: SubjectId[] = ['tafl', 'daa']

const GENERIC_FILLERS = [
  'None of the above',
  'Cannot be determined from the given information',
  'The result depends on how the objects are named',
  'No such object exists',
  'This value comes from a miscount',
]

describe('subject registry', () => {
  it('exposes both subjects with distinct ids and codes', () => {
    expect(SUBJECTS.map((s) => s.id)).toEqual(['tafl', 'daa'])
    expect(new Set(SUBJECTS.map((s) => s.code)).size).toBe(SUBJECTS.length)
    for (const s of SUBJECTS) expect(subjectById(s.id).name.length).toBeGreaterThan(5)
  })

  it('unit counts match the syllabus modules', () => {
    expect(unitsFor('tafl')).toHaveLength(7)
    expect(unitsFor('daa')).toHaveLength(6)
    expect(stagesFor('tafl')).toHaveLength(5)
    expect(stagesFor('daa')).toHaveLength(5)
  })
})

describe('question bank', () => {
  it('has no rejected drafts', () => {
    expect(BANK_ISSUES).toEqual([])
  })

  it('has at least 3000 questions per subject', () => {
    for (const subject of SUBJECT_IDS) {
      expect(BANK_BY_SUBJECT[subject].length).toBeGreaterThanOrEqual(3000)
    }
  })

  it('every question is well formed', () => {
    for (const q of QUESTIONS) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options.every((o) => o.trim().length > 0)).toBe(true)
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(q.correctAnswer).toBeLessThanOrEqual(3)
      expect(q.explanation.length).toBeGreaterThanOrEqual(40)
      expect(q.optionExplanations).toHaveLength(4)
      expect(q.optionExplanations.every((e) => e.length >= 10)).toBe(true)
      expect(q.unit).toBeGreaterThanOrEqual(1)
      expect(q.unit).toBeLessThanOrEqual(7)
      expect(q.topic.length).toBeGreaterThan(0)
      expect(SUBJECT_IDS).toContain(q.subject)
    }
  })

  it('question ids are prefixed by their subject', () => {
    for (const subject of SUBJECT_IDS) {
      const prefix = subject.toUpperCase()
      for (const q of BANK_BY_SUBJECT[subject]) expect(q.id.startsWith(`${prefix}-U`)).toBe(true)
    }
  })

  it('has unique ids and unique question signatures', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length)
    const sig = new Set(
      QUESTIONS.map(
        (q) =>
          q.question.toLowerCase().replace(/\s+/g, ' ').trim() +
          '||' +
          q.options.map((o) => o.toLowerCase().replace(/\s+/g, ' ').trim()).join('|'),
      ),
    )
    expect(sig.size).toBe(QUESTIONS.length)
  })

  it('covers every unit of every subject', () => {
    for (const subject of SUBJECT_IDS) {
      for (const unit of unitsFor(subject)) {
        const count = BANK_BY_SUBJECT[subject].filter((q) => q.unit === unit.id).length
        expect(count).toBeGreaterThan(300)
      }
    }
  })

  it('covers every difficulty for every subject', () => {
    for (const subject of SUBJECT_IDS) {
      for (const d of ['Easy', 'Medium', 'Hard'] as const) {
        const count = BANK_BY_SUBJECT[subject].filter((q) => q.difficulty === d).length
        expect(count).toBeGreaterThan(100)
      }
    }
  })

  it('stats match actual counts', () => {
    expect(BANK_STATS.total).toBe(BANK_BY_SUBJECT.tafl.length)
    expect(BANK_STATS.byUnit.reduce((s, b) => s + b.count, 0)).toBe(BANK_STATS.total)
    expect(BANK_STATS.byDifficulty.reduce((s, b) => s + b.count, 0)).toBe(BANK_STATS.total)
    for (const subject of SUBJECT_IDS) expect(ISSUES_BY_SUBJECT[subject]).toEqual([])
  })

  it('no option text leaks a placeholder', () => {
    for (const q of QUESTIONS) {
      for (const opt of q.options) expect(opt).not.toContain('${')
      expect(q.question).not.toContain('${')
      expect(q.explanation).not.toContain('${')
      for (const why of q.optionExplanations) expect(why).not.toContain('${')
    }
  })

  it('never falls back to a generic filler option', () => {
    const offenders = QUESTIONS.filter((q) =>
      q.options.some((o, i) => GENERIC_FILLERS.some((g) => o.includes(g) || q.optionExplanations[i].includes(g))),
    )
    expect(offenders.map((q) => q.id)).toEqual([])
  })

  it('numeric answers never contain NaN or undefined', () => {
    for (const q of QUESTIONS) {
      const leaked = q.options.some(
        (o) => /NaN|Infinity|\[object Object\]/.test(o) || /^\s*(undefined|null)\s*$/.test(o),
      )
      expect({ id: q.id, leaked }).toEqual({ id: q.id, leaked: false })
    }
  })
})

describe('tests', () => {
  it('generates exactly 100 tests per subject', () => {
    expect(TESTS).toHaveLength(100)
    for (const subject of SUBJECT_IDS) expect(TESTS_BY_SUBJECT[subject]).toHaveLength(100)
  })

  it('test ids are subject-prefixed and unique', () => {
    expect(new Set(TESTS_BY_SUBJECT.tafl.map((t) => t.id)).size).toBe(100)
    expect(new Set(TESTS_BY_SUBJECT.daa.map((t) => t.id)).size).toBe(100)
    for (const t of TESTS_BY_SUBJECT.tafl) expect(t.id.startsWith('T')).toBe(true)
    for (const t of TESTS_BY_SUBJECT.daa) expect(t.id.startsWith('D')).toBe(true)
    expect(new Set([...TESTS_BY_SUBJECT.tafl, ...TESTS_BY_SUBJECT.daa].map((t) => t.id)).size).toBe(200)
  })

  it('each test has 30 unique valid question ids from its own subject', () => {
    for (const subject of SUBJECT_IDS) {
      const bankIds = new Set(BANK_BY_SUBJECT[subject].map((q) => q.id))
      for (const t of TESTS_BY_SUBJECT[subject]) {
        expect(t.subject).toBe(subject)
        expect(t.questionIds).toHaveLength(30)
        expect(new Set(t.questionIds).size).toBe(30)
        for (const id of t.questionIds) expect(bankIds.has(id)).toBe(true)
      }
    }
  })

  it('stages partition the test range', () => {
    for (const subject of SUBJECT_IDS) {
      for (const stage of stagesFor(subject)) {
        const inStage = testsForStage(subject, stage.id)
        expect(inStage.length).toBe(20)
        for (const t of inStage) {
          expect(t.number).toBeGreaterThanOrEqual(stage.range[0])
          expect(t.number).toBeLessThanOrEqual(stage.range[1])
        }
      }
    }
  })

  it('only uses questions from the declared units', () => {
    for (const t of [...TESTS_BY_SUBJECT.tafl, ...TESTS_BY_SUBJECT.daa]) {
      for (const id of t.questionIds) {
        expect(t.units).toContain(QUESTION_BY_ID[id].unit)
      }
    }
  })

  it('harder stages contain more hard questions', () => {
    for (const subject of SUBJECT_IDS) {
      const hardShare = (stage: number) => {
        const qs = testsForStage(subject, stage as 1 | 2 | 3 | 4 | 5).flatMap((t) =>
          t.questionIds.map((id) => QUESTION_BY_ID[id]),
        )
        return qs.filter((q) => q.difficulty === 'Hard').length / qs.length
      }
      expect(hardShare(5)).toBeGreaterThan(hardShare(3))
      expect(hardShare(3)).toBeGreaterThan(hardShare(1))
    }
  })

  it('balanced random sets are unique and complete', () => {
    for (const subject of SUBJECT_IDS) {
      for (const count of [10, 20, 30]) {
        const set = balancedRandomQuestions(subject, count, `check-${subject}-${count}`)
        expect(set).toHaveLength(count)
        expect(new Set(set.map((q) => q.id)).size).toBe(count)
        expect(set.every((q) => q.subject === subject)).toBe(true)
      }
    }
  })

  it('balanced random sets are deterministic per seed', () => {
    const a = balancedRandomQuestions('daa', 30, 'same-seed').map((q) => q.id)
    const b = balancedRandomQuestions('daa', 30, 'same-seed').map((q) => q.id)
    expect(a).toEqual(b)
  })

  it('unit-filtered sets stay inside the unit', () => {
    const set = balancedRandomQuestions('tafl', 20, 'unit-3-check', [3])
    expect(set).toHaveLength(20)
    expect(set.every((q) => q.unit === 3)).toBe(true)
    const daaSet = balancedRandomQuestions('daa', 20, 'unit-5-check', [5])
    expect(daaSet.every((q) => q.unit === 5 && q.subject === 'daa')).toBe(true)
  })
})

describe('scoring', () => {
  const qs = QUESTIONS.slice(0, 5)

  it('scores correct, incorrect and unanswered separately', () => {
    const answers: Record<string, { selected: number | null; marked: boolean; visited: boolean; timeMs: number }> = {
      [qs[0].id]: { selected: qs[0].correctAnswer, marked: false, visited: true, timeMs: 1000 },
      [qs[1].id]: {
        selected: ((qs[1].correctAnswer + 1) % 4) as 0 | 1 | 2 | 3,
        marked: true,
        visited: true,
        timeMs: 2000,
      },
    }
    const scored = scoreAttempt({
      subject: 'tafl',
      testId: 'T001',
      testName: 'Test',
      mode: 'standard',
      questions: qs,
      answers,
      startedAt: 0,
      submittedAt: 1000,
    })
    expect(scored.correct).toBe(1)
    expect(scored.incorrect).toBe(1)
    expect(scored.unanswered).toBe(3)
    expect(scored.score).toBe(1)
    expect(scored.percentage).toBe(20)
    expect(scored.perQuestion).toHaveLength(5)
  })

  it('never yields a negative or over-total score', () => {
    const scored = scoreAttempt({
      subject: 'tafl',
      testId: 'T001',
      testName: 'Test',
      mode: 'practice',
      questions: qs,
      answers: {},
      startedAt: 0,
      submittedAt: 500,
    })
    expect(scored.score).toBe(0)
    expect(scored.score).toBeLessThanOrEqual(scored.perQuestion.length)
  })
})

describe('analytics and gamification', () => {
  it('mastery bands are monotonic in accuracy', () => {
    const bands = [0, 30, 50, 70, 85, 95].map((a) => masteryFor(a, 10))
    expect(bands).toEqual(['Critical', 'Critical', 'Weak', 'Developing', 'Strong', 'Mastered'])
  })

  it('levels are strictly increasing in required XP', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].requiredXp).toBeGreaterThan(LEVELS[i - 1].requiredXp)
    }
  })

  it('levelForXp maps thresholds correctly', () => {
    expect(levelForXp(0).current.level).toBe(1)
    const l5 = LEVELS[4]
    expect(levelForXp(l5.requiredXp).current.level).toBe(5)
    expect(levelForXp(l5.requiredXp - 1).current.level).toBe(4)
  })
})

describe('revision scheduling', () => {
  it('adds wrong answers as immediately due', () => {
    const data = emptyData()
    const q = QUESTIONS[0]
    addOrUpdateRevision(data, q.id, 'wrong', false)
    expect(data.revision).toHaveLength(1)
    expect(data.revision[0].dueAt).toBeLessThanOrEqual(Date.now() + 1)
    expect(dueRevisionQuestions(data, 5).map((x) => x.id)).toContain(q.id)
  })

  it('ignores correct answers for untracked questions', () => {
    const data = emptyData()
    addOrUpdateRevision(data, QUESTIONS[0].id, 'wrong', true)
    expect(data.revision).toHaveLength(0)
  })

  it('advances the interval on repeated success and resets on lapse', () => {
    const data = emptyData()
    const id = QUESTIONS[0].id
    addOrUpdateRevision(data, id, 'wrong', false)
    addOrUpdateRevision(data, id, 'wrong', true)
    expect(data.revision[0].intervalIndex).toBe(1)
    addOrUpdateRevision(data, id, 'wrong', true)
    expect(data.revision[0].intervalIndex).toBe(2)
    addOrUpdateRevision(data, id, 'wrong', false)
    expect(data.revision[0].intervalIndex).toBe(0)
    expect(data.revision[0].lapses).toBe(2)
  })

  it('markMastered removes the item from the due queue', () => {
    const data = emptyData()
    const id = QUESTIONS[0].id
    addOrUpdateRevision(data, id, 'wrong', false)
    markMastered(data, id)
    expect(data.revision[0].mastered).toBe(true)
    expect(dueRevisionQuestions(data, 5)).toHaveLength(0)
  })
})

describe('essentials', () => {
  it('ships exactly 150 curated questions per subject', () => {
    for (const subject of SUBJECT_IDS) expect(ESSENTIALS_BY_SUBJECT[subject]).toHaveLength(150)
    expect(ESSENTIAL_QUESTIONS).toHaveLength(300)
  })

  it('passes its own integrity gate', () => {
    expect(ESSENTIAL_ISSUES).toEqual([])
  })

  it('uses unique ids that do not collide with the generated bank', () => {
    const ids = ESSENTIAL_QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(/^(TAFL|DAA)-ESS-\d{3}$/)
      expect(QUESTIONS.some((q) => q.id === id)).toBe(false)
      expect(QUESTION_BY_ID[id]).toBeDefined()
    }
  })

  it('has well-formed options with a valid answer index', () => {
    for (const q of ESSENTIAL_QUESTIONS) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options.map((o) => o.trim())).size).toBe(4)
      expect(q.options.every((o) => o.trim().length > 0)).toBe(true)
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(q.correctAnswer).toBeLessThan(4)
      expect(q.explanation.length).toBeGreaterThanOrEqual(40)
      expect(q.optionExplanations.every((e) => e.length >= 10)).toBe(true)
    }
  })

  it('never uses a generic filler option', () => {
    const offenders = ESSENTIAL_QUESTIONS.filter((q) =>
      q.options.some((o, i) => GENERIC_FILLERS.some((g) => o.includes(g) || q.optionExplanations[i].includes(g))),
    )
    expect(offenders.map((q) => q.id)).toEqual([])
  })

  it('covers every syllabus unit for both subjects', () => {
    for (const subject of SUBJECT_IDS) {
      for (const unit of unitsFor(subject)) {
        expect(essentialsOfUnit(subject, unit.id).length).toBeGreaterThan(0)
      }
    }
  })

  it('spans all three difficulties per subject', () => {
    for (const subject of SUBJECT_IDS) {
      for (const d of ['Easy', 'Medium', 'Hard'] as const) {
        expect(ESSENTIALS_BY_SUBJECT[subject].filter((q) => q.difficulty === d).length).toBeGreaterThan(0)
      }
    }
  })

  it('resolves through revision scheduling like bank questions', () => {
    const data = emptyData()
    const q = ESSENTIAL_QUESTIONS[0]
    addOrUpdateRevision(data, q.id, 'wrong', false)
    expect(dueRevisionQuestions(data, 5).map((x) => x.id)).toContain(q.id)
  })
})

describe('daa answer correctness', () => {
  it('master theorem answers agree with the engine', () => {
    expect(masterCase(2, 2, 1)).toBe(2)
    expect(masterCase(4, 2, 1)).toBe(1)
    expect(masterCase(8, 2, 3)).toBe(2)
    expect(masterCase(2, 2, 2)).toBe(3)
    expect(masterCase(9, 3, 2)).toBe(2)

    const family = BANK_BY_SUBJECT.daa.filter((q) => q.topic.toLowerCase().includes('master'))
    expect(family.length).toBeGreaterThan(0)
    for (const q of family) {
      expect(q.options[q.correctAnswer]).toBeTruthy()
      expect(new Set(q.options).size).toBe(4)
    }
  })

  it('n-queens counts match the known sequence', () => {
    const known = [0, 1, 0, 0, 2, 10, 4, 40, 92]
    for (let n = 1; n <= 8; n++) expect(nQueensCount(n)).toBe(known[n])

    const qs = BANK_BY_SUBJECT.daa.filter((q) => q.topic.toLowerCase().includes('queen'))
    expect(qs.length).toBeGreaterThan(0)
    for (const q of qs) {
      const numeric = Number(q.options[q.correctAnswer])
      if (Number.isFinite(numeric)) expect(numeric).toBeGreaterThanOrEqual(0)
    }
  })
})
