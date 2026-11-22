import { QUESTIONS } from './src/data/questionBank'

const FILLER_MARKERS = [
  'None of the above',
  'Cannot be determined from the given information',
  'The result depends on how the objects are named',
  'No such object exists',
  'This value comes from a miscount',
]

const hits = new Map<string, number>()
let withFiller = 0
const perFamily = new Map<string, number>()

for (const q of QUESTIONS) {
  let found = false
  for (let i = 0; i < q.options.length; i++) {
    const opt = q.options[i]
    const why = q.optionExplanations[i]
    const marker = FILLER_MARKERS.find((m) => opt.includes(m) || why.includes(m))
    if (marker) {
      hits.set(marker, (hits.get(marker) ?? 0) + 1)
      found = true
    }
  }
  if (found) {
    withFiller += 1
    const fam = q.id.replace(/^TAFL-U\d-/, '')
    perFamily.set(fam, (perFamily.get(fam) ?? 0) + 1)
  }
}

console.log('questions total:', QUESTIONS.length)
console.log('questions containing a filler option:', withFiller, `(${((withFiller / QUESTIONS.length) * 100).toFixed(2)}%)`)
console.log('')
for (const [k, v] of hits) console.log(`${k}: ${v}`)
