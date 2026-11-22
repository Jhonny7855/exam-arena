import { BANK_ISSUES, QUESTIONS, BANK_STATS } from './src/data/questionBank'
import { TESTS } from './src/data/tests'

const byFamily = new Map<string, { count: number; reasons: Set<string> }>()
for (const issue of BANK_ISSUES) {
  const e = byFamily.get(issue.family) ?? { count: 0, reasons: new Set<string>() }
  e.count += 1
  e.reasons.add(issue.reason)
  byFamily.set(issue.family, e)
}

console.log('total questions:', QUESTIONS.length)
console.log('total issues:', BANK_ISSUES.length)
console.log('families with issues:', byFamily.size)
console.log('')
for (const [family, e] of [...byFamily.entries()].sort((a, b) => b[1].count - a[1].count)) {
  console.log(`${family}: ${e.count} -> ${[...e.reasons].join(' | ')}`)
}
console.log('')
console.log('by unit:', JSON.stringify(BANK_STATS.byUnit))
console.log('by difficulty:', JSON.stringify(BANK_STATS.byDifficulty))
console.log('tests:', TESTS.length, 'min questions per test:', Math.min(...TESTS.map((t) => t.questionIds.length)))
