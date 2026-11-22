import { FAMILIES } from './src/data/questionBank'
import { makeDraft } from './src/data/questionBank/build'
import { rngFrom } from './src/lib/rng'

const FILLER_MARKERS = [
  'None of the above',
  'Cannot be determined from the given information',
  'The result depends on how the objects are named',
  'No such object exists',
  'This value comes from a miscount',
]

const VARIANT_FACTOR = 4
const PER_FAMILY_CAP = 3

type Row = { id: string; unit: number; topic: string; total: number; filler: number; failed: number }

const rows: Row[] = []

for (const family of FAMILIES) {
  const row: Row = { id: family.id, unit: family.unit, topic: family.topic, total: 0, filler: 0, failed: 0 }
  let kept = 0
  const target = family.count * PER_FAMILY_CAP
  const attempts = family.count * VARIANT_FACTOR
  for (let i = 0; i < attempts && kept < target; i++) {
    const rng = rngFrom(`${family.id}#${i}`)
    let gen
    try {
      gen = family.gen(rng)
    } catch {
      row.failed += 1
      continue
    }
    const draft = makeDraft(family, gen, rng)
    if (!draft) {
      row.failed += 1
      continue
    }
    kept += 1
    row.total += 1
    const hasFiller = draft.options.some((o, idx) =>
      FILLER_MARKERS.some((m) => o.includes(m) || draft.optionExplanations[idx].includes(m)),
    )
    if (hasFiller) row.filler += 1
  }
  rows.push(row)
}

const withFillers = rows.filter((r) => r.filler > 0).sort((a, b) => b.filler - a.filler)
for (const r of withFillers) {
  console.log(
    `${String(r.filler).padStart(4)}/${String(r.total).padEnd(4)} ${((r.filler / r.total) * 100).toFixed(0).padStart(3)}%  U${r.unit}  ${r.id}  (${r.topic})`,
  )
}
const totalQ = rows.reduce((s, r) => s + r.total, 0)
const totalF = rows.reduce((s, r) => s + r.filler, 0)
console.log('')
console.log(`families with fillers: ${withFillers.length} of ${rows.length}`)
console.log(`filler questions: ${totalF}/${totalQ} (${((totalF / totalQ) * 100).toFixed(2)}%)`)
const failed = rows.filter((r) => r.failed > 0)
if (failed.length) {
  console.log('')
  for (const r of failed) console.log(`failed drafts: ${r.failed}  ${r.id}`)
}
