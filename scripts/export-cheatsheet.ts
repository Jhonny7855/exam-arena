import { writeFileSync } from 'node:fs'
import { CHEATSHEET_BY_SUBJECT } from '../src/data/cheatsheet.ts'
import { SUBJECTS } from '../src/data/subjects.ts'

const lines: string[] = []
lines.push('# EXAM ARENA — Cheatsheet')
lines.push('')
lines.push('Every formula and trap below is mirrored inside the app at `/cheatsheet`.')
lines.push('Generated from `src/data/cheatsheet.ts` — run `npx vite-node scripts/export-cheatsheet.ts` after editing it.')
lines.push('')

for (const subject of SUBJECTS) {
  const sections = CHEATSHEET_BY_SUBJECT[subject.id]
  const formulas = sections.reduce((n, s) => n + s.formulas.length, 0)
  const traps = sections.reduce((n, s) => n + s.traps.length, 0)

  lines.push(`## ${subject.code} — ${subject.name}`)
  lines.push('')
  lines.push(`${sections.length} units · ${formulas} formulas · ${traps} exam traps`)
  lines.push('')

  for (const section of sections) {
    lines.push(`### Unit ${section.unit} · ${section.title}`)
    lines.push('')
    lines.push('| Concept | Formula | Note |')
    lines.push('| --- | --- | --- |')
    for (const f of section.formulas) {
      lines.push(`| ${f.label} | \`${f.formula.replace(/\|/g, '\\|')}\` | ${f.note.replace(/\|/g, '\\|')} |`)
    }
    lines.push('')
    if (section.traps.length) {
      lines.push('**Exam traps**')
      lines.push('')
      for (const t of section.traps) lines.push(`- ${t}`)
      lines.push('')
    }
  }
}

const out = lines.join('\n')
writeFileSync(new URL('../CHEATSHEET.md', import.meta.url), out, 'utf8')
console.log(`Wrote CHEATSHEET.md (${out.length} chars)`)
