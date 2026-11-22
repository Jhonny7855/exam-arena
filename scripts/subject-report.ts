import { BANK_BY_SUBJECT, ISSUES_BY_SUBJECT, FAMILIES_BY_SUBJECT } from './src/data/questionBank'
import { TESTS_BY_SUBJECT } from './src/data/tests'

for (const subject of ['tafl', 'daa'] as const) {
  const bank = BANK_BY_SUBJECT[subject]
  const units = subject === 'tafl' ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5, 6]
  console.log(`\n=== ${subject.toUpperCase()} ===`)
  console.log('questions:', bank.length)
  console.log('families:', FAMILIES_BY_SUBJECT[subject].length)
  console.log('issues:', ISSUES_BY_SUBJECT[subject].length)
  console.log(
    'by unit:',
    units.map((u) => `U${u}=${bank.filter((q) => q.unit === u).length}`).join(' '),
  )
  console.log(
    'by difficulty:',
    ['Easy', 'Medium', 'Hard']
      .map((d) => `${d}=${bank.filter((q) => q.difficulty === d).length}`)
      .join(' '),
  )
  const tests = TESTS_BY_SUBJECT[subject]
  const sizes = tests.map((t) => t.questionIds.length)
  console.log('tests:', tests.length, 'min size:', Math.min(...sizes), 'max size:', Math.max(...sizes))
  const missing = tests.filter((t) => new Set(t.questionIds).size !== t.questionIds.length)
  console.log('tests with duplicate ids:', missing.length)
  const wrongSubject = tests.filter((t) => t.questionIds.some((id) => !bank.some((q) => q.id === id)))
  console.log('tests referencing foreign ids:', wrongSubject.length)
}
