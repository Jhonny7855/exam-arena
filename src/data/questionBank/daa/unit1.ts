import type { Family } from '../build'
import { num, pickWrongs } from '../build'
import { pick, randInt, type Rng } from '../../../lib/rng'
import { masterCase } from '../../../lib/algorithms'

const ORDER = [
  '1',
  'log log n',
  'log n',
  '√n',
  'n',
  'n log n',
  'n²',
  'n³',
  '2ⁿ',
  'n!',
]

function orderRank(label: string): number {
  return ORDER.indexOf(label)
}

const FN_BANK: { text: string; label: string; why: string }[] = [
  { text: '5n³ + 2n² + 7', label: 'n³', why: 'The cubic term dominates as n grows, so lower-order terms and constants are dropped.' },
  { text: '3n² + 100n', label: 'n²', why: 'The quadratic term dominates the linear term asymptotically, regardless of the coefficient 100.' },
  { text: 'n log n + n', label: 'n log n', why: 'n log n grows faster than n, so the linear term is absorbed.' },
  { text: '2ⁿ + n¹⁰', label: '2ⁿ', why: 'Any exponential eventually overtakes every polynomial, so n¹⁰ is dominated.' },
  { text: 'log₂ n + 1000', label: 'log n', why: 'An additive constant never changes the asymptotic order.' },
  { text: '√n + log n', label: '√n', why: '√n grows faster than log n, so the square-root term dominates.' },
  { text: 'n! + 2ⁿ', label: 'n!', why: 'n! grows faster than 2ⁿ because each factor eventually exceeds 2.' },
  { text: 'n + log n', label: 'n', why: 'n grows faster than log n, so the logarithmic term is dominated.' },
  { text: 'n² log n + n³', label: 'n³', why: 'n³ dominates n² log n for sufficiently large n.' },
  { text: '4 log n + 3', label: 'log n', why: 'Constant factors and additive constants do not affect the asymptotic class.' },
  { text: 'n√n + n²', label: 'n²', why: 'n√n = n^1.5 is polynomially smaller than n², so n² dominates.' },
  { text: '(log n)² + log n', label: 'log n', why: '(log n)² is Θ(log n) up to a log factor only in looser notation; here both are Θ((log n)²), and the tight simple class quoted is (log n)².' },
  { text: 'n + n log n + n²', label: 'n²', why: 'The highest polynomial degree dominates all lower terms.' },
  { text: '2^(n+1)', label: '2ⁿ', why: '2^(n+1) = 2·2ⁿ, and constant factors vanish in Θ notation.' },
  { text: 'n⁵ / 1000', label: 'n⁵', why: 'Dividing by a constant does not change the asymptotic order.' },
]

const GOOD_BANK = FN_BANK.filter((f) => f.label !== 'log n' || f.text === 'log₂ n + 1000' || f.text === '4 log n + 3')

export const daaUnit1Families: Family[] = [
  {
    id: 'daa-u1-big-o-classify',
    unit: 1,
    topic: 'Asymptotic notation',
    subtopic: 'Tight bound of a function',
    difficulty: 'Easy',
    type: 'Application',
    count: 20,
    seconds: 45,
    tags: ['big-o', 'theta', 'growth'],
    gen: (rng) => {
      const item = pick(rng, GOOD_BANK)
      const wrongs: [string, string][] = GOOD_BANK.filter((f) => f.label !== item.label)
        .filter((f, i, arr) => arr.findIndex((x) => x.label === f.label) === i)
        .map((f) => [
          f.label,
          `Θ(${f.label}) is not the tight class for this expression. The dominant term decides the order, and here that is ${item.label}.`,
        ])
      const shuffled = pickWrongs(item.label, wrongs, rng, 3)
      return {
        prompt: `Give the tightest asymptotic class Θ(g(n)) for f(n) = ${item.text}.`,
        correct: item.label,
        wrong: shuffled,
        explanation: `Keeping only the fastest-growing term and dropping constant factors leaves ${item.label}. ${item.why}`,
        hint: 'Keep the fastest-growing term, drop coefficients and lower-order terms.',
        correctWhy: `Correct: Θ(${item.label}). ${item.why}`,
      }
    },
  },
  {
    id: 'daa-u1-growth-order',
    unit: 1,
    topic: 'Growth rate ordering',
    subtopic: 'Comparing two functions',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 18,
    seconds: 50,
    tags: ['growth', 'comparison'],
    gen: (rng) => {
      let i = randInt(rng, 0, ORDER.length - 2)
      let j = randInt(rng, i + 1, ORDER.length - 1)
      if (rng() < 0.5) [i, j] = [j, i]
      const a = ORDER[i]
      const b = ORDER[j]
      const lower = i < j ? a : b
      const higher = i < j ? b : a
      const correct = `${higher} grows faster than ${lower}`
      return {
        prompt: `Compare the growth rates of g(n) = ${a} and h(n) = ${b}. Which statement is correct?`,
        correct,
        wrong: [
          [`${lower} grows faster than ${higher}`, `The standard order is 1 ≺ log log n ≺ log n ≺ √n ≺ n ≺ n log n ≺ n² ≺ n³ ≺ 2ⁿ ≺ n!, so ${higher} is the faster-growing function here.`],
          ['They have the same asymptotic growth', 'These are different positions in the standard growth hierarchy, so their ratio is not bounded by constants in both directions.'],
          ['Neither grows; both are bounded', 'Both functions increase without bound as n grows, so neither is bounded.'],
        ],
        explanation: `The standard hierarchy is 1 ≺ log log n ≺ log n ≺ √n ≺ n ≺ n log n ≺ n² ≺ n³ ≺ 2ⁿ ≺ n!. Since ${higher} sits above ${lower}, ${higher} grows faster.`,
        hint: 'Recall the standard growth hierarchy and locate both functions in it.',
        correctWhy: `Correct: in the hierarchy ${lower} comes before ${higher}, so ${higher} grows faster.`,
      }
    },
  },
  {
    id: 'daa-u1-master-theorem',
    unit: 1,
    topic: 'Master theorem',
    subtopic: 'Solving divide-and-conquer recurrences',
    difficulty: 'Medium',
    type: 'Application',
    count: 20,
    seconds: 70,
    tags: ['recurrence', 'master theorem'],
    gen: (rng) => {
      const cases: { a: number; b: number; fPower: number; fText: string; answer: string }[] = [
        { a: 2, b: 2, fPower: 1, fText: 'Θ(n)', answer: 'Θ(n log n)' },
        { a: 2, b: 2, fPower: 2, fText: 'Θ(n²)', answer: 'Θ(n²)' },
        { a: 2, b: 2, fPower: 0, fText: 'Θ(1)', answer: 'Θ(n)' },
        { a: 4, b: 2, fPower: 1, fText: 'Θ(n)', answer: 'Θ(n²)' },
        { a: 4, b: 2, fPower: 2, fText: 'Θ(n²)', answer: 'Θ(n² log n)' },
        { a: 8, b: 2, fPower: 2, fText: 'Θ(n²)', answer: 'Θ(n³)' },
        { a: 8, b: 2, fPower: 3, fText: 'Θ(n³)', answer: 'Θ(n³ log n)' },
        { a: 3, b: 2, fPower: 1, fText: 'Θ(n)', answer: 'Θ(n^1.585)' },
        { a: 9, b: 3, fPower: 2, fText: 'Θ(n²)', answer: 'Θ(n² log n)' },
        { a: 2, b: 4, fPower: 0, fText: 'Θ(1)', answer: 'Θ(√n)' },
      ]
      const c = pick(rng, cases)
      const which = masterCase(c.a, c.b, c.fPower)
      const critical = Math.round((Math.log(c.a) / Math.log(c.b)) * 1000) / 1000
      const pool: [string, string][] = [
        ['Θ(n²)', 'Θ(n²) is not what this recurrence resolves to under the master theorem for the given a, b and f(n).'],
        ['Θ(n log n)', 'Θ(n log n) only arises in case 2 when f(n) is Θ(n^(log_b a)) with log_b a = 1.'],
        ['Θ(n³)', 'Θ(n³) requires a polynomially larger driving function than this recurrence has.'],
        ['Θ(log n)', 'Θ(log n) would require the work per level to shrink geometrically, which is not the case here.'],
        ['Θ(2ⁿ)', 'The recurrence shrinks the input by a factor b > 1, so the cost is polynomial or n^k log n, never exponential.'],
        ['Θ(n^1.585)', 'The exponent 1.585 is log₂3, which only appears when a = 3 and b = 2.'],
        ['Θ(√n)', 'Θ(√n) requires log_b a = 1/2, as with a = 2 and b = 4 plus constant work.'],
        ['Θ(n² log n)', 'The extra log factor appears only when f(n) matches n^(log_b a) exactly.'],
      ]
      return {
        prompt: `Solve the recurrence T(n) = ${c.a}T(n/${c.b}) + ${c.fText}, using the master theorem.`,
        correct: c.answer,
        wrong: pickWrongs(c.answer, pool, rng, 3),
        explanation: `Here a = ${c.a}, b = ${c.b}, so n^(log_b a) = n^${critical}. Comparing with f(n) = ${c.fText} puts this in master theorem case ${which}. ${
          which === 1
            ? 'The driving function is polynomially smaller, so the homogeneous term wins.'
            : which === 2
              ? 'The driving function matches the homogeneous term, so a log factor is gained.'
              : 'The driving function is polynomially larger and regular, so it dominates.'
        } Hence T(n) = ${c.answer}.`,
        hint: 'Compute log_b a first, then compare n^(log_b a) with f(n).',
        correctWhy: `Correct: with a = ${c.a} and b = ${c.b}, n^(log_b a) = n^${critical}; case ${which} applies, giving ${c.answer}.`,
      }
    },
  },
  {
    id: 'daa-u1-recurrence-solve',
    unit: 1,
    topic: 'Recurrence relations',
    subtopic: 'Expansion method',
    difficulty: 'Medium',
    type: 'Application',
    count: 18,
    seconds: 60,
    tags: ['recurrence', 'expansion'],
    gen: (rng) => {
      const cases = [
        { rec: 'T(n) = T(n/2) + 1', answer: 'Θ(log n)', why: 'The input halves each level and only constant work is done per level, so the recursion depth is log₂ n.' },
        { rec: 'T(n) = T(n−1) + 1', answer: 'Θ(n)', why: 'Each call removes one unit of input, so there are n levels of constant work.' },
        { rec: 'T(n) = 2T(n/2) + n', answer: 'Θ(n log n)', why: 'Each of the log n levels costs Θ(n), so the total is Θ(n log n).' },
        { rec: 'T(n) = T(n/2) + n', answer: 'Θ(n)', why: 'The geometric series n + n/2 + n/4 + … converges to Θ(n), dominated by the top level.' },
        { rec: 'T(n) = 2T(n−1) + 1', answer: 'Θ(2ⁿ)', why: 'Each level doubles the number of calls, giving 2ⁿ leaves and exponential total work.' },
        { rec: 'T(n) = T(n−1) + n', answer: 'Θ(n²)', why: 'The sum 1 + 2 + … + n equals n(n+1)/2, which is Θ(n²).' },
        { rec: 'T(n) = 4T(n/2) + n', answer: 'Θ(n²)', why: 'Here log₂4 = 2 and f(n) = n is polynomially smaller, so the homogeneous term n² dominates.' },
        { rec: 'T(n) = 3T(n/2) + n', answer: 'Θ(n^1.585)', why: 'log₂3 ≈ 1.585 and f(n) = n is smaller, so the leaf term n^1.585 dominates.' },
      ]
      const c = pick(rng, cases)
      const pool: [string, string][] = [
        ['Θ(log n)', 'Θ(log n) requires the recursion depth to be logarithmic with constant work per level, which does not match this recurrence.'],
        ['Θ(n)', 'Θ(n) would mean a single linear pass; the recursion here accumulates more (or less) work than one pass.'],
        ['Θ(n log n)', 'Θ(n log n) needs Θ(n) work spread across log n levels, which this recurrence does not have.'],
        ['Θ(n²)', 'Θ(n²) needs a quadratic accumulation of work, which does not arise from this split structure.'],
        ['Θ(2ⁿ)', 'Θ(2ⁿ) requires the number of subcalls to grow with the input rather than shrink it.'],
        ['Θ(n^1.585)', 'The exponent 1.585 arises only from 3T(n/2), which is not this recurrence.'],
        ['Θ(1)', 'The work clearly grows with n, so a constant bound cannot be right.'],
      ]
      return {
        prompt: `What is the asymptotic solution of the recurrence ${c.rec}?`,
        correct: c.answer,
        wrong: pickWrongs(c.answer, pool, rng, 3),
        explanation: `${c.why} Therefore T(n) = ${c.answer}.`,
        hint: 'Expand a few levels and look at how the per-level cost accumulates.',
        correctWhy: `Correct: ${c.answer}. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u1-loop-complexity',
    unit: 1,
    topic: 'Best, worst and average case',
    subtopic: 'Cost of nested loops',
    difficulty: 'Easy',
    type: 'Application',
    count: 18,
    seconds: 45,
    tags: ['loops', 'counting'],
    gen: (rng) => {
      const cases = [
        {
          code: 'for (i = 0; i < n; i++) sum += a[i];',
          answer: 'Θ(n)',
          why: 'A single loop running n times with constant work inside performs Θ(n) operations.',
        },
        {
          code: 'for (i = 0; i < n; i++) for (j = 0; j < n; j++) sum += a[i][j];',
          answer: 'Θ(n²)',
          why: 'Two nested loops each running n times perform n·n = n² iterations.',
        },
        {
          code: 'for (i = 0; i < n; i++) for (j = i; j < n; j++) sum++;',
          answer: 'Θ(n²)',
          why: 'The inner loop runs n−i times, and 1 + 2 + … + n = n(n+1)/2 = Θ(n²).',
        },
        {
          code: 'for (i = 1; i < n; i *= 2) sum++;',
          answer: 'Θ(log n)',
          why: 'The counter doubles each step, so the loop body runs about log₂ n times.',
        },
        {
          code: 'for (i = 0; i < n; i++) for (j = 0; j < 1000; j++) sum++;',
          answer: 'Θ(n)',
          why: 'The inner loop bound is a constant 1000, so the total is 1000n = Θ(n).',
        },
        {
          code: 'for (i = 0; i < n; i++) for (j = 0; j < n; j++) for (k = 0; k < n; k++) sum++;',
          answer: 'Θ(n³)',
          why: 'Three nested loops each running n times give n³ iterations.',
        },
        {
          code: 'for (i = 0; i < n; i++) for (j = 1; j < n; j *= 2) sum++;',
          answer: 'Θ(n log n)',
          why: 'The outer loop runs n times and the inner logarithmic loop runs log n times, giving n log n.',
        },
        {
          code: 'for (i = 0; i < n; i++) for (j = 0; j < i; j++) for (k = 0; k < j; k++) sum++;',
          answer: 'Θ(n³)',
          why: 'The triple nested sum accumulates a cubic number of iterations, dominated by the innermost term.',
        },
      ]
      const c = pick(rng, cases)
      const pool: [string, string][] = [
        ['Θ(1)', 'The iteration count depends on n, so the cost is not constant.'],
        ['Θ(log n)', 'Θ(log n) needs the counter to grow geometrically, which this code does not do at the outermost level.'],
        ['Θ(n)', 'Θ(n) corresponds to a single linear pass, which undercounts the nested structure here.'],
        ['Θ(n log n)', 'Θ(n log n) needs one linear loop containing a logarithmic one, which is not the shape here.'],
        ['Θ(n²)', 'Θ(n²) comes from two nested linear loops; this code has a different nesting depth.'],
        ['Θ(n³)', 'Θ(n³) needs three nested linear loops, which is more than this code performs.'],
        ['Θ(2ⁿ)', 'Nothing in this code branches into two recursive calls, so exponential growth does not occur.'],
      ]
      return {
        prompt: `Determine the time complexity of the following code fragment.\n\n${c.code}`,
        correct: c.answer,
        wrong: pickWrongs(c.answer, pool, rng, 3),
        explanation: `${c.why} Hence the running time is ${c.answer}.`,
        hint: 'Count how many times the innermost statement executes as a function of n.',
        correctWhy: `Correct: ${c.answer}. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u1-log-identity',
    unit: 1,
    topic: 'Asymptotic notation',
    subtopic: 'Logarithm identities',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 15,
    seconds: 45,
    tags: ['logarithms', 'notation'],
    gen: (rng) => {
      const cases = [
        {
          q: 'Why can the base of a logarithm be ignored inside Θ notation?',
          correct: 'Because log_b n = log₂ n / log₂ b, a constant multiple of log₂ n',
          wrongs: [
            ['Because all logarithms are equal for every base', 'Logarithms to different bases differ by a constant factor, not by nothing — they are not equal, only asymptotically equivalent.'],
            ['Because Θ ignores logarithmic factors entirely', 'Θ does not ignore log factors; it ignores constant multipliers, which is the real reason here.'],
            ['Because n is always a power of 2 in algorithm analysis', 'The input size is arbitrary, so this cannot be the justification.'],
          ],
          why: 'Changing base multiplies by the constant 1/log₂ b, and constant factors vanish in Θ.',
        },
        {
          q: 'What is log₂(n²) equal to?',
          correct: '2 log₂ n',
          wrongs: [
            ['(log₂ n)²', 'Squaring the logarithm is different: log₂(n²) = 2 log₂ n, not (log₂ n)².'],
            ['log₂ n / 2', 'The power comes out as a multiplier, not a divisor.'],
            ['n log₂ n', 'The exponent of the argument becomes a coefficient, not an n multiplier.'],
          ],
          why: 'The power rule gives log₂(n²) = 2 log₂ n.',
        },
        {
          q: 'What is 2^(log₂ n) equal to?',
          correct: 'n',
          wrongs: [
            ['2n', 'Raising 2 to the power log₂ n exactly inverts the logarithm, giving n with no extra factor.'],
            ['log₂ n', 'This is the exponent itself, not the value obtained after exponentiating.'],
            ['n²', 'The square would come from 2^(2 log₂ n), not 2^(log₂ n).'],
          ],
          why: 'Exponentiation and logarithm to the same base are inverse operations, so 2^(log₂ n) = n.',
        },
        {
          q: 'Which grows faster: log₂ n or log₁₀ n?',
          correct: 'They have the same asymptotic growth',
          wrongs: [
            ['log₁₀ n grows faster because the base is larger', 'A larger base makes the logarithm smaller, not larger, and the difference is only a constant factor.'],
            ['log₂ n grows faster, but not by a constant factor', 'The ratio log₂ n / log₁₀ n = log₂ 10 is a constant, so the difference is exactly a constant factor.'],
            ['Neither grows', 'Both increase without bound, just slowly.'],
          ],
          why: 'log₂ n = log₁₀ n · log₂ 10, and log₂ 10 is a constant, so both are Θ(log n).',
        },
        {
          q: 'What is log₂(n · m) equal to?',
          correct: 'log₂ n + log₂ m',
          wrongs: [
            ['log₂ n · log₂ m', 'A product inside the logarithm becomes a sum outside it, not a product.'],
            ['log₂(n + m)', 'The product rule gives a sum of logarithms, not the logarithm of a sum.'],
            ['log₂ n − log₂ m', 'Subtraction corresponds to a quotient, not a product.'],
          ],
          why: 'The product rule states log₂(n·m) = log₂ n + log₂ m.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: `${c.why}`,
        hint: 'Use the standard logarithm rules: product, power, and change of base.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u1-case-analysis',
    unit: 1,
    topic: 'Best, worst and average case',
    subtopic: 'Search algorithm cases',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 16,
    seconds: 45,
    tags: ['best case', 'worst case', 'average case'],
    gen: (rng) => {
      const cases = [
        {
          q: 'For linear search over an array of n elements, what is the worst-case number of comparisons?',
          correct: 'n',
          wrongs: [
            ['1', 'One comparison is the best case, when the target is the first element.'],
            ['n/2', 'n/2 would be the average under a uniform distribution, not the worst case.'],
            ['log n', 'Logarithmic behaviour belongs to binary search on sorted data, not linear search.'],
          ],
          why: 'In the worst case the target is the last element or absent, so all n elements are compared.',
        },
        {
          q: 'For linear search with the target equally likely to be any position, what is the average number of comparisons?',
          correct: 'Θ(n)',
          wrongs: [
            ['Θ(1)', 'A constant average would require the target to be near the front almost always.'],
            ['Θ(log n)', 'Logarithmic behaviour requires halving the search space, which linear search does not do.'],
            ['Θ(n²)', 'Each element is compared at most once, so the average cannot be quadratic.'],
          ],
          why: 'The expected position is (n+1)/2, which is Θ(n).',
        },
        {
          q: 'What is the best-case time of insertion sort on an array of n elements?',
          correct: 'Θ(n)',
          wrongs: [
            ['Θ(1)', 'Every element is still examined once, so the best case is linear, not constant.'],
            ['Θ(n log n)', 'Insertion sort never achieves n log n; it is either Θ(n) or Θ(n²).'],
            ['Θ(n²)', 'Θ(n²) is the worst case, when the array is reverse sorted.'],
          ],
          why: 'On an already sorted array each element needs only one comparison, giving Θ(n) total.',
        },
        {
          q: 'What is the worst-case time of quicksort on n elements?',
          correct: 'Θ(n²)',
          wrongs: [
            ['Θ(n log n)', 'n log n is the average case; adversarial pivots degrade quicksort to quadratic time.'],
            ['Θ(n)', 'A sorting algorithm cannot be linear in the worst case unless it avoids comparisons.'],
            ['Θ(log n)', 'Sorting requires at least linear work to inspect the input.'],
          ],
          why: 'When the pivot is always the smallest or largest element, the partitions are sizes 0 and n−1, giving n+(n−1)+…= Θ(n²).',
        },
        {
          q: 'Which case does an algorithm analysis usually quote as its complexity guarantee?',
          correct: 'The worst case',
          wrongs: [
            ['The best case', 'The best case hides the cost on difficult inputs and is rarely a useful guarantee.'],
            ['The average case, always', 'Average case needs an explicit input distribution and is not always available.'],
            ['Whichever case is cheapest to compute', 'The choice of case is determined by the guarantee you need, not by computational convenience.'],
          ],
          why: 'Worst case bounds the maximum cost and therefore holds for every input of that size.',
        },
        {
          q: 'What does amortised analysis measure?',
          correct: 'The average cost per operation over a worst-case sequence of operations',
          wrongs: [
            ['The average cost over random inputs', 'That is average-case analysis; amortised analysis averages over a sequence of operations, not over random inputs.'],
            ['The best-case cost of one operation', 'Amortised analysis concerns sequences, and it bounds total cost, not the cheapest single operation.'],
            ['The memory used by an algorithm', 'Amortised analysis is about time (or other resource) totals over a sequence, not space specifically.'],
          ],
          why: 'Amortised analysis spreads the cost of expensive operations over the cheap ones that enable them.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Distinguish best, worst, average, and amortised cost carefully.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u1-space-complexity',
    unit: 1,
    topic: 'Space and time trade-offs',
    subtopic: 'Auxiliary space',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 15,
    seconds: 50,
    tags: ['space', 'recursion', 'in-place'],
    gen: (rng) => {
      const cases = [
        {
          q: 'What is the auxiliary space complexity of recursive merge sort on n elements?',
          correct: 'Θ(n)',
          wrongs: [
            ['Θ(1)', 'Merging needs a temporary buffer proportional to the input, so the space is not constant.'],
            ['Θ(log n)', 'The call stack is Θ(log n), but the merge buffers dominate at Θ(n).'],
            ['Θ(n²)', 'The buffers at any moment total at most n elements, not n².'],
          ],
          why: 'The merge step allocates a temporary array of size up to n, which dominates the Θ(log n) recursion stack.',
        },
        {
          q: 'What is the auxiliary space complexity of iterative binary search?',
          correct: 'Θ(1)',
          wrongs: [
            ['Θ(log n)', 'Θ(log n) is the space of the recursive version due to the call stack; the iterative version keeps only a few variables.'],
            ['Θ(n)', 'Binary search never copies the array, so linear auxiliary space is not needed.'],
            ['Θ(n log n)', 'There is no auxiliary structure proportional to n log n in binary search.'],
          ],
          why: 'The iterative version stores only low, high, and mid, which is constant space.',
        },
        {
          q: 'What is the auxiliary space complexity of heap sort?',
          correct: 'Θ(1)',
          wrongs: [
            ['Θ(n)', 'Heap sort reorders the array in place and needs no auxiliary array of size n.'],
            ['Θ(log n)', 'Heap sort is iterative, so it has no recursion stack; only a constant number of variables is used.'],
            ['Θ(n log n)', 'No auxiliary structure of that size is allocated by heap sort.'],
          ],
          why: 'Heap sort performs all work inside the input array using sift-down, so auxiliary space is constant.',
        },
        {
          q: 'What is the auxiliary space complexity of the standard 0/1 knapsack DP table?',
          correct: 'Θ(nW)',
          wrongs: [
            ['Θ(W)', 'Θ(W) is achievable with a rolling one-dimensional array, but the standard full table is Θ(nW).'],
            ['Θ(n)', 'The table has one row per item and one column per capacity value, so it is nW entries.'],
            ['Θ(1)', 'The table stores a value for every item-capacity pair, so it is not constant.'],
          ],
          why: 'The table has (n+1) rows and (W+1) columns, giving Θ(nW) entries.',
        },
        {
          q: 'What is the recursion depth of quicksort in the best case?',
          correct: 'Θ(log n)',
          wrongs: [
            ['Θ(n)', 'Θ(n) is the recursion depth when partitions are maximally unbalanced, not in the best case.'],
            ['Θ(1)', 'Quicksort recurses on subarrays, so the depth grows with n.'],
            ['Θ(n log n)', 'Recursion depth is measured in nested calls, which is logarithmic for balanced partitions.'],
          ],
          why: 'Balanced partitions halve the array each level, so the recursion depth is Θ(log n).',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Separate the input storage from extra memory the algorithm allocates.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u1-asymptotic-definition',
    unit: 1,
    topic: 'Asymptotic notation',
    subtopic: 'Formal definitions',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 15,
    seconds: 50,
    tags: ['big-o', 'definitions'],
    gen: (rng) => {
      const cases = [
        {
          q: 'Which is the correct formal definition of f(n) = O(g(n))?',
          correct: 'There exist constants c > 0 and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀',
          wrongs: [
            ['For every c > 0 there exists n₀ with f(n) ≤ c·g(n)', 'That is the definition of little-o, which is a strict upper bound; O allows some fixed constant c.'],
            ['There exist c > 0 and n₀ with f(n) ≥ c·g(n) for all n ≥ n₀', 'That is the definition of Ω, a lower bound.'],
            ['f(n) = g(n) for all sufficiently large n', 'O only requires f to be bounded above by a constant multiple of g, not equal to it.'],
          ],
          why: 'O is an upper bound up to a constant factor, valid for all sufficiently large n.',
        },
        {
          q: 'What does f(n) = Θ(g(n)) mean?',
          correct: 'f(n) = O(g(n)) and f(n) = Ω(g(n))',
          wrongs: [
            ['f(n) = O(g(n)) only', 'O alone gives only an upper bound; Θ needs both bounds.'],
            ['f(n) = o(g(n))', 'Little-o is a strict bound and excludes functions of the same order, so it is not Θ.'],
            ['f(n) and g(n) are equal for every n', 'Θ is an asymptotic bound, not pointwise equality.'],
          ],
          why: 'Θ is the intersection of O and Ω, meaning f is bounded both above and below by constant multiples of g.',
        },
        {
          q: 'What does f(n) = o(g(n)) mean?',
          correct: 'For every c > 0 there exists n₀ with f(n) < c·g(n) for all n ≥ n₀',
          wrongs: [
            ['There exists c > 0 with f(n) ≤ c·g(n)', 'That is the definition of O; little-o requires the bound to hold for every positive constant.'],
            ['f(n) grows faster than g(n)', 'Little-o means f grows strictly slower than g.'],
            ['f(n) = Θ(g(n))', 'Θ allows the same order, which little-o explicitly excludes.'],
          ],
          why: 'Little-o says f is dominated by g, i.e. the ratio f/g tends to 0.',
        },
        {
          q: 'If f(n) = O(g(n)) and g(n) = O(h(n)), what follows?',
          correct: 'f(n) = O(h(n))',
          wrongs: [
            ['f(n) = Ω(h(n))', 'Composing upper bounds gives an upper bound, not a lower bound.'],
            ['f(n) = Θ(h(n))', 'Θ would require a matching lower bound, which transitivity of O does not supply.'],
            ['Nothing can be concluded', 'Upper bounds are transitive, so the conclusion does follow.'],
          ],
          why: 'Big-O is transitive: chaining two upper bounds gives an upper bound.',
        },
        {
          q: 'Is it true that 2n = O(n)?',
          correct: 'Yes, because 2n ≤ 2·n for all n ≥ 1',
          wrongs: [
            ['No, because the constant 2 matters', 'Constant factors are exactly what O is designed to ignore.'],
            ['No, because O requires equality', 'O is an upper bound, not an equality relation.'],
            ['Only for n ≤ 2', 'The bound 2n ≤ 2n holds for every n, not just small ones.'],
          ],
          why: 'Choosing c = 2 and n₀ = 1 satisfies the definition of O.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Recall the quantifier structure: exists c and n₀ for O, every c for o.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u1-amortised',
    unit: 1,
    topic: 'Best, worst and average case',
    subtopic: 'Amortised cost of dynamic arrays',
    difficulty: 'Hard',
    type: 'Application',
    count: 10,
    seconds: 60,
    tags: ['amortised', 'dynamic array'],
    gen: (rng) => {
      const cases = [
        {
          q: 'A dynamic array doubles its capacity when full and copies all elements. Starting empty, what is the amortised cost of one append over n appends?',
          correct: 'Θ(1)',
          wrongs: [
            ['Θ(n)', 'A single append can cost Θ(n) when it triggers a resize, but the amortised cost averages that over many cheap appends.'],
            ['Θ(log n)', 'Doubling happens Θ(log n) times, but the total copy work sums to Θ(n), giving constant amortised cost.'],
            ['Θ(n log n)', 'The copy costs form a geometric series summing to Θ(n), not n log n.'],
          ],
          why: 'Total copying over n appends is 1+2+4+…+n < 2n, so the amortised cost per append is constant.',
        },
        {
          q: 'In the doubling dynamic array, how much total copying work is performed across n appends?',
          correct: 'Θ(n)',
          wrongs: [
            ['Θ(n²)', 'The copies form a geometric series, which sums to O(n), not O(n²).'],
            ['Θ(n log n)', 'There are only log n resizes and their costs halve going backwards, so the total is linear.'],
            ['Θ(1)', 'Copying does happen, just rarely; the total is proportional to n.'],
          ],
          why: 'The sum 1+2+4+…+2^k with 2^k ≤ n is less than 2n, which is Θ(n).',
        },
        {
          q: 'If a dynamic array grows by adding a fixed constant c cells instead of doubling, what is the amortised append cost?',
          correct: 'Θ(n)',
          wrongs: [
            ['Θ(1)', 'Constant growth means resizes happen Θ(n) times with growing copy cost, so the amortised cost becomes linear.'],
            ['Θ(log n)', 'Logarithmic amortised cost requires geometric growth.'],
            ['Θ(n log n)', 'The copy cost sums to Θ(n²) over n appends, so per-append it is Θ(n), not n log n.'],
          ],
          why: 'With constant increments, total copy work is c+2c+…+n ≈ n²/(2c), so amortised cost is Θ(n).',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Sum the cost of all resize operations and divide by the number of appends.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
]
