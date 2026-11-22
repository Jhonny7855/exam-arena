import type { Family } from './build'
import { comb, dedupeWrongs } from './build'
import { pick, randInt, type Rng } from '../../lib/rng'
import { runTM, type TM, type TMResult } from '../../lib/automata'

const BLANK = 'B'

const replaceA: TM = {
  states: ['q0', 'qa', 'qr'],
  tapeAlphabet: ['a', 'b', BLANK],
  blank: BLANK,
  start: 'q0',
  accept: 'qa',
  reject: 'qr',
  delta: {
    q0: {
      a: { write: 'b', move: 'R', next: 'q0' },
      b: { write: 'b', move: 'R', next: 'q0' },
      [BLANK]: { write: BLANK, move: 'R', next: 'qa' },
    },
  },
}

const increment: TM = {
  states: ['q0', 'q1', 'qa', 'qr'],
  tapeAlphabet: ['0', '1', BLANK],
  blank: BLANK,
  start: 'q0',
  accept: 'qa',
  reject: 'qr',
  delta: {
    q0: {
      '0': { write: '0', move: 'R', next: 'q0' },
      '1': { write: '1', move: 'R', next: 'q0' },
      [BLANK]: { write: BLANK, move: 'L', next: 'q1' },
    },
    q1: {
      '0': { write: '1', move: 'R', next: 'qa' },
      '1': { write: '0', move: 'L', next: 'q1' },
      [BLANK]: { write: '1', move: 'R', next: 'qa' },
    },
  },
}

const scanLeft: TM = {
  states: ['q0', 'q1', 'qa', 'qr'],
  tapeAlphabet: ['a', BLANK],
  blank: BLANK,
  start: 'q0',
  accept: 'qa',
  reject: 'qr',
  delta: {
    q0: {
      a: { write: 'a', move: 'L', next: 'q1' },
      [BLANK]: { write: BLANK, move: 'L', next: 'qa' },
    },
    q1: {
      a: { write: 'a', move: 'L', next: 'q1' },
      [BLANK]: { write: BLANK, move: 'R', next: 'qa' },
    },
  },
}

function readTape(result: TMResult, blank = BLANK): string {
  const cells = [...result.tape]
  let start = 0
  let end = cells.length
  while (start < end && cells[start] === blank) start++
  while (end > start && cells[end - 1] === blank) end--
  const core = cells.slice(start, end).join('')
  return core.length ? core : 'ε (all blank)'
}

function describeDelta(tm: TM): string {
  const rows: string[] = []
  for (const [state, row] of Object.entries(tm.delta)) {
    const parts = Object.entries(row).map(
      ([sym, m]) => `δ(${state}, ${sym === BLANK ? '␣' : sym}) = (${m.next}, ${m.write === BLANK ? '␣' : m.write}, ${m.move})`,
    )
    rows.push(parts.join('; '))
  }
  return rows.join('; ')
}

export const unit6Families: Family[] = [
  {
    id: 'u6-tm-final-tape',
    unit: 6,
    topic: 'Turing machine model',
    subtopic: 'Final tape content',
    difficulty: 'Medium',
    type: 'Application',
    count: 30,
    seconds: 80,
    tags: ['Turing machine', 'tape'],
    gen: (rng) => {
      const kind = randInt(rng, 0, 2)
      if (kind === 0) {
        const bits = Array.from({ length: randInt(rng, 2, 4) }, () => pick(rng, ['0', '1'])).join('')
        const result = runTM(increment, bits)
        const tape = readTape(result)
        const value = parseInt(bits, 2) + 1
        return {
          prompt: `A Turing machine implements binary increment: it moves right to the end of the number, then adds 1 with carry. Run on the tape "${bits}", what is the final tape content?`,
          correct: `"${tape}"`,
          wrong: [
            [`"${bits}"`, 'The machine adds 1, so the tape cannot be unchanged.'],
            [`"${(parseInt(bits, 2) + 2).toString(2)}"`, 'This adds 2 rather than 1, which corresponds to incrementing twice.'],
            [`"${(parseInt(bits, 2) - 1).toString(2)}"`, 'This subtracts 1, but the machine performs addition with carry.'],
          ],
          explanation: `Reading "${bits}" as binary gives ${parseInt(bits, 2)}; adding 1 yields ${value}, which in binary is "${value.toString(2)}". The machine realises this by flipping trailing 1s to 0 and turning the first 0 (or the blank before the number) into 1.`,
          hint: 'Binary increment flips trailing 1s to 0 and sets the next 0 to 1.',
          correctWhy: `Correct: ${parseInt(bits, 2)} + 1 = ${value} = "${tape}" in binary.`,
        }
      }
      if (kind === 1) {
        const n = randInt(rng, 2, 5)
        const input = 'a'.repeat(n)
        const result = runTM(replaceA, input)
        const tape = readTape(result)
        return {
          prompt: `A Turing machine has transitions ${describeDelta(replaceA)}. Starting on tape "${input}", what is the final tape content?`,
          correct: `"${tape}"`,
          wrong: [
            [`"${input}"`, 'The machine rewrites every a as b while scanning right, so the tape changes.'],
            [`"${'a'.repeat(n + 1)}"`, 'The machine never adds symbols; it only overwrites existing ones.'],
            [`"${'b'.repeat(n - 1)}"`, `All ${n} a symbols are rewritten, not ${n - 1}.`],
          ],
          explanation: `The machine scans right, rewriting a to b, and halts on the first blank. All ${n} a symbols become b, giving "${tape}".`,
          hint: 'Trace one symbol at a time; each a becomes b.',
          correctWhy: `Correct: every a is rewritten to b, giving "${tape}".`,
        }
      }
      const n = randInt(rng, 2, 5)
      const input = 'a'.repeat(n)
      const result = runTM(scanLeft, input)
      return {
        prompt: `A Turing machine moves left until it finds a blank cell, then halts. Starting at the leftmost symbol of tape "${input}", in which direction does the head finally move to halt?`,
        correct: 'Right, after moving left past the first cell into the blank.',
        wrong: [
          ['Left, continuing forever.', 'The machine halts as soon as it encounters a blank after moving left; it does not continue.'],
          ['It never halts.', 'The tape is blank to the left of position 0, so the machine finds a blank immediately and halts.'],
          ['It halts immediately without moving.', 'The start state moves left on every symbol, including a, so at least one move occurs.'],
        ],
        explanation: `The machine moves left across the ${n} a symbols, reaches the blank cell at position −1, and halts there after stepping right onto the last a. The tape content is unchanged: "${readTape(result)}".`,
        hint: 'The tape is blank outside the written region.',
        correctWhy: 'Correct: it steps left into the blank then halts, having moved right one final step.',
      }
    },
  },
  {
    id: 'u6-tm-steps',
    unit: 6,
    topic: 'Turing machine model',
    subtopic: 'Counting computation steps',
    difficulty: 'Medium',
    type: 'Computation',
    count: 26,
    seconds: 70,
    tags: ['Turing machine', 'steps'],
    gen: (rng) => {
      const n = randInt(rng, 2, 6)
      const input = 'a'.repeat(n)
      const result = runTM(replaceA, input)
      const steps = result.steps
      const pool: [string, string][] = [
        [`${n}`, `This counts only the ${n} rewrite steps and omits the final step that reads the blank and enters the accepting state.`],
        [`${n + 2}`, `This adds one step too many; the machine halts on the blank read, it does not move past it first.`],
        [`${2 * n}`, `Each cell is visited once, so the total is ${steps}, not ${2 * n}.`],
        [`${steps + 1}`, `This is one step beyond halting; the machine stops as soon as it enters the accepting state.`],
        [`${Math.max(1, steps - 1)}`, `This is one step short: the halting step that reads the blank is part of the count.`],
        [`${n - 1}`, `This omits both the final rewrite and the halting step, so it is two short of ${steps}.`],
        [`${steps * 2}`, `Doubling counts each tape cell twice, but the head moves strictly right and never revisits a cell.`],
        [`${n + 3}`, `This adds two steps past halting; nothing happens after the blank is read.`],
      ]
      return {
        prompt: `A Turing machine scans right over "${input}", rewriting every a as b, and halts on the first blank cell. How many steps does it take before halting?`,
        correct: `${steps}`,
        wrong: dedupeWrongs(`${steps}`, pool, 3),
        explanation: `The machine performs one step per a symbol (${n} steps) plus one final step reading the blank to halt, for ${steps} steps in total.`,
        hint: 'Count one step per symbol plus the halting step.',
        correctWhy: `Correct: ${n} rewrites plus one halting step equals ${steps}.`,
      }
    },
  },
  {
    id: 'u6-tm-head',
    unit: 6,
    topic: 'Turing machine model',
    subtopic: 'Head movement',
    difficulty: 'Easy',
    type: 'Application',
    count: 22,
    seconds: 55,
    tags: ['Turing machine', 'head'],
    gen: (rng) => {
      const n = randInt(rng, 2, 5)
      const input = 'a'.repeat(n)
      const result = runTM(replaceA, input)
      const finalHead = result.head
      return {
        prompt: `A Turing machine starts with its head on the leftmost cell of "${input}" and moves right one cell per step until it reads a blank, then halts. At which tape position does the head halt if the leftmost cell is position 0?`,
        correct: `Position ${finalHead}`,
        wrong: [
          [`Position ${n - 1}`, `Position ${n - 1} holds the last a. The machine keeps moving right after reading it, so it halts one cell further.`],
          [`Position ${n}`, `Position ${n} would be the first blank, but the machine moves right after reading the blank only if its transition says so. Here it halts on the blank.`],
          [`Position 0`, 'The head moves right on every symbol, so it cannot remain at the start.'],
        ],
        explanation: `The written region occupies positions 0 to ${n - 1}. The head advances one cell per symbol and halts upon reading the blank at position ${finalHead}, without moving further.`,
        hint: 'The blank cell immediately follows the written region.',
        correctWhy: `Correct: the head halts at position ${finalHead}.`,
      }
    },
  },
  {
    id: 'u6-halting',
    unit: 6,
    topic: 'Halting and looping',
    subtopic: 'The halting problem',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 26,
    seconds: 65,
    tags: ['halting problem', 'undecidability'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'What is the status of the halting problem?',
          a: 'It is undecidable: no Turing machine can decide for every machine-input pair whether the machine halts.',
          wrongs: [
            ['It is decidable but computationally expensive.', 'No algorithm exists at all, regardless of cost; the problem is undecidable, not merely slow.'],
            ['It is decidable for all machines except universal ones.', 'The undecidability applies to the general problem; restricting to universal machines does not make it decidable.'],
            ['It is decidable because we can simulate the machine.', 'Simulation only confirms halting when it happens; if the machine loops, simulation never terminates.'],
          ],
        },
        {
          q: 'Why does simulating a machine fail to decide halting?',
          a: 'Because if the simulated machine loops, the simulator also runs forever and never reports a verdict.',
          wrongs: [
            ['Because simulation is not a valid proof technique.', 'Simulation is perfectly valid when it halts; the problem is the non-halting case.'],
            ['Because the simulator needs more memory than the simulated machine.', 'Memory is unbounded in the model; the obstacle is divergence, not memory.'],
            ['Because simulation only works for deterministic machines.', 'Simulation works for nondeterministic machines too, via search; divergence remains the obstacle.'],
          ],
        },
        {
          q: 'What does the diagonalisation argument for the halting problem establish?',
          a: 'Assuming a decider H, one constructs a machine D that contradicts H on input ⟨D⟩, so no such H exists.',
          wrongs: [
            ['It shows that some machines halt and others do not.', 'That is an elementary observation; diagonalisation proves that no decider can exist.'],
            ['It shows the halting problem is in NP.', 'NP membership concerns verifiable certificates, not undecidability.'],
            ['It gives an algorithm for deciding halting on most inputs.', 'It proves no total decider exists, and gives no partial algorithm.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} This is the canonical undecidability result, and it underpins Rice's theorem and most later undecidability proofs via reduction.`,
        hint: 'Recall the diagonalisation construction and why simulation is not a decision procedure.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u6-rec-vs-re',
    unit: 6,
    topic: 'Recursive and recursively enumerable languages',
    subtopic: 'Decidable versus recognisable',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 26,
    seconds: 65,
    tags: ['recursive', 'RE', 'decidable'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'What is the relationship between recursive and recursively enumerable languages?',
          a: 'Every recursive language is RE, but not every RE language is recursive; the inclusion is strict.',
          wrongs: [
            ['The two classes are identical.', 'The halting problem is RE but not recursive, so the classes differ.'],
            ['Every RE language is recursive.', 'Recognisers may loop on non-members, so recognition does not give a decision procedure.'],
            ['Recursive languages are a strict superset of RE languages.', 'The inclusion goes the other way: recursive ⊆ RE.'],
          ],
        },
        {
          q: 'A language L is recursive if and only if which condition holds?',
          a: 'Both L and its complement are recursively enumerable.',
          wrongs: [
            ['L is recursively enumerable.', 'That is weaker; RE alone permits looping on non-members.'],
            ['L is finite.', 'Many infinite languages such as a* are recursive.'],
            ['L has a context-free grammar.', 'Context-free languages are recursive, but recursion covers far more, including all decidable problems.'],
          ],
        },
        {
          q: 'The complement of the halting problem is which of the following?',
          a: 'Not recursively enumerable.',
          wrongs: [
            ['Recursively enumerable but not recursive.', 'That describes the halting problem itself, not its complement.'],
            ['Recursive.', 'If both the halting problem and its complement were RE, halting would be recursive, which it is not.'],
            ['Context-free.', 'Context-free languages are recursive, so this is impossible for an undecidable set.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} The key distinction is whether the machine must halt on every input (decider) or only on members (recogniser).`,
        hint: 'Distinguish "halts on every input" from "halts on members".',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u6-church-turing',
    unit: 6,
    topic: 'Church-Turing thesis',
    subtopic: 'Status of the thesis',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 22,
    seconds: 50,
    tags: ['Church-Turing', 'computability'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'What does the Church-Turing thesis assert?',
          a: 'Every effectively computable function is computable by a Turing machine.',
          wrongs: [
            ['Every Turing machine halts.', 'Halting is not guaranteed; TMs compute partial functions precisely because they may diverge.'],
            ['Turing machines are the fastest model of computation.', 'The thesis is about computability, not efficiency; other models can be faster by polynomial factors.'],
            ['All programming languages are equally expressive in practice.', 'That is a related informal observation, but the thesis itself identifies effective computability with Turing computability.'],
          ],
        },
        {
          q: 'Why can the Church-Turing thesis not be proved?',
          a: 'Because "effectively computable" is an informal notion, so the thesis links a formal model to an intuitive concept.',
          wrongs: [
            ['Because Turing machines are too complex to analyse.', 'The model is simple and thoroughly analysed; the obstacle is the informality of the left-hand notion.'],
            ['Because it was disproved by later models.', 'No model has ever exceeded Turing computability, which is why the thesis is universally accepted.'],
            ['Because it depends on the choice of tape alphabet.', 'Tape alphabet size does not affect computability, only encoding efficiency.'],
          ],
        },
        {
          q: 'Which of the following is evidence for the Church-Turing thesis?',
          a: 'Lambda calculus, recursive functions, and register machines all turn out to compute exactly the Turing-computable functions.',
          wrongs: [
            ['Turing machines are faster than all other models.', 'Speed is irrelevant, and the claim is not even true in general.'],
            ['Every language has a Turing machine that decides it.', 'That is false: undecidable languages exist.'],
            ['Quantum computers compute non-Turing-computable functions.', 'Quantum computers are believed to be Turing-computable, though possibly faster for some problems.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} The convergence of independently invented models on the same class of functions is the strongest available support.`,
        hint: 'Think about what the thesis connects and whether that connection can be formalised.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u6-utm',
    unit: 6,
    topic: 'Universal Turing machine',
    subtopic: 'Universal simulation',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 22,
    seconds: 60,
    tags: ['universal TM', 'simulation'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'What makes a universal Turing machine special?',
          a: 'It takes an encoding ⟨M, w⟩ and simulates machine M on input w, so one machine can compute any computable function.',
          wrongs: [
            ['It halts on every input.', 'A UTM halts exactly when the simulated machine halts, so it can loop.'],
            ['It has more states than any other machine.', 'Universality is about behaviour, not state count; a UTM is finite like any other machine.'],
            ['It can solve the halting problem.', 'If it could, the halting problem would be decidable, which it is not.'],
          ],
        },
        {
          q: 'Why is the universal Turing machine central to undecidability proofs?',
          a: 'Because it lets a machine reason about other machines, which enables diagonalisation and reductions.',
          wrongs: [
            ['Because it is the fastest Turing machine.', 'Efficiency is irrelevant to undecidability.'],
            ['Because it eliminates the need for encodings.', 'Encodings are exactly what the UTM relies on.'],
            ['Because it decides membership for all languages.', 'No machine can do that; the UTM simulates and may diverge.'],
          ],
        },
        {
          q: 'What does the input to a universal Turing machine look like?',
          a: 'An encoding of a machine description together with an encoding of the input string.',
          wrongs: [
            ['Just the input string, with the machine hard-wired.', 'Hard-wiring a single machine gives an ordinary TM, not a universal one.'],
            ['The set of all machines that halt.', 'That set is not computable and cannot be supplied as input.'],
            ['The output the simulated machine should produce.', 'Supplying the answer would trivialise simulation and is not part of the input.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} This is the formal basis of stored-program computation and of self-reference arguments.`,
        hint: 'Recall that a UTM reads a description of another machine.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u6-variants',
    unit: 6,
    topic: 'Turing machine variations',
    subtopic: 'Power of variants',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 22,
    seconds: 50,
    tags: ['TM variants', 'equivalence'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'How do multi-tape Turing machines compare with single-tape machines in power?',
          a: 'They recognise exactly the same languages, with only a polynomial simulation overhead.',
          wrongs: [
            ['They recognise strictly more languages.', 'Extra tapes add convenience and speed, not computability.'],
            ['They recognise strictly fewer languages.', 'A single-tape machine is a special case of a multi-tape machine.'],
            ['They are equivalent only for deterministic machines.', 'The equivalence holds for nondeterministic variants as well.'],
          ],
        },
        {
          q: 'A two-way infinite tape adds what to a Turing machine?',
          a: 'Convenience only: it can be simulated by a one-way infinite tape with a marker, so the language class is unchanged.',
          wrongs: [
            ['Strictly greater computing power.', 'The simulation shows no additional power, only a simpler description of some algorithms.'],
            ['The ability to decide the halting problem.', 'No tape geometry can overcome undecidability.'],
            ['A requirement for a larger tape alphabet.', 'The simulation can reuse the existing alphabet with a marker symbol.'],
          ],
        },
        {
          q: 'A nondeterministic Turing machine compares to a deterministic one how?',
          a: 'It accepts the same class of languages, since its computation tree can be searched breadth-first by a deterministic machine.',
          wrongs: [
            ['It accepts strictly more languages.', 'Nondeterminism changes complexity, not computability.'],
            ['It cannot be simulated by any deterministic machine.', 'Breadth-first simulation of the computation tree is a standard construction.'],
            ['It is equivalent only when it has a single accepting state.', 'The number of accepting states does not affect the equivalence.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} This robustness under variants is strong evidence for the Church-Turing thesis.`,
        hint: 'Ask whether the variant can be simulated by the standard model.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u6-config-notation',
    unit: 6,
    topic: 'Turing machine model',
    subtopic: 'Configuration notation',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 22,
    seconds: 55,
    tags: ['Turing machine', 'configuration'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'In the configuration notation αqβ, what does q indicate?',
          a: 'The current state, with the head positioned on the first symbol of β.',
          wrongs: [
            ['The accepting state, always.', 'q is whichever state the machine is currently in, not necessarily accepting.'],
            ['The symbol under the head.', 'The state appears between the tape segments; the symbol under the head is the first symbol of β.'],
            ['The number of steps taken.', 'Configurations record state, tape, and head position, not a step counter.'],
          ],
        },
        {
          q: 'What does a single TM step do?',
          a: 'Reads the symbol under the head, writes a new symbol, moves the head left or right, and changes state.',
          wrongs: [
            ['Reads the whole tape and rewrites it.', 'Only one cell is read and written per step.'],
            ['Moves the head without changing the tape.', 'A step always writes, even if the written symbol equals the old one.'],
            ['Changes state without moving the head.', 'The move direction is part of every transition.'],
          ],
        },
        {
          q: 'Why can a Turing machine compute only partial functions in general?',
          a: 'Because it may never halt on some inputs, leaving the function undefined there.',
          wrongs: [
            ['Because its tape is finite.', 'The tape is unbounded; the limitation is divergence, not storage.'],
            ['Because its alphabet is finite.', 'A finite alphabet is sufficient to encode any computable function.'],
            ['Because it has finitely many states.', 'Finiteness of states is essential to the model and does not prevent computing total functions.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} The configuration notation is the standard way to describe a computation step precisely.`,
        hint: 'Recall the shape of a TM transition: read, write, move, change state.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
]

function satisfies(clauses: number[][], assignment: number): boolean {
  return clauses.every((clause) => clause.some((lit) => {
    const idx = Math.abs(lit) - 1
    const bit = (assignment >> idx) & 1
    return lit > 0 ? bit === 1 : bit === 0
  }))
}

function countSat(clauses: number[][], vars: number): number {
  let count = 0
  for (let a = 0; a < Math.pow(2, vars); a++) if (satisfies(clauses, a)) count++
  return count
}

function hasVertexCover(edges: [number, number][], n: number, k: number): boolean {
  const subsets = Math.pow(2, n)
  for (let mask = 0; mask < subsets; mask++) {
    let bits = 0
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) bits++
    if (bits > k) continue
    const covered = edges.every(([u, v]) => ((mask >> u) & 1) === 1 || ((mask >> v) & 1) === 1)
    if (covered) return true
  }
  return false
}

function minVertexCover(edges: [number, number][], n: number): number {
  for (let k = 0; k <= n; k++) if (hasVertexCover(edges, n, k)) return k
  return n
}

function independentSets(edges: [number, number][], n: number, k: number): number {
  let count = 0
  for (let mask = 0; mask < Math.pow(2, n); mask++) {
    let bits = 0
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) bits++
    if (bits !== k) continue
    const ok = edges.every(([u, v]) => !(((mask >> u) & 1) === 1 && ((mask >> v) & 1) === 1))
    if (ok) count++
  }
  return count
}

function randomGraph(rng: Rng, n: number, density = 0.5): [number, number][] {
  const edges: [number, number][] = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rng() < density) edges.push([i, j])
  return edges
}

export const unit7Families: Family[] = [
  {
    id: 'u7-p-np-def',
    unit: 7,
    topic: 'Complexity classes P and NP',
    subtopic: 'Definitions',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 24,
    seconds: 50,
    tags: ['P', 'NP'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'What does the class P contain?',
          a: 'Decision problems solvable by a deterministic Turing machine in polynomial time.',
          wrongs: [
            ['Problems solvable by any machine, in any amount of time.', 'That would include undecidable problems; P is a strict complexity restriction.'],
            ['Problems whose solutions can be verified in polynomial time.', 'That characterises NP, not P.'],
            ['Problems requiring at most polynomial space.', 'That is PSPACE, a different and larger class.'],
          ],
        },
        {
          q: 'What does it mean for a problem to be in NP?',
          a: 'Yes-instances have a polynomial-size certificate verifiable in polynomial time by a deterministic machine.',
          wrongs: [
            ['The problem cannot be solved in polynomial time.', 'NP does not mean "not polynomial"; it means nondeterministic polynomial time.'],
            ['The problem requires exponential time to solve.', 'That is unknown for NP-complete problems and false for P ⊆ NP problems.'],
            ['Every instance of the problem has a polynomial-time algorithm.', 'That would place the problem in P, which is not implied by NP membership.'],
          ],
        },
        {
          q: 'What is the relationship between P and NP?',
          a: 'P ⊆ NP, and whether the inclusion is strict is the famous open P versus NP question.',
          wrongs: [
            ['NP ⊆ P, which is known to hold.', 'The known inclusion is the other direction.'],
            ['P and NP are known to be equal.', 'Equality is unknown and widely believed false.'],
            ['P and NP are known to be different.', 'Separation is also unknown; it is the central open problem.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} P captures efficiently solvable problems, while NP captures efficiently checkable ones.`,
        hint: 'Distinguish solving from verifying.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u7-npc-reduction',
    unit: 7,
    topic: 'NP-hard and NP-complete',
    subtopic: 'Reduction direction',
    difficulty: 'Hard',
    type: 'Proof',
    count: 26,
    seconds: 80,
    tags: ['NP-complete', 'reduction'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'To prove that a new problem X is NP-complete, which steps are required?',
          a: 'Show X ∈ NP, then reduce a known NP-complete problem to X in polynomial time.',
          wrongs: [
            ['Reduce X to a known NP-complete problem in polynomial time.', 'That shows X is no harder than the known problem, which proves nothing about X being NP-complete.'],
            ['Show X ∈ NP and reduce X to SAT.', 'Reducing X to SAT only shows X is in NP at best; the reduction must go from a known hard problem to X.'],
            ['Show X is decidable and has no polynomial-time algorithm.', 'Non-existence of a polynomial algorithm is usually unproven and is not part of the definition.'],
          ],
        },
        {
          q: 'What does A ≤p B together with B ∈ P imply?',
          a: 'A ∈ P, because the reduction plus the polynomial algorithm for B gives a polynomial algorithm for A.',
          wrongs: [
            ['B ∈ P is contradicted, so B must be NP-hard.', 'A reduction does not transfer hardness backwards from a polynomial-time problem.'],
            ['Nothing, because reductions only work between NP-complete problems.', 'Reductions apply to any pair of problems and are used precisely to transfer tractability and hardness.'],
            ['A is NP-hard.', 'Tractability transfers downward through reductions, not hardness.'],
          ],
        },
        {
          q: 'What does it mean for a problem to be NP-hard but not NP-complete?',
          a: 'Every NP problem reduces to it, but it is not itself in NP — it may be undecidable.',
          wrongs: [
            ['It is in NP but has no known polynomial algorithm.', 'That describes NP-complete problems whose status is open, not NP-hard problems outside NP.'],
            ['It is easier than all NP problems.', 'NP-hardness means at least as hard as every NP problem.'],
            ['It is in P but not in NP.', 'P ⊆ NP, so this combination is impossible.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} The direction of the reduction is the most common source of errors in NP-completeness proofs.`,
        hint: 'Hardness must flow from the known problem into the new problem.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u7-vertex-cover',
    unit: 7,
    topic: 'NP-hard and NP-complete',
    subtopic: 'Computing on a small instance',
    difficulty: 'Hard',
    type: 'Computation',
    count: 24,
    seconds: 90,
    tags: ['vertex cover', 'NP-complete'],
    gen: (rng) => {
      const n = 5
      let edges = randomGraph(rng, n, 0.45)
      while (edges.length < 4) edges = randomGraph(rng, n, 0.45)
      const size = minVertexCover(edges, n)
      const edgeText = edges.map(([u, v]) => `(${u + 1},${v + 1})`).join(', ')
      return {
        prompt: `Consider the undirected graph with vertices {1, 2, 3, 4, 5} and edges {${edgeText}}. What is the size of a minimum vertex cover?`,
        correct: `${size}`,
        wrong: [
          [`${size + 1}`, `A cover of size ${size} exists, so ${size + 1} is not minimal.`],
          [`${Math.max(1, size - 1)}`, `No cover of size ${size - 1} covers all ${edges.length} edges; the minimum is ${size}.`],
          [`${edges.length}`, `${edges.length} counts edges, not vertices. A vertex can cover several edges at once.`],
        ],
        explanation: `Checking covers by increasing size, the smallest set of vertices touching every edge has size ${size}. Vertex cover is NP-complete in general, but small instances are decidable by exhaustive search over subsets.`,
        hint: 'Try covering the highest-degree vertices first, then check whether all edges are covered.',
        correctWhy: `Correct: the minimum vertex cover has size ${size}.`,
      }
    },
  },
  {
    id: 'u7-sat-count',
    unit: 7,
    topic: 'Complexity classes P and NP',
    subtopic: 'Certificates and satisfying assignments',
    difficulty: 'Hard',
    type: 'Computation',
    count: 24,
    seconds: 85,
    tags: ['SAT', 'NP', 'certificate'],
    gen: (rng) => {
      const vars = 3
      const clauses: number[][] = []
      let guard = 0
      while (clauses.length < 3 && guard < 200) {
        guard += 1
        const clause: number[] = []
        let clauseGuard = 0
        while (clause.length < 3 && clauseGuard < 60) {
          clauseGuard += 1
          const v = randInt(rng, 1, vars)
          const lit = rng() < 0.5 ? v : -v
          if (clause.includes(lit) || clause.includes(-lit)) continue
          clause.push(lit)
        }
        if (clause.length < 3) continue
        const key = [...clause].sort((a, b) => a - b).join(',')
        if (clauses.some((c) => [...c].sort((a, b) => a - b).join(',') === key)) continue
        clauses.push(clause)
      }
      if (clauses.length < 3) return { prompt: '', correct: '', wrong: [], explanation: '' }
      const count = countSat(clauses, vars)
      const clauseText = clauses.map((c) => `(${c.map((l) => (l > 0 ? `x${l}` : `¬x${-l}`)).join(' ∨ ')})`).join(' ∧ ')
      const why = new Map<number, string>()
      const note = (v: number, text: string) => {
        if (v < 0 || v > 8 || v === count) return
        if (!why.has(v)) why.set(v, text)
      }
      note(8 - count, `There are ${8 - count} unsatisfying assignments, so ${8 - count} is the complement of the requested count.`)
      note(8, 'All 8 assignments would satisfy the formula only if no clause excluded any; each clause rules at least one assignment out.')
      note(0, 'Zero would mean the formula is unsatisfiable, but enumerating the 8 assignments shows it is not.')
      note(4, 'Four is just the midpoint of 0 through 8; it is not derived from the clause structure.')
      note(count + 1, `This adds one assignment beyond the ${count} that satisfy the formula.`)
      note(count - 1, `This drops one of the ${count} satisfying assignments.`)
      note(count + 2, `This adds two assignments that the clauses exclude.`)
      note(count - 2, `This omits two satisfying assignments.`)
      note(2 * count, `Doubling assumes every satisfying assignment pairs with a distinct partner, which the clause structure does not guarantee.`)
      note(Math.floor(count / 2), 'Halving divides out a symmetry that does not exist between satisfying assignments.')
      note(count + 3, `This adds three assignments that the clauses exclude.`)
      note(count - 3, `This omits three satisfying assignments.`)
      const pool: [string, string][] = [...why.entries()].map(([v, text]) => [`${v}`, text])
      return {
        prompt: `Consider the 3-CNF formula ${clauseText} over variables x1, x2, x3. How many of the 8 total assignments satisfy it?`,
        correct: `${count}`,
        wrong: dedupeWrongs(`${count}`, pool, 3),
        explanation: `Enumerating all 2³ = 8 assignments and testing each clause gives ${count} satisfying assignment${count === 1 ? '' : 's'}. A satisfying assignment is exactly the polynomial-size certificate that places SAT in NP.`,
        hint: 'Enumerate the 8 assignments and check every clause.',
        correctWhy: `Correct: exactly ${count} of the 8 assignments satisfy the formula.`,
      }
    },
  },
  {
    id: 'u7-primitive-recursive',
    unit: 7,
    topic: 'Primitive recursive functions',
    subtopic: 'Limits of primitive recursion',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 22,
    seconds: 60,
    tags: ['primitive recursive', 'computability'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'Which function is computable but not primitive recursive?',
          a: "Ackermann's function, which grows faster than any primitive recursive function.",
          wrongs: [
            ['Addition.', 'Addition is defined by primitive recursion from successor.'],
            ['Exponentiation.', 'Exponentiation is primitive recursive, obtained by iterated multiplication.'],
            ['The nth prime.', 'The prime-indexing function is primitive recursive, though it requires bounded search.'],
          ],
        },
        {
          q: 'Why do primitive recursive functions always terminate?',
          a: 'Because they are built only from composition and primitive recursion, both of which decrease a well-founded measure.',
          wrongs: [
            ['Because they cannot call themselves.', 'Primitive recursion is a restricted form of self-reference that always terminates.'],
            ['Because they operate on finite domains.', 'They are defined on all natural numbers, an infinite domain.'],
            ['Because they use bounded minimisation.', 'Bounded minimisation preserves termination but is not the only reason; the recursion scheme itself guarantees it.'],
          ],
        },
        {
          q: 'Which operation takes primitive recursive functions outside the primitive recursive class?',
          a: 'Unbounded minimisation, which searches for a value without a known upper bound and may diverge.',
          wrongs: [
            ['Composition.', 'Composition preserves primitive recursiveness.'],
            ['Primitive recursion.', 'That is one of the two defining schemes of the class.'],
            ['Bounded minimisation.', 'Bounded search terminates by construction and stays within the class.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} This separation shows that "always terminates" is a strictly narrower requirement than "computable".`,
        hint: 'Think about which construction removes the guarantee of termination.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u7-cfl-decidable',
    unit: 7,
    topic: 'Decidability and undecidability',
    subtopic: 'Decidability of grammar problems',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 24,
    seconds: 65,
    tags: ['decidability', 'CFG'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'Which problem about context-free grammars is undecidable?',
          a: 'Whether a given CFG is ambiguous.',
          wrongs: [
            ['Whether a given string is generated by a CFG.', 'Membership is decidable, for example by CYK in O(n³) time.'],
            ['Whether a given CFG generates the empty language.', 'Emptiness is decidable by checking reachability of terminals from the start symbol.'],
            ['Whether two given CFGs generate the same language.', 'Equivalence of CFGs is actually decidable, unlike for general grammars.'],
          ],
        },
        {
          q: 'Is the emptiness problem for Turing machines decidable?',
          a: 'No, it is undecidable whether a given TM accepts any string at all.',
          wrongs: [
            ['Yes, by simulating on all inputs in parallel.', 'Dovetailing can enumerate accepted strings but cannot conclude that none exist.'],
            ['Yes, because the language is recursively enumerable.', 'RE membership does not give a decision procedure for emptiness.'],
            ['Yes, because TMs have finitely many states.', 'Finiteness of states does not bound the set of accepted strings.'],
          ],
        },
        {
          q: 'What does Rice\'s theorem state?',
          a: 'Every non-trivial semantic property of programs is undecidable.',
          wrongs: [
            ['Every syntactic property of programs is undecidable.', 'Syntactic properties are usually decidable by inspection; the theorem concerns semantic behaviour.'],
            ['Every property of Turing machines is undecidable.', 'Trivial properties such as "has at least one state" are decidable.'],
            ['Only the halting problem is undecidable.', 'Rice\'s theorem generalises undecidability to a whole class of properties.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} Decidability depends on the property: membership and emptiness for CFGs are decidable, while ambiguity and most TM properties are not.`,
        hint: 'Separate syntactic checks from questions about the language or behaviour.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u7-partial-total',
    unit: 7,
    topic: 'Partial and total functions',
    subtopic: 'Partial computability',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 22,
    seconds: 55,
    tags: ['partial functions', 'total functions'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'Why do Turing machines naturally compute partial functions?',
          a: 'Because a machine may diverge on some inputs, leaving the function undefined for those inputs.',
          wrongs: [
            ['Because the tape is bounded.', 'The tape is unbounded; divergence is the source of partiality.'],
            ['Because the transition function may be partial.', 'Standard TMs have a total transition function; the partiality comes from non-halting.'],
            ['Because inputs may be infinite.', 'Inputs are finite strings; the machine, not the input, causes divergence.'],
          ],
        },
        {
          q: 'What is the domain of the partial function computed by a Turing machine?',
          a: 'The set of inputs on which the machine halts.',
          wrongs: [
            ['The set of all strings over the input alphabet.', 'That would make the function total, which is not generally true.'],
            ['The set of inputs the machine rejects.', 'Rejecting still halts, so rejecting inputs are in the domain.'],
            ['The set of states the machine visits.', 'States are part of the machine, not of the function domain.'],
          ],
        },
        {
          q: 'Is the set of total computable functions effectively enumerable?',
          a: 'No: one cannot effectively list exactly the machines that halt on every input.',
          wrongs: [
            ['Yes, by filtering all machines for those that halt everywhere.', 'That filter requires deciding halting on every input, which is undecidable.'],
            ['Yes, because every computable function is total.', 'Computable functions may be partial, and totality is not decidable.'],
            ['Yes, since there are countably many machines.', 'Countability alone does not make the set effectively enumerable.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} The distinction between partial and total computability is what separates recognition from decision.`,
        hint: 'Ask what happens to the machine on inputs outside the function domain.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u7-independent-sets',
    unit: 7,
    topic: 'NP-hard and NP-complete',
    subtopic: 'Counting structures in a graph',
    difficulty: 'Hard',
    type: 'Computation',
    count: 22,
    seconds: 90,
    tags: ['independent set', 'combinatorics'],
    gen: (rng) => {
      const n = 5
      let edges = randomGraph(rng, n, 0.4)
      while (edges.length < 3) edges = randomGraph(rng, n, 0.4)
      const k = 2
      const count = independentSets(edges, n, k)
      const edgeText = edges.map(([u, v]) => `(${u + 1},${v + 1})`).join(', ')
      const seen = new Set<string>([String(count)])
      const wrongs: [string, string][] = []
      const push = (value: number, why: string) => {
        if (value < 0 || wrongs.length >= 3) return
        const text = String(value)
        if (seen.has(text)) return
        seen.add(text)
        wrongs.push([text, why])
      }
      push(comb(n, k), `C(5,2) = ${comb(n, k)} counts all pairs, but some pairs are edges and therefore not independent.`)
      push(count - 1, `This misses one valid pair; checking each of the 10 pairs against the edge list gives ${count}.`)
      push(edges.length, `${edges.length} counts edges, not independent pairs.`)
      push(count + 1, `This counts one invalid pair; the enumeration against the edge list gives ${count}.`)
      push(comb(n, k) + 1, `There are only C(5,2) = ${comb(n, k)} candidate pairs in total, so this is impossible.`)
      push(count + 2, `This overcounts; exactly ${count} pairs have no edge between them.`)
      return {
        prompt: `For the graph on vertices {1, 2, 3, 4, 5} with edges {${edgeText}}, how many independent sets of size exactly 2 are there?`,
        correct: `${count}`,
        wrong: wrongs,
        explanation: `There are C(5,2) = 10 candidate pairs. Removing the ${edges.length} pairs that are edges leaves ${count} independent pairs. Independent set is NP-complete in general, so small instances are handled by enumeration.`,
        hint: 'List all 10 pairs and discard those that are edges.',
        correctWhy: `Correct: ${count} pairs have no edge between them.`,
      }
    },
  },
]
