import type { Family } from './build'
import { num, dedupeWrongs } from './build'
import { pick, randInt, shuffle, type Rng } from '../../lib/rng'
import {
  runDFA,
  runNFA,
  subsetConstruction,
  minimizeDFA,
  epsClosure,
  fmtSet,
  allStrings,
  type DFA,
  type NFA,
} from '../../lib/automata'

const A = ['a', 'b']

function modDFA(k: number, symbol = 'a'): DFA {
  const states = Array.from({ length: k }, (_, i) => `q${i}`)
  const delta: Record<string, Record<string, string>> = {}
  for (let i = 0; i < k; i++) {
    delta[`q${i}`] = {
      a: `q${(i + (symbol === 'a' ? 1 : 0)) % k}`,
      b: symbol === 'b' ? `q${(i + 1) % k}` : `q${i}`,
    }
  }
  return { states, alphabet: A, start: 'q0', finals: ['q0'], delta }
}

function suffixDFA(pattern: string): DFA {
  const states: string[] = []
  for (let i = 0; i <= pattern.length; i++) states.push(`s${i}`)
  const delta: Record<string, Record<string, string>> = {}
  for (let i = 0; i <= pattern.length; i++) {
    delta[`s${i}`] = {}
    for (const a of A) {
      const prefix = pattern.slice(0, Math.min(i, pattern.length)) + a
      let best = 0
      for (let len = Math.min(pattern.length, prefix.length); len >= 0; len--) {
        if (prefix.endsWith(pattern.slice(0, len))) {
          best = len
          break
        }
      }
      delta[`s${i}`][a] = `s${best}`
    }
  }
  return { states, alphabet: A, start: 's0', finals: [`s${pattern.length}`], delta }
}

function containsDFA(pattern: string): DFA {
  const states: string[] = []
  for (let i = 0; i <= pattern.length; i++) states.push(`t${i}`)
  const delta: Record<string, Record<string, string>> = {}
  for (let i = 0; i <= pattern.length; i++) {
    delta[`t${i}`] = {}
    for (const a of A) {
      if (i === pattern.length) {
        delta[`t${i}`][a] = `t${pattern.length}`
        continue
      }
      const cand = pattern.slice(0, i) + a
      let best = 0
      for (let len = Math.min(pattern.length, cand.length); len >= 0; len--) {
        if (cand.endsWith(pattern.slice(0, len))) {
          best = len
          break
        }
      }
      delta[`t${i}`][a] = `t${best}`
    }
  }
  return { states, alphabet: A, start: 't0', finals: [`t${pattern.length}`], delta }
}

function parityDFA(letter: string, even: boolean): DFA {
  return {
    states: ['even', 'odd'],
    alphabet: A,
    start: 'even',
    finals: [even ? 'even' : 'odd'],
    delta: {
      even: { a: letter === 'a' ? 'odd' : 'even', b: letter === 'b' ? 'odd' : 'even' },
      odd: { a: letter === 'a' ? 'even' : 'odd', b: letter === 'b' ? 'even' : 'odd' },
    },
  }
}

function describeDFA(dfa: DFA, maxLen = 4): string {
  const accepted = allStrings(dfa.alphabet, maxLen).filter((s) => runDFA(dfa, s).accepted)
  return accepted.length ? accepted.map((s) => (s === '' ? 'ε' : s)).join(', ') : 'nothing'
}

function randomNFA(rng: Rng, stateCount: number, useEps: boolean): NFA {
  const states = Array.from({ length: stateCount }, (_, i) => `p${i}`)
  const delta: Record<string, Record<string, string[]>> = {}
  const eps: Record<string, string[]> = {}
  for (const s of states) {
    delta[s] = { a: [], b: [] }
    eps[s] = []
  }
  for (const s of states) {
    for (const a of A) {
      const count = randInt(rng, 0, 2)
      for (let i = 0; i < count; i++) {
        const t = pick(rng, states)
        if (!delta[s][a].includes(t)) delta[s][a].push(t)
      }
    }
    if (useEps && rng() < 0.4) {
      const t = pick(rng, states)
      if (t !== s) eps[s].push(t)
    }
  }
  const finals = shuffle(rng, states).slice(0, randInt(rng, 1, 2))
  return { states, alphabet: A, start: states[0], finals, delta, eps }
}

export const unit3Families: Family[] = [
  {
    id: 'u3-dfa-trace',
    unit: 3,
    topic: 'DFA fundamentals',
    subtopic: 'State tracing',
    difficulty: 'Easy',
    type: 'Application',
    count: 34,
    seconds: 60,
    tags: ['DFA', 'tracing'],
    gen: (rng) => {
      const kind = randInt(rng, 0, 2)
      let dfa: DFA
      let desc = ''
      if (kind === 0) {
        const k = randInt(rng, 3, 5)
        dfa = modDFA(k)
        desc = `the DFA that counts a symbols modulo ${k} (states q0 … q${k - 1}, start and final state q0, with b symbols leaving every state unchanged)`
      } else if (kind === 1) {
        const pat = pick(rng, ['ab', 'ba', 'aa', 'bb'])
        dfa = suffixDFA(pat)
        desc = `the DFA that accepts strings ending in "${pat}" (states s0 … s${pat.length}, where s${pat.length} is final)`
      } else {
        const letter = pick(rng, ['a', 'b'])
        const even = rng() < 0.5
        dfa = parityDFA(letter, even)
        desc = `the DFA that accepts strings with an ${even ? 'even' : 'odd'} number of ${letter} symbols (two states, ${even ? 'even' : 'odd'} being final)`
      }
      const inputs = allStrings(A, 5).filter((s) => s.length >= 2)
      const varying = inputs.filter((s) => new Set(runDFA(dfa, s).path).size > 1)
      const input = pick(rng, varying.length ? varying : inputs)
      const result = runDFA(dfa, input)
      const finalState = result.path[result.path.length - 1]
      const pathText = result.path.join(' → ')
      const correctRun = result.path.join('→')

      const pool: [string, string][] = []
      const addRun = (run: string[], why: string) => {
        const text = run.join('→')
        if (!text || text === correctRun) return
        if (pool.some(([t]) => t === text)) return
        pool.push([text, why])
      }

      const shorter = input.slice(0, -1)
      if (shorter.length) addRun(runDFA(dfa, shorter).path, `This run stops one symbol early, after "${shorter}", so it is one state short of the full trace.`)
      if (input.length > 1) addRun(runDFA(dfa, input.slice(1)).path, `This run skips the first symbol and starts from "${input.slice(1)}", so the initial transition is missing.`)
      addRun(runDFA(dfa, [...input].reverse().join('')).path, `This run reads the reversed string "${[...input].reverse().join('')}" rather than "${input}".`)
      addRun(runDFA(dfa, input + input[0]).path, `This run reads one symbol too many, continuing past the end of "${input}".`)
      addRun(runDFA(dfa, input.slice(0, 1)).path, `This run only processes the first symbol, leaving ${input.length - 1} symbols unread.`)
      addRun([...result.path].reverse(), `This reverses the order of the states. The trace must follow the input left to right, not backwards.`)
      for (const flipped of ['a', 'b']) {
        if (flipped === input[input.length - 1]) continue
        const mutated = input.slice(0, -1) + flipped
        addRun(runDFA(dfa, mutated).path, `This run corresponds to the different string "${mutated}"; the final transition depends on the last symbol of "${input}".`)
      }
      for (const s of dfa.states) {
        addRun([dfa.start, s], `This claims the machine jumps straight from ${dfa.start} to ${s}, skipping the intermediate transitions of ${pathText}.`)
      }
      for (const s of dfa.states) {
        addRun([...result.path.slice(0, -1), s], `This ends the run in ${s} instead of ${finalState}, which is what the final transition of "${input}" actually yields.`)
      }

      return {
        prompt: `For ${desc}, trace the input string "${input}" from the start state. Which sequence of states does the machine pass through (start state first, one state per symbol read)?`,
        correct: correctRun,
        wrong: dedupeWrongs(correctRun, pool, 3),
        explanation: `Following the transitions symbol by symbol: ${pathText}. The run visits ${result.path.length} states and ends in ${finalState}, so the string is ${result.accepted ? 'accepted' : 'rejected'}.`,
        hint: 'Apply one transition per input symbol, left to right, starting from the start state.',
        correctWhy: `Correct: the run is ${pathText}, ending in ${finalState}.`,
      }
    },
  },
  {
    id: 'u3-dfa-accept',
    unit: 3,
    topic: 'DFA fundamentals',
    subtopic: 'Acceptance decision',
    difficulty: 'Easy',
    type: 'Application',
    count: 30,
    seconds: 50,
    tags: ['DFA', 'acceptance'],
    gen: (rng) => {
      const kind = randInt(rng, 0, 2)
      let dfa: DFA
      let desc = ''
      if (kind === 0) {
        const k = randInt(rng, 2, 5)
        dfa = modDFA(k)
        desc = `accepts strings where the number of a symbols is divisible by ${k}`
      } else if (kind === 1) {
        const pat = pick(rng, ['aa', 'ab', 'ba', 'bb'])
        dfa = containsDFA(pat)
        desc = `accepts strings containing "${pat}"`
      } else {
        const pat = pick(rng, ['aba', 'bab', 'abb', 'baa'])
        dfa = suffixDFA(pat)
        desc = `accepts strings ending in "${pat}"`
      }
      const input = pick(rng, allStrings(A, 5))
      const accepted = runDFA(dfa, input).accepted
      return {
        prompt: `A DFA ${desc}. Is the string "${input === '' ? 'ε' : input}" accepted?`,
        correct: accepted ? 'Accepted' : 'Rejected',
        wrong: [
          [accepted ? 'Rejected' : 'Accepted', `This is the wrong verdict. Tracing the string through the transitions shows the machine ends in a ${accepted ? 'final' : 'non-final'} state, so the string is ${accepted ? 'accepted' : 'rejected'}.`],
          ['The machine loops forever', 'A DFA consumes exactly one symbol per step and halts after the last symbol, since its transition function is total.'],
          ['Acceptance depends on the path taken', 'A DFA is deterministic: there is exactly one path for each input string, so acceptance is unambiguous.'],
        ],
        explanation: `A DFA accepts exactly when its unique run ends in a final state. For "${input === '' ? 'ε' : input}" the run ends in a ${accepted ? 'final' : 'non-final'} state, so the string is ${accepted ? 'accepted' : 'rejected'}.`,
        hint: 'Trace the run and check whether the final state is accepting.',
        correctWhy: `Correct: the run ends in a ${accepted ? 'final' : 'non-final'} state, so the string is ${accepted ? 'accepted' : 'rejected'}.`,
      }
    },
  },
  {
    id: 'u3-dfa-design',
    unit: 3,
    topic: 'DFA fundamentals',
    subtopic: 'Designing a DFA',
    difficulty: 'Medium',
    type: 'Design',
    count: 30,
    seconds: 70,
    tags: ['DFA', 'design', 'state count'],
    gen: (rng) => {
      const specs: { desc: string; states: number; why: string; wrongs: [string, string][] }[] = [
        {
          desc: 'strings over {a,b} whose length is divisible by 3',
          states: 3,
          why: 'Track length modulo 3, giving states for remainders 0, 1, 2.',
          wrongs: [
            ['2', 'Two states track parity (mod 2), not divisibility by 3.'],
            ['4', 'Four states would track modulo 4; the language only needs residues mod 3.'],
            ['6', 'Six states is more than needed — the minimal DFA has one state per residue class mod 3.'],
          ],
        },
        {
          desc: 'strings over {a,b} that end in "aba"',
          states: 4,
          why: 'Track the length of the longest suffix that is a prefix of "aba", giving states for 0, 1, 2, and 3 matched symbols.',
          wrongs: [
            ['3', 'Three states cannot distinguish all prefixes of "aba"; four are needed, one per matched prefix length.'],
            ['8', 'Eight states would be the full subset construction bound 2³, but the minimal DFA needs only 4.'],
            ['2', 'Two states cannot remember a 3-symbol suffix.'],
          ],
        },
        {
          desc: 'strings over {a,b} with an even number of a and an even number of b',
          states: 4,
          why: 'Track two independent parities, giving 2 × 2 = 4 combinations.',
          wrongs: [
            ['2', 'Two states track only one parity; both letters must be tracked independently.'],
            ['3', 'Three states cannot represent four parity combinations.'],
            ['8', 'Eight would track three binary properties, but only two are needed.'],
          ],
        },
        {
          desc: 'strings over {a,b} containing the substring "aa"',
          states: 3,
          why: 'States: no progress, seen one a, and seen aa (absorbing accept).',
          wrongs: [
            ['2', 'Two states cannot distinguish "seen one a" from "seen aa".'],
            ['4', 'A fourth state is unnecessary because once aa is seen the machine can stay accepting forever.'],
            ['5', 'This overcounts; three states suffice.'],
          ],
        },
        {
          desc: 'strings over {a,b} where every a is immediately followed by b',
          states: 4,
          why: 'States: start/ok, just saw a (must see b next), seen a violation (dead), plus a sink absorbing the violation.',
          wrongs: [
            ['3', 'Three states conflate the "just saw a" state with the dead state, which would reject valid strings.'],
            ['2', 'Two states cannot remember that the previous symbol was a.'],
            ['5', 'Five states overcount; four suffice.'],
          ],
        },
      ]
      const s = pick(rng, specs)
      return {
        prompt: `What is the minimum number of states in a DFA that accepts ${s.desc}?`,
        correct: `${s.states}`,
        wrong: s.wrongs,
        explanation: `${s.why} Hence the minimal DFA has ${s.states} states. Minimality follows because those ${s.states} states are pairwise distinguishable by some string.`,
        hint: 'Count the distinct pieces of information the machine must remember.',
        correctWhy: `Correct: ${s.states} states, since ${s.why.toLowerCase()}`,
      }
    },
  },
  {
    id: 'u3-eps-closure',
    unit: 3,
    topic: 'Epsilon transitions and closure',
    subtopic: 'Computing ε-closure',
    difficulty: 'Medium',
    type: 'Computation',
    count: 26,
    seconds: 65,
    tags: ['epsilon-NFA', 'closure'],
    gen: (rng) => {
      const nfa = randomNFA(rng, 4, true)
      const target = pick(rng, nfa.states)
      const closure = [...epsClosure(nfa, [target])].sort()
      const correct = fmtSet(closure)
      const notIn = nfa.states.filter((s) => !closure.includes(s))
      const pool: [string, string][] = []
      for (const s of notIn) {
        pool.push([
          fmtSet([...closure, s]),
          `This wrongly includes ${s}, which is not reachable from ${target} using ε-moves alone. ε-closure only follows ε-edges.`,
        ])
      }
      pool.push([
        fmtSet(closure.filter((s) => s !== target)),
        `This omits ${target} itself. The ε-closure of a state always contains that state, since zero ε-moves are allowed.`,
      ])
      pool.push([
        fmtSet(nfa.states),
        'This is the whole state set. ε-closure is limited to states reachable via ε-edges, not all states.',
      ])
      pool.push([
        fmtSet([target]),
        'This includes only the starting state and ignores states reachable through ε-transitions.',
      ])
      if (closure.length > 2) {
        pool.push([
          fmtSet(closure.slice(1)),
          `This drops ${closure[0]}, which is reachable from ${target} by ε-moves, so the closure is incomplete.`,
        ])
        pool.push([
          fmtSet(closure.slice(0, -1)),
          `This drops ${closure[closure.length - 1]}, which is reachable from ${target} by ε-moves, so the closure is incomplete.`,
        ])
      }
      for (const s of notIn) {
        pool.push([
          fmtSet([target, s]),
          `This adds ${s}, which no ε-path from ${target} reaches; only ε-edges are followed.`,
        ])
      }
      return {
        prompt: `In an ε-NFA with states {${nfa.states.join(', ')}} and ε-transitions ${nfa.states.map((s) => `${s}→{${(nfa.eps[s] ?? []).join(',') || '∅'}}`).join('; ')}, what is the ε-closure of ${target}?`,
        correct,
        wrong: dedupeWrongs(correct, pool, 3),
        explanation: `The ε-closure follows only ε-edges transitively, always including the starting state. From ${target} the reachable set is ${correct}. Symbols a and b are irrelevant to this computation.`,
        hint: 'Follow only ε-edges, transitively, and include the state itself.',
        correctWhy: `Correct: ${correct}.`,
      }
    },
  },
  {
    id: 'u3-subset-states',
    unit: 3,
    topic: 'Subset construction',
    subtopic: 'Resulting DFA size',
    difficulty: 'Hard',
    type: 'Computation',
    count: 24,
    seconds: 95,
    tags: ['subset construction', 'NFA to DFA'],
    gen: (rng) => {
      const nfa = randomNFA(rng, randInt(rng, 3, 4), rng() < 0.5)
      const dfa = subsetConstruction(nfa)
      const bound = Math.pow(2, nfa.states.length)
      return {
        prompt: `An NFA has ${nfa.states.length} states. After running subset construction on this particular NFA, how many DFA states are reachable?`,
        correct: `${dfa.states.length}`,
        wrong: [
          [`${bound}`, `${bound} = 2^${nfa.states.length} is the worst-case upper bound. Only reachable subsets are actually constructed, and here that number is ${dfa.states.length}.`],
          [`${nfa.states.length}`, `Subset construction produces sets of NFA states as DFA states, so the count is generally different from ${nfa.states.length}.`],
          [`${nfa.states.length * 2}`, `Doubling the NFA state count has no theoretical basis; the count depends on which subsets are reachable.`],
          [`${dfa.states.length + 1}`, `This adds an extra state that the construction does not create — every constructed state corresponds to an actual reachable subset.`],
        ],
        explanation: `Subset construction starts from ε-closure(start) and repeatedly applies Move-then-close for each symbol, creating only reachable subsets. For this NFA the reachable subsets are ${dfa.states.length}, far below the 2^${nfa.states.length} = ${bound} theoretical maximum. The exponential bound is tight in general but rarely attained.`,
        hint: 'The 2^n figure is an upper bound; count only reachable subsets.',
        correctWhy: `Correct: exactly ${dfa.states.length} reachable subsets, versus the ${bound} bound.`,
      }
    },
  },
  {
    id: 'u3-nfa-vs-dfa',
    unit: 3,
    topic: 'NFA semantics',
    subtopic: 'Expressive power',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 22,
    seconds: 45,
    tags: ['NFA', 'DFA', 'equivalence'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'Which statement about the expressive power of DFAs and NFAs is correct?',
          a: 'DFAs and NFAs accept exactly the same class of languages, the regular languages.',
          wrongs: [
            ['NFAs are strictly more powerful because they can guess.', 'Nondeterminism is existential branching, not extra power: every NFA has an equivalent DFA via subset construction.'],
            ['DFAs are strictly more powerful because they are deterministic.', 'Determinism is a structural restriction, not an advantage in expressive power. Every DFA is already an NFA.'],
            ['Their power depends on the size of the alphabet.', 'The equivalence holds for every finite alphabet; alphabet size affects state counts, not the language class.'],
          ],
        },
        {
          q: 'Why is subset construction important?',
          a: 'It proves every NFA has an equivalent DFA, establishing that nondeterminism adds no expressive power.',
          wrongs: [
            ['It makes NFAs faster than DFAs at runtime.', 'Subset construction can blow up exponentially, so the resulting DFA may be much larger. It is a proof and conversion tool, not a speed-up.'],
            ['It removes the need for final states.', 'The constructed DFA still has final states: those subsets containing an NFA final state.'],
            ['It converts DFAs into NFAs.', 'The direction is the reverse: it converts NFAs into equivalent DFAs.'],
          ],
        },
        {
          q: 'What does it mean for an NFA to accept a string?',
          a: 'At least one computation path ends in a final state after consuming the entire string.',
          wrongs: [
            ['Every computation path must end in a final state.', 'That is far too strong; nondeterministic acceptance is existential, requiring only one successful path.'],
            ['The machine must have no choices at all.', 'Having choices is the defining feature of nondeterminism; acceptance is about existence, not uniqueness.'],
            ['The string must be accepted on the first path tried.', 'There is no "first path" in the definition; acceptance quantifies over all possible runs.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} This follows from the subset construction, which converts any NFA into a DFA recognising the same language at the cost of potentially exponentially many states.`,
        hint: 'Recall the subset construction and the definition of nondeterministic acceptance.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u3-minimize-count',
    unit: 3,
    topic: 'DFA minimisation',
    subtopic: 'Minimal state count',
    difficulty: 'Hard',
    type: 'Computation',
    count: 26,
    seconds: 90,
    tags: ['minimisation', 'equivalence classes'],
    gen: (rng) => {
      const kind = randInt(rng, 0, 2)
      let dfa: DFA
      let desc = ''
      if (kind === 0) {
        const k = randInt(rng, 2, 4)
        dfa = modDFA(k)
        desc = `the DFA counting a symbols modulo ${k}`
      } else if (kind === 1) {
        const pat = pick(rng, ['aa', 'ab', 'ba'])
        dfa = containsDFA(pat)
        desc = `the DFA accepting strings containing "${pat}"`
      } else {
        dfa = parityDFA('a', true)
        desc = 'the DFA accepting an even number of a symbols'
      }
      const min = minimizeDFA(dfa)
      return {
        prompt: `For ${desc} with ${dfa.states.length} states, what is the number of states in the equivalent minimal DFA?`,
        correct: `${min.states.length}`,
        wrong: [
          [`${dfa.states.length}`, `This is the original state count. Minimisation removes states that are behaviourally indistinguishable, so the minimal count is ${min.states.length}.`],
          [`${dfa.states.length + 1}`, `Minimisation never increases the state count; merging equivalent states can only reduce it.`],
          [`${Math.max(1, min.states.length - 1)}`, `This merges one class too many. States that are distinguishable by some string must stay separate.`],
          [`${Math.pow(2, dfa.states.length)}`, `The exponential figure is the subset-construction bound for NFAs, unrelated to minimisation.`],
        ],
        explanation: `Partition refinement starts with final versus non-final states and splits any class whose members transition into different classes on some symbol. For this machine the stable partition has ${min.states.length} classes, so the minimal DFA has ${min.states.length} states.`,
        hint: 'Start with final/non-final and refine until no class splits.',
        correctWhy: `Correct: the stable partition has ${min.states.length} classes.`,
      }
    },
  },
  {
    id: 'u3-moore-mealy',
    unit: 3,
    topic: 'Moore and Mealy machines',
    subtopic: 'Model comparison',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 24,
    seconds: 55,
    tags: ['Moore', 'Mealy', 'transducer'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'What distinguishes a Moore machine from a Mealy machine?',
          a: 'A Moore machine associates output with states, while a Mealy machine associates output with transitions.',
          wrongs: [
            ['A Moore machine is nondeterministic; a Mealy machine is deterministic.', 'Both models are deterministic by definition; the difference is where output is attached.'],
            ['A Moore machine has no final states; a Mealy machine does.', 'Neither transducer model uses final states — both produce output sequences for every input.'],
            ['A Mealy machine can recognise more languages than a Moore machine.', 'They are equivalent in power; conversions exist in both directions, with at most one extra state going from Mealy to Moore.'],
          ],
        },
        {
          q: 'When converting a Mealy machine to an equivalent Moore machine, what is the usual cost?',
          a: 'At most one additional state, because output must be attached to the initial state before any input is read.',
          wrongs: [
            ['A doubling of the state count.', 'The conversion duplicates states only when a state would need different outputs, and the standard construction adds just one state.'],
            ['No cost at all — the state sets are identical.', 'The Moore machine produces an output for the initial state before reading input, so it generally needs one extra state to represent that.'],
            ['The conversion is impossible in general.', 'Moore and Mealy machines are inter-convertible; both capture the same class of sequential functions.'],
          ],
        },
        {
          q: 'For the same input sequence, why can a Mealy and Moore output differ in length?',
          a: 'A Moore machine emits one output per state visited, including the start state, so its output is one symbol longer than the input.',
          wrongs: [
            ['A Mealy machine skips the first input symbol.', 'Mealy machines process every input symbol; each transition produces one output.'],
            ['A Moore machine ignores the last input symbol.', 'Every input symbol causes a transition to a new state, which produces output.'],
            ['The output lengths are always identical.', 'Because Moore output includes the start-state output, it is typically one symbol longer.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} Both are deterministic transducers with equal expressive power; only the placement of output differs.`,
        hint: 'Focus on where the output function is defined.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u3-nfa-trace',
    unit: 3,
    topic: 'NFA semantics',
    subtopic: 'Set of reachable states',
    difficulty: 'Hard',
    type: 'Analysis',
    count: 24,
    seconds: 85,
    tags: ['NFA', 'tracing'],
    gen: (rng) => {
      const nfa = randomNFA(rng, 4, false)
      const input = pick(rng, allStrings(A, 3).filter((s) => s.length >= 2))
      const result = runNFA(nfa, input)
      const all = nfa.states
      const correctSet = fmtSet(result.endStates)
      const pool: [string, string][] = []
      const dead = result.endStates.length === 0

      if (dead) {
        for (const s of all) {
          pool.push([
            fmtSet([s]),
            `This claims ${s} is reachable after "${input}", but the run dies before the input ends: some symbol has no outgoing transition from the current set.`,
          ])
        }
        pool.push([
          fmtSet(all),
          `Every path dies before "${input}" is fully consumed, so no state at all remains reachable — certainly not all ${all.length}.`,
        ])
        pool.push([
          fmtSet([nfa.start]),
          `The start state is left behind as soon as the first symbol is read; it is not in the reachable set at the end.`,
        ])
        const shorterSet = input.length > 1 ? runNFA(nfa, input.slice(0, -1)).endStates : []
        if (shorterSet.length) {
          pool.push([
            fmtSet(shorterSet),
            `This is the reachable set after only "${input.slice(0, -1)}", which still has live paths. The final symbol kills them all.`,
          ])
        }
      } else {
        pool.push([
          fmtSet(all),
          'This is the full state set. After reading the input, only states reachable by some computation path remain, and here that set is smaller.',
        ])
        pool.push([
          fmtSet([nfa.start]),
          'The start state is not necessarily reachable after consuming input; the set must be recomputed at each symbol.',
        ])
        pool.push([
          '∅',
          'An empty set would mean every path died before the input ended, but at least one path survives here.',
        ])
      }
      for (const s of result.endStates) {
        pool.push([
          fmtSet([s]),
          `This keeps only ${s} from the reachable set. An NFA tracks every possible path simultaneously, so all of ${correctSet} must be included.`,
        ])
      }
      if (result.endStates.length > 1) {
        pool.push([
          fmtSet(result.endStates.slice(1)),
          `This drops ${result.endStates[0]}, which is reachable by some path, so the set is incomplete.`,
        ])
        pool.push([
          fmtSet(result.endStates.slice(0, -1)),
          `This drops ${result.endStates[result.endStates.length - 1]}, which is reachable by some path, so the set is incomplete.`,
        ])
      }
      const absent = all.filter((s) => !result.endStates.includes(s))
      if (absent.length) {
        pool.push([
          fmtSet([...result.endStates, absent[0]]),
          `This adds ${absent[0]}, which no computation path reaches after "${input}".`,
        ])
      }
      for (const s of absent) {
        pool.push([
          fmtSet([s]),
          `This claims only ${s} is possible, but ${s} is not reachable after "${input}" at all.`,
        ])
      }
      for (let i = 0; i < result.endStates.length; i++) {
        for (let j = i + 1; j < result.endStates.length; j++) {
          pool.push([
            fmtSet([result.endStates[i], result.endStates[j]]),
            `This keeps only ${result.endStates[i]} and ${result.endStates[j]}, dropping the other reachable states in ${correctSet}.`,
          ])
        }
      }
      if (absent.length >= 2) {
        pool.push([
          fmtSet(absent),
          `This is the complement of the reachable set — those states are exactly the ones no path reaches after "${input}".`,
        ])
      }
      const shorter = input.slice(0, -1)
      if (shorter.length) {
        pool.push([
          fmtSet(runNFA(nfa, shorter).endStates),
          `This is the reachable set after only "${shorter}", stopping one symbol early.`,
        ])
      }
      pool.push([
        fmtSet(runNFA(nfa, input + 'a').endStates),
        `This is the reachable set after reading one symbol too many ("${input}a").`,
      ])

      return {
        prompt: `An NFA has states {${all.join(', ')}} with start ${nfa.start}. After reading "${input}", which set of states can the machine be in?`,
        correct: correctSet,
        wrong: dedupeWrongs(correctSet, pool, 3),
        explanation: `An NFA follows every possible path at once. Starting from {${nfa.start}} and applying each symbol to the whole current set gives ${correctSet} after "${input}". The string is ${result.accepted ? 'accepted, since a final state is present' : 'rejected, since no final state is present'}.`,
        hint: 'Track the set of all currently possible states, one symbol at a time.',
        correctWhy: `Correct: the reachable set after "${input}" is ${correctSet}.`,
      }
    },
  },
  {
    id: 'u3-thompson',
    unit: 3,
    topic: 'Regular expression to NFA',
    subtopic: 'Thompson construction',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 22,
    seconds: 60,
    tags: ['Thompson', 'regex to NFA'],
    gen: (rng) => {
      const claims: { q: string; a: string; wrongs: [string, string][] }[] = [
        {
          q: 'In the Thompson construction for r = r1 ∪ r2, how are the two sub-automata combined?',
          a: 'A new start state ε-branches to both sub-starts, and both sub-accepts ε-connect to a new single accept state.',
          wrongs: [
            ['The two sub-automata share one accept state but keep separate start states.', 'Sharing an accept state without isolating the branches lets paths cross between them, which is why fresh start and accept states are used.'],
            ['The accept state of r1 becomes the start state of r2.', 'That describes concatenation, not union.'],
            ['A single transition labelled ε replaces the entire union.', 'An ε-transition alone would accept only ε, discarding both sub-languages.'],
          ],
        },
        {
          q: 'Why does the Thompson construction use fresh start and accept states for every sub-expression?',
          a: 'Isolation prevents unintended paths between sub-automata, which keeps each construction composable.',
          wrongs: [
            ['To reduce the total number of states.', 'The construction actually adds states; its value is correctness, not economy.'],
            ['Because ε-transitions require unique states.', 'ε-transitions work between any states; the reason is structural isolation, not a technical requirement on ε.'],
            ['To make the automaton deterministic.', 'The result is an ε-NFA, generally nondeterministic; determinisation requires a separate subset construction.'],
          ],
        },
        {
          q: 'How many states does the Thompson construction produce for a regular expression with k symbols (counting operators)?',
          a: 'At most about 2k states, growing linearly with the size of the expression.',
          wrongs: [
            ['Exponentially many, matching the subset construction bound.', 'That is the cost of determinisation; Thompson itself is linear in expression size.'],
            ['Exactly k states, one per symbol.', 'Each symbol contributes two states plus ε-glue, so the count exceeds k.'],
            ['Always 2 states regardless of the expression.', 'Two states suffice only for the trivial expressions ∅, ε, or a single symbol.'],
          ],
        },
      ]
      const c = pick(rng, claims)
      return {
        prompt: c.q,
        correct: c.a,
        wrong: c.wrongs,
        explanation: `${c.a} Thompson construction is inductive: base cases give small automata, and each operator composes them with ε-transitions and fresh endpoints.`,
        hint: 'Think about how the inductive cases compose smaller automata.',
        correctWhy: `Correct: ${c.a}`,
      }
    },
  },
  {
    id: 'u3-visited-states',
    unit: 3,
    topic: 'DFA fundamentals',
    subtopic: 'Counting distinct visited states',
    difficulty: 'Medium',
    type: 'Computation',
    count: 22,
    seconds: 65,
    tags: ['DFA', 'pigeonhole'],
    gen: (rng) => {
      const k = randInt(rng, 3, 5)
      const n = randInt(rng, k, k + 4)
      const dfa = modDFA(k)
      const input = 'a'.repeat(n)
      const visited = new Set(runDFA(dfa, input).path)
      const count = visited.size
      const pool: [string, string][] = [
        [`${n + 1}`, `${n + 1} counts configurations, not distinct states. With only ${k} states, some must repeat by the pigeonhole principle.`],
        [`${k}`, `All ${k} states are not necessarily visited in this short run; the count here is ${count}.`],
        [`${n}`, `This counts input symbols rather than states, and omits the start state.`],
        [`${k + 1}`, `A ${k}-state machine can never visit ${k + 1} distinct states.`],
        [`${count + 1}`, `This adds one state that the run never enters; the transitions from q0 with ${n} a symbols touch exactly ${count} states.`],
        [`${Math.max(1, count - 1)}`, `This omits one state that the run does visit, so it is one too few.`],
        [`${k - 1}`, `The run uses ${count} of the ${k} states; ${k - 1} is not the number actually visited.`],
        [`${n - 1}`, `Subtracting one drops either the start state or the final state, both of which are visited.`],
        [`${2 * count}`, `Doubling has no meaning here: each state is counted once no matter how often it is revisited.`],
      ]
      return {
        prompt: `In the DFA counting a symbols modulo ${k}, how many distinct states are visited while processing the string "${input}" (counting the start state)?`,
        correct: `${count}`,
        wrong: dedupeWrongs(`${count}`, pool, 3),
        explanation: `The run visits q0, q1, …, wrapping modulo ${k}. For ${n} a symbols the distinct states visited are ${count}, since the cycle of length ${k} repeats.`,
        hint: 'Trace the run and note when states start repeating.',
        correctWhy: `Correct: ${count} distinct states are visited.`,
      }
    },
  },
]
