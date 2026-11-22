import { QUESTIONS } from './src/data/questionBank'
import { FAMILIES } from './src/data/questionBank'

const FILLER_MARKERS = [
  'None of the above',
  'Cannot be determined from the given information',
  'The result depends on how the objects are named',
  'No such object exists',
  'This value comes from a miscount',
]

const byTopic = new Map<string, { total: number; filler: number }>()

for (const q of QUESTIONS) {
  const e = byTopic.get(q.topic) ?? { total: 0, filler: 0 }
  e.total += 1
  if (q.options.some((o, i) => FILLER_MARKERS.some((m) => o.includes(m) || q.optionExplanations[i].includes(m)))) {
    e.filler += 1
  }
  byTopic.set(q.topic, e)
}

const rows = [...byTopic.entries()]
  .map(([topic, e]) => ({ topic, ...e, pct: (e.filler / e.total) * 100 }))
  .sort((a, b) => b.pct - a.pct)

for (const r of rows) {
  if (r.filler === 0) continue
  console.log(`${r.pct.toFixed(1).padStart(5)}%  ${String(r.filler).padStart(3)}/${String(r.total).padEnd(4)}  ${r.topic}`)
}
