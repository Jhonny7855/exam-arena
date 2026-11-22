import type { Difficulty, QuestionType, SubjectId, UnitId } from '../../types'
import type { Draft } from './types'
import { shuffle, type Rng } from '../../lib/rng'

export interface Gen {
  prompt: string
  correct: string
  wrong: [string, string][]
  explanation: string
  hint?: string
  correctWhy?: string
}

export interface Family {
  id: string
  subject?: SubjectId
  unit: UnitId
  topic: string
  subtopic: string
  difficulty: Difficulty
  type: QuestionType
  count: number
  seconds?: number
  tags?: string[]
  gen: (rng: Rng) => Gen
}

const NUMERIC_TRAPS: { offset: (v: number) => number; why: (v: number) => string }[] = [
  {
    offset: (v) => v + 1,
    why: (v) => `Off by one: this is one more than the true count of ${num(v)}. Recount the objects without adding a boundary case that the definition does not include.`,
  },
  {
    offset: (v) => v - 1,
    why: (v) => `Off by one: this is one fewer than the true count of ${num(v)}. A case was dropped — check whether the empty case or the whole object is excluded by mistake.`,
  },
  {
    offset: (v) => v * 2,
    why: (v) => `This is exactly twice the correct value of ${num(v)}, the signature of counting each object twice — typically by treating an unordered choice as ordered.`,
  },
  {
    offset: (v) => Math.floor(v / 2),
    why: (v) => `This is about half of the correct value ${num(v)}, which happens when a symmetry is divided out that does not actually exist here.`,
  },
  {
    offset: (v) => v + 2,
    why: (v) => `This overshoots the correct value ${num(v)} by two, a sign that extra cases were added that the stated constraints exclude.`,
  },
]

export function numericFillers(correct: string): [string, string][] {
  const cleaned = correct.replace(/,/g, '')
  if (!/^\d{1,7}$/.test(cleaned)) return []
  const value = Number(cleaned)
  const out: [string, string][] = []
  for (const trap of NUMERIC_TRAPS) {
    const c = trap.offset(value)
    if (c < 0 || c === value) continue
    out.push([num(c), trap.why(value)])
  }
  return out
}

const FILLERS: [string, string][] = [  [
    'None of the above',
    'One of the listed options is the correct answer, so "none of the above" cannot be right here.',
  ],
  [
    'Cannot be determined from the given information',
    'The stated data is sufficient; the answer follows directly from the definitions and the values given in the question.',
  ],
  [
    'The result depends on how the objects are named',
    'Renaming states, symbols or variables never changes the underlying result, so the answer is independent of the notation used.',
  ],
  [
    'No such object exists',
    'The object described does exist and is constructible as stated, so this option is incorrect.',
  ],
]

export function makeDraft(f: Family, g: Gen, rng: Rng): Draft | null {
  const correct = g.correct.trim()
  if (!correct) return null
  const seen = new Set([correct])
  const wrongs: [string, string][] = []
  for (const w of g.wrong) {
    const text = String(w[0] ?? '').trim()
    const why = String(w[1] ?? '').trim()
    if (!text || !why || seen.has(text)) continue
    seen.add(text)
    wrongs.push([text, why])
  }

  for (const [text, why] of numericFillers(correct)) {
    if (wrongs.length >= 3) break
    if (seen.has(text)) continue
    seen.add(text)
    wrongs.push([text, why])
  }

  for (const [text, why] of FILLERS) {
    if (wrongs.length >= 3) break
    if (seen.has(text)) continue
    seen.add(text)
    wrongs.push([text, why])
  }

  if (wrongs.length < 3) return null

  const picked = wrongs.slice(0, 3)
  const entries = shuffle(rng, [
    { text: correct, why: g.correctWhy ?? `This is the correct answer. ${g.explanation}`, ok: true },
    ...picked.map(([text, why]) => ({ text, why, ok: false })),
  ])

  const correctAnswer = entries.findIndex((e) => e.ok)
  if (correctAnswer < 0) return null

  return {
    subject: f.subject ?? 'tafl',
    unit: f.unit,
    topic: f.topic,
    subtopic: f.subtopic,
    difficulty: f.difficulty,
    type: f.type,
    question: g.prompt.trim(),
    options: entries.map((e) => e.text) as [string, string, string, string],
    correctAnswer: correctAnswer as 0 | 1 | 2 | 3,
    explanation: g.explanation.trim(),
    optionExplanations: entries.map((e) => e.why) as [string, string, string, string],
    hint: (g.hint ?? '').trim(),
    tags: f.tags ?? [f.topic],
    estimatedSeconds: f.seconds ?? 60,
  }
}

export function num(n: number): string {
  return n.toLocaleString('en-US')
}

export function dedupeWrongs(
  correct: string,
  pool: readonly [string, string][],
  limit = 3,
): [string, string][] {
  const target = correct.trim()
  const seen = new Set([target])
  const out: [string, string][] = []
  for (const [rawText, rawWhy] of pool) {
    if (out.length >= limit) break
    const text = String(rawText ?? '').trim()
    const why = String(rawWhy ?? '').trim()
    if (!text || !why || seen.has(text)) continue
    seen.add(text)
    out.push([text, why])
  }
  return out
}

export function pickWrongs(
  correct: string,
  pool: readonly [string, string][],
  rng: Rng,
  limit = 3,
): [string, string][] {
  return dedupeWrongs(correct, shuffle(rng, pool), limit)
}

export function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return Math.round(r)
}

export function fact(n: number): number {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

export function perm(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 0; i < k; i++) r *= n - i
  return r
}

export function surj(n: number, m: number): number {
  let total = 0
  for (let j = 0; j <= m; j++) total += (j % 2 === 0 ? 1 : -1) * comb(m, j) * Math.pow(m - j, n)
  return Math.round(total)
}

export function pow(n: number, e: number): number {
  return Math.pow(n, e)
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}
