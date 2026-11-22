import type { Family } from '../build'
import { num, pickWrongs } from '../build'
import { pick, randInt, type Rng } from '../../../lib/rng'
import { quickselect, firstFitDecreasing, subsetSumDP } from '../../../lib/algorithms'

export const daaUnit6Families: Family[] = [
  {
    id: 'daa-u6-complexity-basics',
    unit: 6,
    topic: 'Complexity classes',
    subtopic: 'Everyday vocabulary of tractability',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 16,
    seconds: 40,
    tags: ['complexity classes', 'basics'],
    gen: (rng) => {
      const cases = [
        {
          q: 'A decision problem is one whose answer is:',
          correct: 'yes or no',
          wrongs: [
            ['a number of any size', 'Problems that output a number are function problems, not decision problems.'],
            ['an ordering of the input', 'Producing an ordering is an optimization or search task.'],
            ['the shortest path in a graph', 'A shortest path is an output value, not a yes/no answer.'],
          ],
          why: 'Complexity classes such as P and NP are defined for decision problems, whose output is a single bit.',
        },
        {
          q: 'The class P contains decision problems that can be:',
          correct: 'solved by a deterministic algorithm in polynomial time',
          wrongs: [
            ['solved by any algorithm at all', 'P is a bound on running time, not mere solvability.'],
            ['verified by a polynomial-time checker', 'Polynomial-time verification characterises NP, not P.'],
            ['solved only by brute force', 'Brute force is typically exponential and outside P.'],
          ],
          why: 'P is the set of decision problems with a deterministic polynomial-time algorithm.',
        },
        {
          q: 'The class NP contains decision problems whose yes-instances can be:',
          correct: 'verified in polynomial time given a certificate',
          wrongs: [
            ['solved in polynomial time without any help', 'That is the stronger requirement defining P.'],
            ['solved only in exponential time', 'Many problems in NP have polynomial algorithms.'],
            ['decided by a random algorithm with no error', 'That describes ZPP, a different class.'],
          ],
          why: 'NP is defined by short certificates that a polynomial-time verifier can check.',
        },
        {
          q: 'A problem is NP-complete when it is:',
          correct: 'in NP and every problem in NP reduces to it in polynomial time',
          wrongs: [
            ['in NP but no other NP problem reduces to it', 'That misses the hardness half of the definition.'],
            ['hard for NP but not known to be in NP', 'That is NP-hard, which is weaker than NP-complete.'],
            ['solvable in polynomial time and hardest in P', 'NP-complete problems are not known to be in P.'],
          ],
          why: 'NP-completeness combines membership in NP with NP-hardness, so it is the hardest class inside NP.',
        },
        {
          q: 'If P = NP were proved, then every NP-complete problem would be:',
          correct: 'solvable in polynomial time',
          wrongs: [
            ['unsolvable in practice', 'Equality of the classes would make them tractable, not unsolvable.'],
            ['still exponential in the worst case', 'P = NP would give polynomial algorithms for all of NP.'],
            ['removed from NP', 'The problem would remain in NP; it would also be in P.'],
          ],
          why: 'Since NP-complete problems are in NP, P = NP would place them in P, giving polynomial algorithms.',
        },
        {
          q: 'Which pair lists two classic NP-complete decision problems?',
          correct: '3-SAT and CLIQUE',
          wrongs: [
            ['Sorting and binary search', 'Both run in polynomial time, so neither is NP-complete.'],
            ['Minimum spanning tree and shortest path', 'Both have polynomial-time algorithms.'],
            ['Matrix multiplication and string matching', 'Both are polynomial-time computable.'],
          ],
          why: '3-SAT and CLIQUE are canonical NP-complete problems used as the roots of most reductions.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Recall the definitions of P, NP, NP-hard and NP-complete.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u6-np-definition',
    unit: 6,
    topic: 'Decision problems and classes P and NP',
    subtopic: 'Defining P, NP, NP-hard',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 20,
    seconds: 50,
    tags: ['complexity classes', 'np'],
    gen: (rng) => {
      const cases = [
        {
          q: 'What does NP stand for in complexity theory?',
          correct: 'Nondeterministic polynomial time',
          wrongs: [
            ['Not polynomial', 'NP is not the complement of P; all of P is contained in NP.'],
            ['Non-polynomial', 'Problems in NP do have polynomial-time verifiers, so the name is not "non-polynomial".'],
            ['Nearly polynomial', 'There is no such standard class; NP is defined by nondeterministic polynomial time.'],
          ],
          why: 'NP is the class of decision problems solvable by a nondeterministic Turing machine in polynomial time.',
        },
        {
          q: 'Which statement about P and NP is currently known to be true?',
          correct: 'P ⊆ NP',
          wrongs: [
            ['P = NP', 'This is the famous open problem; it has not been proved.'],
            ['NP ⊂ P', 'This would contradict the definition of P as a subset of NP.'],
            ['P and NP are disjoint', 'Every problem in P is trivially in NP.'],
          ],
          why: 'A deterministic polynomial-time algorithm is a special case of a nondeterministic one, so P ⊆ NP.',
        },
        {
          q: 'A problem is NP-hard if:',
          correct: 'every problem in NP reduces to it in polynomial time',
          wrongs: [
            ['it is in NP', 'Being in NP makes it NP-complete only if it is also NP-hard.'],
            ['no polynomial algorithm is known for it', 'Lack of a known algorithm is not a definition.'],
            ['it can be solved in exponential time', 'Many problems outside NP are solvable in exponential time.'],
          ],
          why: 'NP-hardness is defined by the reduction direction: all of NP must reduce to the problem.',
        },
        {
          q: 'A problem is NP-complete if:',
          correct: 'it is in NP and every NP problem reduces to it',
          wrongs: [
            ['it is in NP only', 'Membership in NP alone is necessary but not sufficient.'],
            ['every NP problem reduces to it, but it may lie outside NP', 'That is NP-hard, which is weaker than NP-complete.'],
            ['it has no known polynomial-time algorithm', 'That is an empirical observation, not the definition.'],
          ],
          why: 'NP-complete is exactly the intersection NP-hard ∩ NP: the problem must be hard for all of NP and must itself be a decision problem in NP.',
        },
        {
          q: 'What is a certificate for a decision problem?',
          correct: 'A witness that a verifier can check in polynomial time to confirm a yes-instance',
          wrongs: [
            ['A proof that the answer is no', 'Certificates in the NP definition witness yes-instances.'],
            ['The output of the decision algorithm', 'A decision algorithm outputs only yes or no, not a witness.'],
            ['A polynomial-time algorithm for the problem', 'A certificate is data, not an algorithm.'],
          ],
          why: 'NP is equivalently defined by polynomial-time verification of a polynomial-size witness.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Recall the formal definitions in terms of reductions and verifiers.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u6-reduction-direction',
    unit: 6,
    topic: 'Polynomial reductions',
    subtopic: 'Reduction direction',
    difficulty: 'Hard',
    type: 'Conceptual',
    count: 20,
    seconds: 60,
    tags: ['reductions', 'np-hardness'],
    gen: (rng) => {
      const cases = [
        {
          q: 'To prove that a new problem X is NP-hard, which reduction is required?',
          correct: 'Reduce a known NP-hard problem to X',
          wrongs: [
            ['Reduce X to a known NP-hard problem', 'That direction only shows X is no harder than the known problem; it proves nothing about hardness.'],
            ['Reduce X to a problem in P', 'This would show X ∈ P if anything, not that X is hard.'],
            ['Reduce a problem in P to X', 'P problems are easy, so this transfers no hardness.'],
          ],
          why: 'Hardness flows backwards along the reduction: if all of NP reduces to X, then X is at least as hard as NP.',
        },
        {
          q: 'If A ≤p B and B ∈ P, what follows?',
          correct: 'A ∈ P',
          wrongs: [
            ['B is NP-hard', 'B being in P gives no hardness information.'],
            ['A is NP-hard', 'A is the easier problem here, reducing to B.'],
            ['Nothing, because reductions only work one way', 'This is precisely the useful direction of a reduction.'],
          ],
          why: 'Compose the polynomial reduction with the polynomial algorithm for B to get a polynomial algorithm for A.',
        },
        {
          q: 'If A ≤p B and A is NP-hard, what follows?',
          correct: 'B is NP-hard',
          wrongs: [
            ['B ∈ P', 'B is at least as hard as the NP-hard A.'],
            ['A ∈ NP', 'A being NP-hard does not imply it lies in NP.'],
            ['Nothing can be concluded', 'Hardness transfers from the source to the target.'],
          ],
          why: 'Every NP problem reduces to A, and A reduces to B, so every NP problem reduces to B.',
        },
        {
          q: 'Why must a reduction run in polynomial time?',
          correct: 'Otherwise the reduction itself could solve the problem with exponential work, destroying the complexity conclusion',
          wrongs: [
            ['Because polynomial time is always achievable', 'Many natural reductions are polynomial, but that is not why the requirement exists.'],
            ['Because exponential reductions do not preserve answers', 'They do preserve answers; the problem is the time bound.'],
            ['Because NP only contains polynomial problems', 'NP contains problems with no known polynomial algorithm.'],
          ],
          why: 'The composition argument requires both the reduction and the target algorithm to be polynomial.',
        },
        {
          q: 'Which of the following is a valid reduction to prove that CLIQUE is NP-hard?',
          correct: '3-SAT ≤p CLIQUE',
          wrongs: [
            ['CLIQUE ≤p 3-SAT', 'This direction only shows CLIQUE is no harder than 3-SAT.'],
            ['CLIQUE ≤p VERTEX-COVER', 'Both are NP-complete; this direction proves nothing new.'],
            ['SORTING ≤p CLIQUE', 'Sorting is in P, so it transfers no hardness.'],
          ],
          why: 'Reducing a known NP-complete problem such as 3-SAT to CLIQUE proves CLIQUE is at least as hard.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Hardness transfers from the known-hard problem to the new one.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u6-classic-npc',
    unit: 6,
    topic: 'Classic NP-complete problems',
    subtopic: 'Identifying NP-complete problems',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 18,
    seconds: 50,
    tags: ['np-complete', 'classics'],
    gen: (rng) => {
      const npc = ['3-SAT', 'CLIQUE', 'VERTEX-COVER', 'HAMILTONIAN-CYCLE', 'SUBSET-SUM', 'GRAPH-3-COLOURING', 'TSP (decision version)']
      const poly = ['2-SAT', 'SHORTEST-PATH', 'MINIMUM SPANNING TREE', 'SORTING', 'MAXIMUM MATCHING in bipartite graphs', 'PRIMALITY TESTING']
      const isNpc = rng() < 0.6
      const item = pick(rng, isNpc ? npc : poly)
      const correct = isNpc ? 'NP-complete' : 'Solvable in polynomial time'
      const wrongs: [string, string][] = isNpc
        ? [
            ['Solvable in polynomial time', `No polynomial algorithm is known for ${item}, and it is NP-complete.`],
            ['Undecidable', 'These problems are decidable by brute-force search, just not efficiently.'],
            ['NP-hard but not in NP', `${item} is a decision problem in NP, so it is NP-complete, not merely NP-hard.`],
          ]
        : [
            ['NP-complete', `${item} has a known polynomial-time algorithm, so it cannot be NP-complete unless P = NP.`],
            ['Undecidable', `${item} is decidable and in fact efficiently solvable.`],
            ['NP-hard but not in NP', `${item} lies in P, so it is not NP-hard unless P = NP.`],
          ]
      return {
        prompt: `Classify the decision problem ${item}.`,
        correct,
        wrong: pickWrongs(correct, wrongs, rng, 3),
        explanation: isNpc
          ? `${item} is one of the standard NP-complete problems: it lies in NP and a known NP-complete problem reduces to it.`
          : `${item} admits a polynomial-time algorithm, placing it in P and therefore in NP as well.`,
        hint: 'Ask whether a polynomial algorithm is known for the problem.',
        correctWhy: `Correct: ${item} is ${correct.toLowerCase()}.`,
      }
    },
  },
  {
    id: 'daa-u6-approx-ratio',
    unit: 6,
    topic: 'Approximation algorithms',
    subtopic: 'Known approximation ratios',
    difficulty: 'Hard',
    type: 'Conceptual',
    count: 18,
    seconds: 60,
    tags: ['approximation', 'ratios'],
    gen: (rng) => {
      const table = [
        { problem: 'Vertex cover (maximal matching heuristic)', ratio: '2' },
        { problem: 'Metric TSP (Christofides)', ratio: '1.5' },
        { problem: 'Bin packing (first-fit decreasing)', ratio: '11/9' },
        { problem: 'Bin packing (next-fit)', ratio: '2' },
        { problem: 'Metric TSP (double-tree / MST tour)', ratio: '2' },
      ]
      const item = pick(rng, table)
      const correct = item.ratio
      const wrongs: [string, string][] = table
        .filter((t) => t.ratio !== correct)
        .filter((t, i, arr) => arr.findIndex((x) => x.ratio === t.ratio) === i)
        .map((t) => [t.ratio, `${t.ratio} is the ratio for ${t.problem}, not for ${item.problem}.`])
      wrongs.push(['1', 'A ratio of 1 would mean the heuristic is always optimal, which is not the case here.'])
      return {
        prompt: `What approximation ratio does the standard ${item.problem} algorithm guarantee?`,
        correct,
        wrong: pickWrongs(correct, wrongs, rng, 3),
        explanation: `The ${item.problem} algorithm guarantees a solution within a factor ${item.ratio} of the optimum.`,
        hint: 'Recall the classical ratio associated with this specific heuristic.',
        correctWhy: `Correct: ratio ${item.ratio}.`,
      }
    },
  },
  {
    id: 'daa-u6-bin-packing-count',
    unit: 6,
    topic: 'Bin packing',
    subtopic: 'First-fit decreasing bins',
    difficulty: 'Hard',
    type: 'Application',
    count: 15,
    seconds: 70,
    tags: ['bin packing', 'first fit decreasing'],
    gen: (rng) => {
      const capacity = 10
      const n = randInt(rng, 5, 9)
      const items = Array.from({ length: n }, () => randInt(rng, 2, 8))
      const ffd = firstFitDecreasing(items, capacity)
      const c = num(ffd)
      const lower = Math.ceil(items.reduce((a, b) => a + b, 0) / capacity)
      const wrongs: [string, string][] = [
        [num(lower), `${lower} is the volume lower bound; first-fit decreasing actually uses ${ffd} bins for this list.`],
        [num(ffd + 1), `This is one bin more than first-fit decreasing uses (${ffd}).`],
        [num(Math.max(ffd - 1, 1)), `This is one bin fewer than first-fit decreasing uses (${ffd}).`],
        [num(n), `${n} counts items, not bins.`],
        [num(ffd * 2), `This doubles the first-fit decreasing bin count ${ffd}.`],
      ]
      return {
        prompt: `Items of sizes [${items.join(', ')}] are packed into bins of capacity ${capacity} using first-fit decreasing. How many bins are used?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Sorting descending gives [${[...items].sort((a, b) => b - a).join(', ')}]. Placing each item in the first bin with room yields ${ffd} bins.`,
        hint: 'Sort descending, then place each item in the first fitting bin.',
        correctWhy: `Correct: ${ffd} bins.`,
      }
    },
  },
  {
    id: 'daa-u6-quickselect',
    unit: 6,
    topic: 'Selection and order statistics',
    subtopic: 'Quickselect on a concrete array',
    difficulty: 'Hard',
    type: 'Application',
    count: 15,
    seconds: 70,
    tags: ['quickselect', 'order statistics'],
    gen: (rng) => {
      const n = randInt(rng, 6, 9)
      const pool = Array.from({ length: 40 }, (_, i) => i + 1)
      const arr: number[] = []
      const used = new Set<number>()
      while (arr.length < n) {
        const v = pick(rng, pool)
        if (used.has(v)) continue
        used.add(v)
        arr.push(v)
      }
      const k = randInt(rng, 1, n)
      const value = quickselect(arr, k)
      const sorted = [...arr].sort((a, b) => a - b)
      const c = num(value)
      const wrongs: [string, string][] = [
        [num(sorted[k - 1 === 0 ? 1 : k - 2]), `That is the neighbouring order statistic, not the ${k}-th smallest.`],
        [num(Math.max(...arr)), `The maximum is the ${n}-th smallest, not the ${k}-th.`],
        [num(Math.min(...arr)), `The minimum is the 1st smallest, not the ${k}-th.`],
        [num(k), `${k} is the rank, not the value at that rank.`],
        [num(value + 1), `This is one more than the correct order statistic ${value}.`],
      ]
      return {
        prompt: `Given the array [${arr.join(', ')}], what is the ${k}-th smallest element (1-indexed)?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Sorting for reference gives [${sorted.join(', ')}], so the ${k}-th smallest is ${value}. Quickselect finds it in expected linear time without fully sorting.`,
        hint: 'Sort a copy mentally and read off the k-th position.',
        correctWhy: `Correct: the ${k}-th smallest is ${value}.`,
      }
    },
  },
  {
    id: 'daa-u6-randomised',
    unit: 6,
    topic: 'Randomised algorithms',
    subtopic: 'Las Vegas versus Monte Carlo',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 18,
    seconds: 50,
    tags: ['randomised', 'las vegas', 'monte carlo'],
    gen: (rng) => {
      const cases = [
        {
          q: 'Which statement describes a Las Vegas randomised algorithm?',
          correct: 'It always produces a correct answer, but its running time is random',
          wrongs: [
            ['It may produce a wrong answer with small probability', 'That describes a Monte Carlo algorithm.'],
            ['It runs in deterministic worst-case time', 'Randomisation affects the running time in a Las Vegas algorithm.'],
            ['It never uses randomness in the output', 'The output may depend on random choices; correctness is what is guaranteed.'],
          ],
          why: 'Las Vegas algorithms trade running-time certainty for output certainty.',
        },
        {
          q: 'Which statement describes a Monte Carlo randomised algorithm?',
          correct: 'It runs in bounded time but may produce a wrong answer with bounded probability',
          wrongs: [
            ['It always produces a correct answer', 'That is the Las Vegas guarantee.'],
            ['It cannot be analysed probabilistically', 'Monte Carlo algorithms are analysed by bounding the error probability.'],
            ['It requires exponential time', 'Monte Carlo algorithms are usually polynomial.'],
          ],
          why: 'Monte Carlo algorithms bound the error probability while keeping the runtime deterministic.',
        },
        {
          q: 'What is the expected running time of randomised quicksort?',
          correct: 'Θ(n log n)',
          wrongs: [
            ['Θ(n²)', 'Θ(n²) is the worst case, which randomisation makes unlikely but does not eliminate.'],
            ['Θ(n)', 'Partitioning is linear but the recursion adds a logarithmic factor.'],
            ['Θ(n log² n)', 'The standard analysis gives Θ(n log n) expected time.'],
          ],
          why: 'Random pivots make the expected number of comparisons about 2n ln n = Θ(n log n).',
        },
        {
          q: 'Miller-Rabin primality testing is which kind of algorithm?',
          correct: 'Monte Carlo',
          wrongs: [
            ['Las Vegas', 'Miller-Rabin can report a composite as prime with small probability, so it is Monte Carlo.'],
            ['Deterministic', 'The standard form picks random bases, making it randomised.'],
            ['Exact in all cases', 'The error probability is small but nonzero unless deterministic bases are used.'],
          ],
          why: 'Miller-Rabin errs one-sided with probability at most 1/4 per round, the Monte Carlo signature.',
        },
        {
          q: 'What is the expected time of randomised quickselect for the k-th smallest element?',
          correct: 'Θ(n)',
          wrongs: [
            ['Θ(n log n)', 'Quickselect recurses into only one partition, so it avoids the sorting log factor.'],
            ['Θ(n²)', 'Quadratic time is the unlikely worst case, not the expectation.'],
            ['Θ(log n)', 'Finding an order statistic requires examining the elements.'],
          ],
          why: 'The recurrence T(n) = T(3n/4) + Θ(n) in expectation solves to Θ(n).',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Separate guarantees about correctness from guarantees about running time.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u6-weakly-np',
    unit: 6,
    topic: 'Classic NP-complete problems',
    subtopic: 'Weak versus strong NP-completeness',
    difficulty: 'Hard',
    type: 'Conceptual',
    count: 15,
    seconds: 60,
    tags: ['np-complete', 'pseudo-polynomial'],
    gen: (rng) => {
      const cases = [
        {
          q: 'Why is subset sum called weakly NP-complete?',
          correct: 'It has a pseudo-polynomial algorithm whose running time is polynomial in the numeric target value',
          wrongs: [
            ['Because it is easy on average', 'Weak NP-completeness is about encoding, not average-case difficulty.'],
            ['Because it only has small instances', 'Instances can be arbitrarily large; the encoding matters.'],
            ['Because it is not really NP-complete', 'It is NP-complete; "weak" describes the pseudo-polynomial algorithm.'],
          ],
          why: 'The DP runs in Θ(n·target), polynomial in the numeric value but exponential in the bit length of the target.',
        },
        {
          q: 'What does a pseudo-polynomial algorithm imply about a problem?',
          correct: 'It is polynomial when the numeric values are bounded by a polynomial in the input length',
          wrongs: [
            ['The problem is in P', 'Pseudo-polynomial time does not imply polynomial time in the input length.'],
            ['The problem is not NP-hard', 'Subset sum is NP-hard despite having a pseudo-polynomial algorithm.'],
            ['The problem has no exact algorithm', 'Pseudo-polynomial algorithms are exact.'],
          ],
          why: 'Encoding values in unary makes the running time polynomial, which is why the class is called weakly NP-complete.',
        },
        {
          q: 'Which problem is strongly NP-complete?',
          correct: '3-PARTITION',
          wrongs: [
            ['Subset sum', 'Subset sum is only weakly NP-complete.'],
            ['Partition', 'Partition is also weakly NP-complete.'],
            ['0/1 knapsack', 'Knapsack is weakly NP-complete via its pseudo-polynomial DP.'],
          ],
          why: '3-PARTITION remains NP-complete even when all numbers are bounded by a polynomial in n.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Think about whether the algorithm depends on the numeric value or the bit length.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u6-subset-dp',
    unit: 6,
    topic: 'Approximation algorithms',
    subtopic: 'Exact DP for subset sum',
    difficulty: 'Medium',
    type: 'Application',
    count: 12,
    seconds: 60,
    tags: ['subset sum', 'pseudo-polynomial'],
    gen: (rng) => {
      const n = randInt(rng, 4, 7)
      const weights = Array.from({ length: n }, () => randInt(rng, 1, 15))
      const total = weights.reduce((a, b) => a + b, 0)
      const target = randInt(rng, 1, total)
      const possible = subsetSumDP(weights, target)
      const correct = possible ? 'Yes' : 'No'
      const reachable = new Set<number>([0])
      for (const w of weights) for (const s of [...reachable]) reachable.add(s + w)
      return {
        prompt: `Using the pseudo-polynomial subset-sum DP, determine whether a subset of {${weights.join(', ')}} sums to exactly ${target}.`,
        correct,
        wrong: possible
          ? [
              ['No', `The DP marks ${target} reachable, so a subset does exist.`],
              ['Only with repeated weights', `The 0/1 DP forbids repeats and still reaches ${target}.`],
              ['The DP cannot decide this', 'The DP decides subset sum exactly for any positive integer weights.'],
            ]
          : [
              ['Yes', `The DP table never marks ${target}; the reachable sums are ${[...reachable].sort((a, b) => a - b).join(', ')}.`],
              ['Only with repeated weights', `Repeats would only add more reachable sums, and ${target} is not among them anyway.`],
              ['The DP cannot decide this', 'The DP decides subset sum exactly for any positive integer weights.'],
            ],
        explanation: `Starting from dp[0] = true, each weight w updates dp[s] = dp[s] or dp[s−w] for s from ${target} down to w. The reachable sums are {${[...reachable].sort((a, b) => a - b).join(', ')}}, so ${target} is ${possible ? '' : 'not '}reachable.`,
        hint: 'Sweep the target downward for each weight to avoid reusing an item.',
        correctWhy: `Correct: ${target} is ${possible ? '' : 'not '}reachable by the DP.`,
      }
    },
  },
]
