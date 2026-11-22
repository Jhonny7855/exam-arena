import type { Family } from './build'
import { num, comb, fact, surj, perm, pickWrongs } from './build'
import { pick, randInt, type Rng } from '../../lib/rng'

const BELL = [1, 1, 2, 5, 15, 52, 203, 877]

interface Rel {
  pairs: [number, number][]
  n: number
}

function has(rel: Rel, a: number, b: number) {
  return rel.pairs.some(([x, y]) => x === a && y === b)
}

function isReflexive(rel: Rel) {
  for (let i = 1; i <= rel.n; i++) if (!has(rel, i, i)) return false
  return true
}

function isSymmetric(rel: Rel) {
  return rel.pairs.every(([a, b]) => has(rel, b, a))
}

function isAntisymmetric(rel: Rel) {
  return rel.pairs.every(([a, b]) => a === b || !has(rel, b, a))
}

function isTransitive(rel: Rel) {
  for (const [a, b] of rel.pairs) {
    for (const [c, d] of rel.pairs) {
      if (b === c && !has(rel, a, d)) return false
    }
  }
  return true
}

const fmtRel = (rel: Rel) => `{${rel.pairs.map(([a, b]) => `(${a},${b})`).join(', ')}}`

function randomRelation(rng: Rng, n: number, density = 0.5): Rel {
  const pairs: [number, number][] = []
  for (let a = 1; a <= n; a++) {
    for (let b = 1; b <= n; b++) {
      if (rng() < density) pairs.push([a, b])
    }
  }
  return { pairs, n }
}

function propertyList(rel: Rel): string[] {
  const out: string[] = []
  if (isReflexive(rel)) out.push('reflexive')
  if (isSymmetric(rel)) out.push('symmetric')
  if (isAntisymmetric(rel)) out.push('antisymmetric')
  if (isTransitive(rel)) out.push('transitive')
  return out
}

const PROP_DESC: Record<string, string> = {
  reflexive: 'reflexive (every (a,a) is present)',
  symmetric: 'symmetric (every (a,b) has its mirror (b,a))',
  antisymmetric: 'antisymmetric (no pair appears with its mirror unless a = b)',
  transitive: 'transitive (a→b and b→c always gives a→c)',
}

export const unit1Families: Family[] = [
  {
    id: 'u1-powerset',
    unit: 1,
    topic: 'Set theory',
    subtopic: 'Power set cardinality',
    difficulty: 'Easy',
    type: 'Application',
    count: 26,
    seconds: 40,
    tags: ['sets', 'power set', 'cardinality'],
    gen: (rng) => {
      const n = randInt(rng, 3, 7)
      const size = Math.pow(2, n)
      const wrongs: [string, string][] = [
        [`${num(size - 1)}`, `2^${n} − 1 counts all proper subsets only, so it excludes the whole set itself. The power set contains every subset, including S and ∅.`],
        [`${num(size / 2)}`, `Halving the power set size corresponds to fixing one element as present or absent; that gives 2^${n - 1} subsets of a restricted family, not the full power set.`],
        [`${num(Math.pow(2, n + 1))}`, `This is 2^${n + 1}, one extra binary choice beyond the ${n} elements of S, so it overcounts by a factor of 2.`],
        [`${num(n * n)}`, `${n}² = ${n * n} counts ordered pairs, which is the size of S × S, not the number of subsets.`],
        [`${num(n)}`, `${n} counts elements of S, not subsets of S.`],
        [`${num(2 * n)}`, `${2 * n} counts something like twice the element count; the power set grows exponentially, not linearly.`],
        [`${num(fact(n))}`, `${n}! counts orderings (permutations) of the elements, not subsets.`],
        [`${num(size + 1)}`, `This adds a single extra subset, but the count is exactly 2^${n}; there is no subset beyond the ${num(size)} already enumerated.`],
      ]
      return {
        prompt: `Let S be a set with exactly ${n} elements. How many elements does the power set P(S) have?`,
        correct: `${num(size)}`,
        wrong: pickWrongs(`${num(size)}`, wrongs, rng, 3),
        explanation: `The power set P(S) contains every subset of S. For each of the ${n} elements you independently choose "include" or "exclude", giving 2 choices per element and 2^${n} = ${num(size)} subsets in total.`,
        hint: 'Each element is either in a subset or not — count the independent binary choices.',
        correctWhy: `Correct: 2^${n} = ${num(size)} because each of the ${n} elements contributes an independent include/exclude choice.`,
      }
    },
  },
  {
    id: 'u1-union-card',
    unit: 1,
    topic: 'Set theory',
    subtopic: 'Inclusion–exclusion',
    difficulty: 'Easy',
    type: 'Application',
    count: 26,
    seconds: 45,
    tags: ['sets', 'union', 'inclusion-exclusion'],
    gen: (rng) => {
      const inter = randInt(rng, 1, 6)
      const a = inter + randInt(rng, 2, 7)
      const b = inter + randInt(rng, 2, 7)
      const union = a + b - inter
      return {
        prompt: `A finite set A has |A| = ${a} and a finite set B has |B| = ${b}. If |A ∩ B| = ${inter}, what is |A ∪ B|?`,
        correct: `${num(union)}`,
        wrong: [
          [`${num(a + b)}`, `Adding |A| and |B| counts the ${inter} shared elements twice, so it overcounts by exactly |A ∩ B|.`],
          [`${num(a + b + inter)}`, `Inclusion–exclusion subtracts the intersection; adding it double-counts the overlap in the other direction.`],
          [`${num(union + inter)}`, `This adds the intersection instead of subtracting it, so the overlap is counted three times.`],
          [`${num(Math.abs(a - b))}`, `|A − B| style differences describe symmetric differences of disjoint parts, not the union.`],
        ],
        explanation: `Inclusion–exclusion: |A ∪ B| = |A| + |B| − |A ∩ B| = ${a} + ${b} − ${inter} = ${union}. The subtraction repairs the double counting of shared elements.`,
        hint: 'Use |A ∪ B| = |A| + |B| − |A ∩ B|.',
        correctWhy: `Correct: ${a} + ${b} − ${inter} = ${union}.`,
      }
    },
  },
  {
    id: 'u1-subsets-k',
    unit: 1,
    topic: 'Set theory',
    subtopic: 'Counting subsets',
    difficulty: 'Medium',
    type: 'Computation',
    count: 26,
    seconds: 60,
    tags: ['sets', 'combinations'],
    gen: (rng) => {
      const n = randInt(rng, 5, 9)
      const k = randInt(rng, 2, n - 2)
      const c = comb(n, k)
      return {
        prompt: `A set has ${n} distinct elements. How many subsets of size exactly ${k} does it contain?`,
        correct: `${num(c)}`,
        wrong: [
          [`${num(perm(n, k))}`, `P(${n},${k}) = ${num(perm(n, k))} counts ordered selections, so it treats different orders as different subsets. Subsets are unordered.`],
          [`${num(Math.pow(2, n))}`, `2^${n} = ${num(Math.pow(2, n))} counts subsets of every size, not only size ${k}.`],
          [`${num(comb(n, k - 1))}`, `C(${n},${k - 1}) counts subsets of size ${k - 1}, one element short.`],
          [`${num(n * k)}`, `${n} × ${k} multiplies element count by subset size, which has no combinatorial meaning here.`],
        ],
        explanation: `Choosing an unordered subset of size ${k} from ${n} elements is C(${n},${k}) = ${n}!/(${k}!·${n - k}!) = ${num(c)}. Dividing by ${k}! removes the orderings within each chosen subset.`,
        hint: 'Order does not matter, so use a binomial coefficient.',
        correctWhy: `Correct: C(${n},${k}) = ${num(c)}.`,
      }
    },
  },
  {
    id: 'u1-impl-truth',
    unit: 1,
    topic: 'Propositions',
    subtopic: 'Implication truth value',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 24,
    seconds: 40,
    tags: ['logic', 'implication'],
    gen: (rng) => {
      const p = rng() < 0.5
      const q = rng() < 0.5
      const value = !p || q
      const label = value ? 'True' : 'False'
      const opposite = value ? 'False' : 'True'
      const rows = `P = ${p ? 'T' : 'F'}, Q = ${q ? 'T' : 'F'}`
      return {
        prompt: `Evaluate the truth value of the implication P → Q when ${rows}.`,
        correct: label,
        wrong: [
          [opposite, value ? 'This flips the value. An implication is false only in the single case P true and Q false, which does not apply here.' : 'This flips the value. Since P is true and Q is false here, the implication must be false.'],
          ['Undefined', 'An implication always has a definite truth value once both components are assigned; it is never undefined.'],
          ['Both true and false', 'Propositional connectives are truth-functional: each valuation yields exactly one truth value.'],
        ],
        explanation: `P → Q is equivalent to ¬P ∨ Q. With ${rows}, ¬P ∨ Q = ${!p ? 'T' : 'F'} ∨ ${q ? 'T' : 'F'} = ${value ? 'T' : 'F'}, so the implication is ${label.toLowerCase()}. The only falsifying row is P true with Q false.`,
        hint: 'Rewrite P → Q as ¬P ∨ Q.',
        correctWhy: `Correct: P → Q ≡ ¬P ∨ Q, which is ${label.toLowerCase()} for ${rows}.`,
      }
    },
  },
  {
    id: 'u1-contrapositive',
    unit: 1,
    topic: 'Propositions',
    subtopic: 'Contrapositive',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 22,
    seconds: 45,
    tags: ['logic', 'contrapositive'],
    gen: (rng) => {
      const cases = [
        { p: 'the program halts', q: 'it produces output', np: 'the program does not halt', nq: 'it produces no output' },
        { p: 'n is divisible by 4', q: 'n is even', np: 'n is not divisible by 4', nq: 'n is odd' },
        { p: 'the graph is a tree', q: 'the graph is connected', np: 'the graph is not a tree', nq: 'the graph is disconnected' },
        { p: 'L is finite', q: 'L is regular', np: 'L is infinite', nq: 'L is not regular' },
        { p: 'the matrix is invertible', q: 'its determinant is nonzero', np: 'the matrix is not invertible', nq: 'its determinant is zero' },
        { p: 'x is a multiple of 6', q: 'x is a multiple of 3', np: 'x is not a multiple of 6', nq: 'x is not a multiple of 3' },
      ]
      const c = pick(rng, cases)
      return {
        prompt: `Consider the statement: "If ${c.p}, then ${c.q}." Which statement is its contrapositive?`,
        correct: `If ${c.nq}, then ${c.np}.`,
        wrong: [
          [`If ${c.q}, then ${c.p}.`, 'This is the converse, which swaps the parts without negating. The converse is not logically equivalent to the original.'],
          [`If ${c.np}, then ${c.nq}.`, 'This is the inverse, which negates both parts but keeps the order. It is equivalent to the converse, not the original.'],
          [`If ${c.p}, then ${c.nq}.`, 'This negates only the conclusion and keeps the premise, which is not any standard transformation and can change the truth value.'],
        ],
        explanation: `The contrapositive of P → Q is ¬Q → ¬P: negate both parts and reverse the order. So "If ${c.p}, then ${c.q}" becomes "If ${c.nq}, then ${c.np}." A statement and its contrapositive are always logically equivalent, which is why contrapositive proof is valid.`,
        hint: 'Negate both parts, then swap them.',
        correctWhy: `Correct: ¬Q → ¬P, i.e. "If ${c.nq}, then ${c.np}."`,
      }
    },
  },
  {
    id: 'u1-quantifier-neg',
    unit: 1,
    topic: 'Predicate logic',
    subtopic: 'Quantifier negation',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 24,
    seconds: 50,
    tags: ['logic', 'quantifiers', 'negation'],
    gen: (rng) => {
      const cases = [
        { dom: 'natural numbers', pred: 'n is prime', neg: 'n is not prime' },
        { dom: 'DFAs', pred: 'M has a reachable final state', neg: 'M has no reachable final state' },
        { dom: 'strings over {a,b}', pred: 'w contains aa', neg: 'w does not contain aa' },
        { dom: 'students', pred: 'the student passed', neg: 'the student did not pass' },
        { dom: 'grammars', pred: 'G is ambiguous', neg: 'G is not ambiguous' },
        { dom: 'Turing machines', pred: 'M halts on ε', neg: 'M does not halt on ε' },
      ]
      const c = pick(rng, cases)
      const universal = rng() < 0.5
      const original = universal ? `∀x over all ${c.dom}, ${c.pred}` : `∃x among the ${c.dom} such that ${c.pred}`
      const correct = universal ? `∃x among the ${c.dom} such that ${c.neg}` : `∀x over all ${c.dom}, ${c.neg}`
      return {
        prompt: `What is the negation of the statement "${original}"?`,
        correct,
        wrong: [
          [universal ? `∀x over all ${c.dom}, ${c.neg}` : `∃x among the ${c.dom} such that ${c.neg}`, 'This negates the predicate but keeps the same quantifier. Negating a quantified statement must flip the quantifier as well.'],
          [universal ? `∃x among the ${c.dom} such that ${c.pred}` : `∀x over all ${c.dom}, ${c.pred}`, 'This flips the quantifier but leaves the predicate un-negated, so it does not negate the claim.'],
          [`No x over the ${c.dom} satisfies anything`, 'This is far too strong: it denies the existence of any meaningful property rather than negating the specific predicate.'],
        ],
        explanation: `Negation pushes inward and flips the quantifier: ¬∀x P(x) ≡ ∃x ¬P(x) and ¬∃x P(x) ≡ ∀x ¬P(x). Applying that to "${original}" gives "${correct}".`,
        hint: 'Flip ∀ ↔ ∃ and negate the inner predicate.',
        correctWhy: `Correct: the quantifier flips and the predicate negates, giving "${correct}".`,
      }
    },
  },
  {
    id: 'u1-relation-props',
    unit: 1,
    topic: 'Relations',
    subtopic: 'Relation properties',
    difficulty: 'Medium',
    type: 'Analysis',
    count: 30,
    seconds: 75,
    tags: ['relations', 'properties'],
    gen: (rng) => {
      const n = 3
      let rel = randomRelation(rng, n, 0.45)
      for (let i = 0; i < 60; i++) {
        const props = propertyList(rel)
        if (props.length >= 1 && props.length <= 3) break
        rel = randomRelation(rng, n, 0.45)
      }
      const props = propertyList(rel)
      const missing = (['reflexive', 'symmetric', 'antisymmetric', 'transitive'] as const).filter(
        (p) => !props.includes(p),
      )
      const correct = props.length ? props.join(' and ') : 'none of the four properties'
      const wrongs: [string, string][] = []
      if (missing.length) {
        const add = missing[0]
        wrongs.push([
          `${props.join(' and ')}${props.length ? ' and ' : ''}${add}`.trim(),
          `The relation fails to be ${PROP_DESC[add]}. Check the pair list directly for a counterexample.`,
        ])
      }
      if (props.length > 1) {
        wrongs.push([
          props.slice(0, 1).join(''),
          `This omits ${props.slice(1).join(' and ')}, which the pair list also satisfies.`,
        ])
      }
      wrongs.push(['all four properties', 'A relation cannot be both symmetric and antisymmetric unless it only contains pairs of the form (a,a); this relation contains other pairs.'])
      wrongs.push(['exactly one property', 'The pair list satisfies more than one of the four properties, so this undercounts.'])
      wrongs.push(['reflexive only', 'This ignores the other properties the relation satisfies, such as symmetry or transitivity.'])
      return {
        prompt: `Let R = ${fmtRel(rel)} be a relation on the set {1, 2, 3}. Which of the following best describes R?`,
        correct: `R is ${correct}.`,
        wrong: wrongs.slice(0, 3),
        explanation: `Checking the pair list: reflexivity needs (1,1),(2,2),(3,3) — ${isReflexive(rel) ? 'all present' : 'at least one missing'}. Symmetry needs every (a,b) to have (b,a) — ${isSymmetric(rel) ? 'satisfied' : 'violated'}. Antisymmetry forbids (a,b) and (b,a) together for a ≠ b — ${isAntisymmetric(rel) ? 'satisfied' : 'violated'}. Transitivity needs a→b and b→c to imply a→c — ${isTransitive(rel) ? 'satisfied' : 'violated'}. Hence R is ${correct}.`,
        hint: 'Test each of the four properties against the explicit pair list.',
        correctWhy: `Correct: direct inspection shows R is ${correct}.`,
      }
    },
  },
  {
    id: 'u1-equiv-count',
    unit: 1,
    topic: 'Relations',
    subtopic: 'Counting equivalence relations',
    difficulty: 'Hard',
    type: 'Computation',
    count: 18,
    seconds: 80,
    tags: ['relations', 'equivalence', 'bell numbers'],
    gen: (rng) => {
      const n = randInt(rng, 3, 5)
      const bell = BELL[n]
      return {
        prompt: `How many distinct equivalence relations are there on a set with ${n} elements?`,
        correct: `${num(bell)}`,
        wrong: [
          [`${num(Math.pow(2, n * n))}`, `2^(${n}²) = ${num(Math.pow(2, n * n))} counts all relations on the set, not only the equivalence relations.`],
          [`${num(fact(n))}`, `${n}! counts permutations of the elements; equivalence relations are partitions, a different object.`],
          [`${num(Math.pow(2, n))}`, `2^${n} counts subsets of the set, not partitions into equivalence classes.`],
          [`${num(comb(n, 2))}`, `C(${n},2) counts unordered pairs, which is unrelated to the number of partitions.`],
        ],
        explanation: `Equivalence relations on a set correspond exactly to partitions of that set, so their count is the Bell number B(${n}) = ${num(bell)}. For n = 3 the partitions are 1+1+1, 2+1 (three ways), and 3, giving 5.`,
        hint: 'Equivalence relations biject with partitions — count partitions.',
        correctWhy: `Correct: the Bell number B(${n}) = ${num(bell)}.`,
      }
    },
  },
  {
    id: 'u1-onto-count',
    unit: 1,
    topic: 'One-to-one, onto and bijective functions',
    subtopic: 'Counting surjections',
    difficulty: 'Hard',
    type: 'Computation',
    count: 20,
    seconds: 90,
    tags: ['functions', 'surjection', 'counting'],
    gen: (rng) => {
      const m = randInt(rng, 2, 3)
      const n = m + randInt(rng, 1, 3)
      const onto = surj(n, m)
      const all = Math.pow(m, n)
      const inj = perm(n, m)
      const wrongs: [string, string][] = [
        [`${num(all)}`, `${m}^${n} = ${num(all)} counts all functions, including those that miss one or more codomain elements. Surjectivity excludes those.`],
        [`${num(Math.pow(n, m))}`, `${n}^${m} reverses the roles and counts functions in the wrong direction.`],
        [`${num(inj)}`, `P(${n},${m}) = ${num(inj)} counts injections, which is a different constraint: injective functions need not hit every codomain element.`],
        [`${num(all - onto)}`, `${num(all - onto)} counts the non-surjective functions — exactly the ones surjectivity excludes.`],
        [`${num(onto + 1)}`, `This is one more than the true count of ${num(onto)}; inclusion–exclusion produces an exact value, not an approximation.`],
        [`${num(onto - 1)}`, `This is one fewer than the true count of ${num(onto)}; no admissible function is omitted by the inclusion–exclusion formula.`],
        [`${num(all + onto)}`, `Adding the surjection count to the total function count double-counts the surjections already contained in ${m}^${n}.`],
        [`${num(onto * 2)}`, `Exactly twice ${num(onto)}, the classic signature of counting each function twice by forgetting the onto condition on one pass.`],
      ]
      return {
        prompt: `How many onto (surjective) functions are there from a set of ${n} elements to a set of ${m} elements?`,
        correct: `${num(onto)}`,
        wrong: pickWrongs(`${num(onto)}`, wrongs, rng, 3),
        explanation: `By inclusion–exclusion, the number of onto functions from ${n} to ${m} elements is Σ_{j=0}^{${m}} (−1)^j C(${m},j)(${m}−j)^${n} = ${num(onto)}. Each term excludes functions that avoid a chosen set of j codomain elements.`,
        hint: 'Use inclusion–exclusion on the codomain elements that get missed.',
        correctWhy: `Correct: inclusion–exclusion gives ${num(onto)}.`,
      }
    },
  },
  {
    id: 'u1-bijection-count',
    unit: 1,
    topic: 'One-to-one, onto and bijective functions',
    subtopic: 'Counting bijections',
    difficulty: 'Easy',
    type: 'Computation',
    count: 22,
    seconds: 45,
    tags: ['functions', 'bijection', 'permutation'],
    gen: (rng) => {
      const n = randInt(rng, 3, 6)
      const total = fact(n)
      return {
        prompt: `How many bijections are there from a set of ${n} elements onto itself?`,
        correct: `${num(total)}`,
        wrong: [
          [`${num(Math.pow(n, n))}`, `${n}^${n} counts all self-maps, most of which are neither injective nor surjective.`],
          [`${num(Math.pow(2, n))}`, `2^${n} counts subsets, which has nothing to do with bijections.`],
          [`${num(total / 2)}`, `Dividing by 2 assumes every bijection pairs with a distinct mirror, which is not a valid symmetry here.`],
          [`${num(n)}`, `${n} counts the elements, not the rearrangements of them.`],
        ],
        explanation: `A bijection from a finite set to itself is a permutation. The first element has ${n} possible images, the second ${n - 1}, and so on, giving ${n}! = ${num(total)}.`,
        hint: 'Count the choices for each successive element.',
        correctWhy: `Correct: ${n}! = ${num(total)}.`,
      }
    },
  },
  {
    id: 'u1-function-count',
    unit: 1,
    topic: 'One-to-one, onto and bijective functions',
    subtopic: 'Counting all functions',
    difficulty: 'Easy',
    type: 'Computation',
    count: 22,
    seconds: 40,
    tags: ['functions', 'counting'],
    gen: (rng) => {
      const a = randInt(rng, 2, 4)
      const b = randInt(rng, 2, 5)
      const total = Math.pow(b, a)
      const wrongs: [string, string][] = [
        [`${num(Math.pow(a, b))}`, `${a}^${b} reverses the direction: each of the ${b} codomain elements would get ${a} choices, which is not how functions from A to B work.`],
        [`${num(a * b)}`, `${a} × ${b} counts pairs in A × B, not functions.`],
        [`${num(fact(a))}`, `${a}! counts orderings of A, unrelated to mapping choices.`],
        [`${num(perm(b, a))}`, `P(${b},${a}) counts injections only, a strict subset of all functions.`],
        [`${num(total + 1)}`, `This is one more than ${num(total)}; every function is already counted by choosing an image for each of the ${a} domain elements.`],
        [`${num(total - 1)}`, `This is one fewer than ${num(total)}; no admissible function is excluded, since every domain element may map to any codomain element.`],
        [`${num(a + b)}`, `${a} + ${b} adds cardinalities, which counts neither pairs nor functions.`],
        [`${num(Math.pow(b, a - 1))}`, `This leaves one domain element unassigned; a function must give every element of A exactly one image.`],
      ]
      return {
        prompt: `A has ${a} elements and B has ${b} elements. How many functions are there from A to B?`,
        correct: `${num(total)}`,
        wrong: pickWrongs(`${num(total)}`, wrongs, rng, 3),
        explanation: `A function assigns to each of the ${a} domain elements exactly one of the ${b} codomain elements, independently. That gives ${b}^${a} = ${num(total)} functions.`,
        hint: 'Each domain element independently chooses an image.',
        correctWhy: `Correct: ${b}^${a} = ${num(total)}.`,
      }
    },
  },
  {
    id: 'u1-induction-sum',
    unit: 1,
    topic: 'Mathematical induction',
    subtopic: 'Closed-form sums',
    difficulty: 'Medium',
    type: 'Computation',
    count: 26,
    seconds: 60,
    tags: ['induction', 'summation'],
    gen: (rng) => {
      const kind = randInt(rng, 0, 4)
      const n = randInt(rng, 6, 24)
      let prompt = ''
      let value = 0
      let formula = ''
      if (kind === 0) {
        prompt = `Σ_{i=1}^{${n}} i`
        value = (n * (n + 1)) / 2
        formula = 'n(n+1)/2'
      } else if (kind === 1) {
        prompt = `Σ_{i=1}^{${n}} i²`
        value = (n * (n + 1) * (2 * n + 1)) / 6
        formula = 'n(n+1)(2n+1)/6'
      } else if (kind === 2) {
        prompt = `Σ_{i=1}^{${n}} i³`
        value = Math.pow((n * (n + 1)) / 2, 2)
        formula = '[n(n+1)/2]²'
      } else if (kind === 3) {
        prompt = `Σ_{i=0}^{${n}} 2^i`
        value = Math.pow(2, n + 1) - 1
        formula = '2^(n+1) − 1'
      } else {
        prompt = `Σ_{i=1}^{${n}} (2i − 1)`
        value = n * n
        formula = 'n²'
      }
      return {
        prompt: `Using the standard induction formulas, evaluate ${prompt}.`,
        correct: `${num(value)}`,
        wrong: [
          [`${num(value + n)}`, `This adds ${n} extra, which no term of the series contributes.`],
          [`${num(Math.max(1, value - n))}`, `This drops ${n}, suggesting a mis-summed boundary term.`],
          [`${num(value * 2)}`, `Doubling suggests counting each term twice, which the formula does not do.`],
          [`${num(value + 1)}`, `This is an off-by-one error, typically from including or excluding one extra boundary index.`],
        ],
        explanation: `The closed form is ${formula}. Substituting n = ${n} gives ${num(value)}. Induction proves the formula by verifying the base case and showing the (n+1) step follows from the n step.`,
        hint: 'Recall the standard closed forms and substitute n.',
        correctWhy: `Correct: ${formula} at n = ${n} equals ${num(value)}.`,
      }
    },
  },
  {
    id: 'u1-recursion-term',
    unit: 1,
    topic: 'Recursive definition',
    subtopic: 'Recurrence evaluation',
    difficulty: 'Medium',
    type: 'Computation',
    count: 24,
    seconds: 60,
    tags: ['recursion', 'recurrence'],
    gen: (rng) => {
      const kind = randInt(rng, 0, 2)
      const a1 = randInt(rng, 1, 3)
      const d = randInt(rng, 2, 4)
      const k = randInt(rng, 5, 9)
      let value = a1
      let rule = ''
      if (kind === 0) {
        rule = `a₁ = ${a1}, aₙ = aₙ₋₁ + ${d}`
        value = a1 + (k - 1) * d
      } else if (kind === 1) {
        rule = `a₁ = ${a1}, aₙ = ${d}·aₙ₋₁`
        value = a1 * Math.pow(d, k - 1)
      } else {
        rule = `a₁ = ${a1}, aₙ = aₙ₋₁ + 2n`
        value = a1
        for (let i = 2; i <= k; i++) value += 2 * i
      }
      return {
        prompt: `A sequence is defined recursively by ${rule}. What is a${k}?`,
        correct: `${num(value)}`,
        wrong: [
          [`${num(value + d)}`, `This applies one extra step of the recurrence, effectively computing a later term.`],
          [`${num(Math.max(1, value - d))}`, `This applies one fewer step, effectively computing an earlier term.`],
          [`${num(k * a1)}`, `Multiplying the index by the initial value ignores the recurrence rule entirely.`],
          [`${num(value * 2)}`, `Doubling does not follow from the stated recurrence; expand the rule step by step instead.`],
        ],
        explanation: `Unrolling the recurrence from a₁ = ${a1} for ${k - 1} steps gives a${k} = ${num(value)}. Writing out the first few terms and applying the rule mechanically avoids off-by-one errors.`,
        hint: 'Expand the first few terms, then apply the rule repeatedly.',
        correctWhy: `Correct: expanding ${k - 1} steps from a₁ = ${a1} gives ${num(value)}.`,
      }
    },
  },
  {
    id: 'u1-proof-technique',
    unit: 1,
    topic: 'Proof techniques',
    subtopic: 'Choosing a proof method',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 22,
    seconds: 50,
    tags: ['proofs', 'method'],
    gen: (rng) => {
      const cases = [
        { claim: '√2 is irrational', method: 'Proof by contradiction', why: 'Assume √2 = p/q in lowest terms, then derive that p and q are both even, contradicting lowest terms.' },
        { claim: 'If n² is even then n is even', method: 'Proof by contrapositive', why: 'Prove the contrapositive: if n is odd, then n² is odd, which is a direct calculation.' },
        { claim: 'The sum of the first n odd numbers is n²', method: 'Mathematical induction', why: 'Verify n = 1, then add the next odd number 2n+1 to the n-case to obtain (n+1)².' },
        { claim: 'There are infinitely many primes', method: 'Proof by contradiction', why: 'Assume finitely many primes, multiply them and add 1, and obtain a number with a prime factor outside the list.' },
        { claim: 'Every tree with n vertices has n − 1 edges', method: 'Mathematical induction', why: 'Remove a leaf, apply the hypothesis to the smaller tree, then add back the leaf and its single edge.' },
        { claim: 'If 3n + 2 is odd then n is odd', method: 'Proof by contrapositive', why: 'Assume n is even, so n = 2k, then 3n + 2 = 6k + 2 is even, negating the conclusion.' },
        { claim: 'A language with no accepting run is not accepted by the NFA', method: 'Direct proof', why: 'Unfold the definition of NFA acceptance: acceptance requires the existence of an accepting run, so its absence settles the claim immediately.' },
      ]
      const c = pick(rng, cases)
      const methods = ['Proof by contradiction', 'Proof by contrapositive', 'Mathematical induction', 'Direct proof']
      return {
        prompt: `Which proof technique is most natural for establishing: "${c.claim}"?`,
        correct: c.method,
        wrong: methods.filter((m) => m !== c.method).map((m) => [m, `This technique does not fit the shape of the claim as cleanly. ${c.method} works because ${c.why}`] as [string, string]),
        explanation: `${c.method} is the natural choice here: ${c.why}`,
        hint: 'Ask whether the claim has a natural negation, a recursive structure, or an unconditional chain of implications.',
        correctWhy: `Correct: ${c.method} — ${c.why}`,
      }
    },
  },
  {
    id: 'u1-demorgan',
    unit: 1,
    topic: 'Set theory',
    subtopic: 'Set identities',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 22,
    seconds: 45,
    tags: ['sets', 'de morgan', 'identities'],
    gen: (rng) => {
      const ids = [
        { q: '(A ∪ B)ᶜ', a: 'Aᶜ ∩ Bᶜ', w: ['Aᶜ ∪ Bᶜ', 'A ∩ B', 'A ∪ Bᶜ'] },
        { q: '(A ∩ B)ᶜ', a: 'Aᶜ ∪ Bᶜ', w: ['Aᶜ ∩ Bᶜ', 'A ∪ B', 'Aᶜ ∩ B'] },
        { q: 'A ∪ (B ∩ C)', a: '(A ∪ B) ∩ (A ∪ C)', w: ['(A ∪ B) ∩ C', 'A ∩ (B ∪ C)', '(A ∩ B) ∪ C'] },
        { q: 'A ∩ (B ∪ C)', a: '(A ∩ B) ∪ (A ∩ C)', w: ['(A ∩ B) ∪ C', 'A ∪ (B ∩ C)', '(A ∪ B) ∩ C'] },
        { q: '(Aᶜ)ᶜ', a: 'A', w: ['Aᶜ', '∅', 'U'] },
        { q: 'A − B', a: 'A ∩ Bᶜ', w: ['Aᶜ ∩ B', 'A ∪ Bᶜ', 'B − A'] },
      ]
      const c = pick(rng, ids)
      const why: Record<string, string> = {
        'Aᶜ ∪ Bᶜ': 'This is the negation of an intersection, not of a union. De Morgan swaps the operator as well as negating.',
        'A ∩ B': 'Negation does not commute with intersection this way; the complement of a union is an intersection of complements.',
        'A ∪ Bᶜ': 'This keeps a union where the correct identity needs an intersection.',
        'Aᶜ ∩ Bᶜ': 'This is the complement of a union, so it applies to the wrong expression here.',
        'A ∪ B': 'This removes the complement entirely instead of distributing it.',
        'Aᶜ ∩ B': 'This complements the wrong operand; the complement must apply to the subtracted set.',
        '(A ∪ B) ∩ C': 'This drops the distribution over both terms of the union.',
        'A ∩ (B ∪ C)': 'This is the dual distributive law, which applies to intersection over union, not union over intersection.',
        '(A ∩ B) ∪ C': 'This changes the grouping and drops one occurrence of A.',
        'A ∪ (B ∩ C)': 'This is the other distributive law, with union and intersection swapped.',
        Aᶜ: 'A double complement returns the original set; one complement does not undo the other.',
        '∅': 'The complement of a complement is not generally empty.',
        U: 'The complement of a complement is not the universe unless the original set was empty.',
        'B − A': 'This reverses the order of the difference, which changes the set.',
      }
      return {
        prompt: `Which expression is equal to ${c.q}?`,
        correct: c.a,
        wrong: c.w.map((x) => [x, why[x] ?? 'This expression is not equivalent to the given one under set algebra.'] as [string, string]),
        explanation: `Applying De Morgan and the distributive laws gives ${c.q} = ${c.a}. Membership reasoning confirms it: an element is in the left side exactly when it satisfies the corresponding condition on the right.`,
        hint: 'Use De Morgan laws and distributive laws, and test with a small element.',
        correctWhy: `Correct: ${c.q} = ${c.a}.`,
      }
    },
  },
  {
    id: 'u1-relation-count',
    unit: 1,
    topic: 'Relations',
    subtopic: 'Counting relations with properties',
    difficulty: 'Hard',
    type: 'Computation',
    count: 20,
    seconds: 85,
    tags: ['relations', 'counting'],
    gen: (rng) => {
      const n = randInt(rng, 3, 5)
      const kind = randInt(rng, 0, 2)
      const totalPairs = n * n
      let correctValue = 0
      let label = ''
      let formula = ''
      if (kind === 0) {
        correctValue = Math.pow(2, totalPairs)
        label = 'relations'
        formula = `2^(${n}²) = 2^${totalPairs}`
      } else if (kind === 1) {
        correctValue = Math.pow(2, totalPairs - n)
        label = 'reflexive relations'
        formula = `2^(${n}² − ${n}) = 2^${totalPairs - n}, since the ${n} diagonal pairs are forced`
      } else {
        const free = (totalPairs - n) / 2 + n
        correctValue = Math.pow(2, free)
        label = 'symmetric relations'
        formula = `2^(${n}(${n}+1)/2) = 2^${free}, since each off-diagonal pair is decided together with its mirror`
      }
      return {
        prompt: `How many ${label} are there on a set with ${n} elements?`,
        correct: `${num(correctValue)}`,
        wrong: [
          [`${num(Math.pow(2, totalPairs))}`, `2^${totalPairs} counts all relations with no restriction, so it ignores the ${label.replace(' relations', '')} constraint.`],
          [`${num(Math.pow(2, totalPairs - n))}`, `This applies the reflexive count, which forces exactly the ${n} diagonal pairs. It does not match the ${label} constraint asked for.`],
          [`${num(Math.pow(n, totalPairs))}`, `Using ${n} as a base confuses the number of elements with the number of choices per pair, which is 2 (present or absent).`],
          [`${num(fact(n))}`, `${n}! counts permutations of the elements, not relations.`],
        ],
        explanation: `A relation on ${n} elements is a subset of the ${n}² = ${totalPairs} ordered pairs. For ${label}, the number of freely decidable pairs gives ${formula} = ${num(correctValue)}.`,
        hint: 'Count how many ordered pairs are freely decidable, then raise 2 to that power.',
        correctWhy: `Correct: ${formula} = ${num(correctValue)}.`,
      }
    },
  },
  {
    id: 'u1-cartesian-powerset',
    unit: 1,
    topic: 'Set theory',
    subtopic: 'Cartesian products and power sets',
    difficulty: 'Medium',
    type: 'Application',
    count: 22,
    seconds: 55,
    tags: ['sets', 'cartesian product', 'power set'],
    gen: (rng) => {
      const a = randInt(rng, 2, 4)
      const b = randInt(rng, 2, 4)
      const pairs = a * b
      const answer = Math.pow(2, pairs)
      const wrongs: [string, string][] = [
        [`${num(pairs)}`, `${a} × ${b} = ${pairs} is |A × B| itself, not the size of its power set.`],
        [`${num(Math.pow(2, a + b))}`, `2^(${a}+${b}) = ${num(Math.pow(2, a + b))} adds the cardinalities instead of multiplying them. |A × B| has ${pairs} elements, not ${a + b}.`],
        [`${num(a + b)}`, `${a} + ${b} adds the two cardinalities, which has no relation to the power set size.`],
        [`${num(Math.pow(2, a) * Math.pow(2, b))}`, `This multiplies the two power set sizes, giving 2^(${a}+${b}); the product A × B has ${pairs} elements, so the exponent must be ${pairs}.`],
        [`${num(Math.pow(2, a) + Math.pow(2, b))}`, `This adds the two power set sizes separately instead of taking the power set of the product.`],
        [`${num(answer - 1)}`, `This omits the whole set A × B, one of the subsets counted by the power set.`],
        [`${num(answer / 2)}`, `Halving drops the subsets that contain a fixed element; the power set includes all ${num(answer)} subsets.`],
      ]
      return {
        prompt: `If |A| = ${a} and |B| = ${b}, what is |P(A × B)|?`,
        correct: `${num(answer)}`,
        wrong: pickWrongs(`${num(answer)}`, wrongs, rng, 3),
        explanation: `|A × B| = |A|·|B| = ${a}·${b} = ${pairs}. A set with ${pairs} elements has a power set of size 2^${pairs} = ${num(answer)}. The common trap is adding cardinalities to get 2^(${a}+${b}), which is a different number.`,
        hint: 'First find |A × B|, then apply the power set rule 2^n.',
        correctWhy: `Correct: |P(A × B)| = 2^(|A|·|B|) = 2^${pairs} = ${num(answer)}.`,
      }
    },
  },
]
