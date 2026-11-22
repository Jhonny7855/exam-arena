import type { Family } from '../build'
import { num, pickWrongs } from '../build'
import { pick, randInt, shuffle, type Rng } from '../../../lib/rng'
import {
  coinChangeMin,
  coinChangeWays,
  knapsack01,
  fractionalKnapsack,
  matrixChainCost,
  lcsLength,
  editDistance,
  assemblyLine,
  greedyCoinCount,
  nthCatalan,
} from '../../../lib/algorithms'

const ALPH = ['a', 'b', 'c', 'd']

function randWord(rng: Rng, len: number): string {
  return Array.from({ length: len }, () => pick(rng, ALPH)).join('')
}

function randDims(rng: Rng, count: number): number[] {
  return Array.from({ length: count + 1 }, () => randInt(rng, 2, 12))
}

const fmtDims = (d: number[]) => d.join(' × ')

export const daaUnit3Families: Family[] = [
  {
    id: 'daa-u3-coin-min',
    unit: 3,
    topic: 'Making change',
    subtopic: 'Minimum coins via DP',
    difficulty: 'Medium',
    type: 'Application',
    count: 20,
    seconds: 70,
    tags: ['coin change', 'dynamic programming'],
    gen: (rng) => {
      const coins = shuffle(rng, [1, 2, 3, 4, 5, 6, 7]).slice(0, randInt(rng, 3, 4))
      const coinList = [...new Set(coins)].sort((a, b) => a - b)
      if (!coinList.includes(1)) coinList.push(1)
      coinList.sort((a, b) => a - b)
      const amount = randInt(rng, 8, 40)
      const best = coinChangeMin(coinList, amount)
      const greedy = greedyCoinCount(coinList, amount)
      const c = num(best)
      const wrongs: [string, string][] = [
        [num(greedy), greedy === best ? `Greedy also gives ${best} here, but this option is presented as the greedy result — the DP optimum is still ${best}.` : `Greedy picking the largest coin first gives ${greedy} coins here, which is not optimal. The DP finds ${best}.`],
        [num(Math.max(best - 1, 1)), `This is one fewer than the optimum ${best}, which is impossible since ${best} is the minimum.`],
        [num(best + 1), `This is one more than the optimum ${best}; the DP table shows a combination with ${best} coins.`],
        [num(Math.floor(amount / Math.max(...coinList))), `Dividing the amount by the largest coin ignores the remainder, which still needs to be covered.`],
        [num(amount), `Using only unit coins would take ${amount} coins, which is the worst possible choice here.`],
      ]
      return {
        prompt: `Coins of denominations {${coinList.join(', ')}} are available in unlimited supply. What is the minimum number of coins needed to make exactly ${amount}?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `The DP fills C(a) = 1 + min over coins d ≤ a of C(a − d), from a = 0 upward. For amount ${amount} the optimal value is ${best} coins. ${greedy !== best ? `Note that greedy would use ${greedy} coins, which is not optimal.` : 'Greedy happens to match the optimum for this denomination set.'}`,
        hint: 'Build the table from 0 to the target, taking one coin plus the best remainder.',
        correctWhy: `Correct: ${best} coins is the DP optimum.`,
      }
    },
  },
  {
    id: 'daa-u3-coin-ways',
    unit: 3,
    topic: 'Making change',
    subtopic: 'Counting combinations',
    difficulty: 'Hard',
    type: 'Application',
    count: 15,
    seconds: 70,
    tags: ['coin change', 'counting'],
    gen: (rng) => {
      const coinList = [...new Set(shuffle(rng, [1, 2, 3, 5, 10]).slice(0, randInt(rng, 2, 3)))].sort((a, b) => a - b)
      if (!coinList.includes(1)) coinList.unshift(1)
      const amount = randInt(rng, 6, 20)
      const ways = coinChangeWays(coinList, amount)
      const c = num(ways)
      const wrongs: [string, string][] = [
        [num(ways * 2), `This is double the correct count ${ways}, which happens when ordered sequences are counted instead of unordered combinations.`],
        [num(Math.max(ways - 1, 1)), `This is one short of the true count ${ways}.`],
        [num(ways + 1), `This is one over the true count ${ways}.`],
        [num(amount), `${amount} is the number of unit coins, not the number of distinct combinations.`],
        [num(coinList.length), `${coinList.length} is the number of denominations, not the number of ways.`],
      ]
      return {
        prompt: `Using unlimited coins of denominations {${coinList.join(', ')}}, how many distinct unordered combinations make exactly ${amount}?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Iterating the coins in the outer loop and amounts in the inner loop counts unordered combinations: dp[0] = 1, then dp[a] += dp[a − d] for each denomination. For ${amount} with {${coinList.join(', ')}} the count is ${ways}.`,
        hint: 'Put the denomination loop outside the amount loop to avoid counting permutations.',
        correctWhy: `Correct: ${ways} distinct combinations.`,
      }
    },
  },
  {
    id: 'daa-u3-knapsack-01',
    unit: 3,
    topic: '0/1 knapsack',
    subtopic: 'Optimal value',
    difficulty: 'Hard',
    type: 'Application',
    count: 20,
    seconds: 90,
    tags: ['knapsack', 'dynamic programming'],
    gen: (rng) => {
      const n = randInt(rng, 3, 4)
      const weights = Array.from({ length: n }, () => randInt(rng, 1, 7))
      const values = Array.from({ length: n }, () => randInt(rng, 4, 20))
      const capacity = randInt(rng, 8, 18)
      const best = knapsack01(weights, values, capacity)
      const frac = fractionalKnapsack(weights, values, capacity)
      const greedyValue = (() => {
        const idx = weights.map((w, i) => i).sort((a, b) => values[b] / weights[b] - values[a] / weights[a])
        let cap = capacity
        let total = 0
        for (const i of idx) {
          if (weights[i] <= cap) {
            cap -= weights[i]
            total += values[i]
          }
        }
        return total
      })()
      const c = num(best)
      const wrongs: [string, string][] = [
        [num(greedyValue), greedyValue === best ? `Taking items greedily by value density also reaches ${best} for this instance, but that is a coincidence; the DP optimum is ${best}.` : `Greedily taking items by value density yields ${greedyValue}, which is below the optimum ${best} because 0/1 choices cannot be split.`],
        [String(frac).replace(/\.0$/, ''), `${frac} is the fractional-knapsack value, which allows taking part of an item and is therefore an upper bound, not the 0/1 answer.`],
        [num(best + 3), `This exceeds the optimum ${best}, which is impossible since the DP maximises over all feasible subsets.`],
        [num(Math.max(best - 4, 1)), `This is below the optimum ${best}; the DP table finds a better subset.`],
        [num(values.reduce((a, b) => a + b, 0)), `${num(values.reduce((a, b) => a + b, 0))} takes every item, which exceeds the capacity of ${capacity}.`],
      ]
      return {
        prompt: `Items have weights [${weights.join(', ')}] and values [${values.join(', ')}]. The knapsack capacity is ${capacity}. What is the maximum total value achievable when each item may be taken at most once?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `The 0/1 DP fills V(i,c) = max(V(i−1,c), vᵢ + V(i−1, c−wᵢ)) for wᵢ ≤ c. Evaluating the table for capacity ${capacity} gives the optimum ${best}. The fractional relaxation would allow ${frac}, which is only an upper bound.`,
        hint: 'For each item, compare skipping it with taking it and using the remaining capacity.',
        correctWhy: `Correct: the optimum 0/1 value is ${best}.`,
      }
    },
  },
  {
    id: 'daa-u3-mcm-cost',
    unit: 3,
    topic: 'Matrix chain multiplication',
    subtopic: 'Minimum scalar multiplications',
    difficulty: 'Hard',
    type: 'Application',
    count: 18,
    seconds: 90,
    tags: ['matrix chain', 'dynamic programming'],
    gen: (rng) => {
      const count = randInt(rng, 3, 5)
      const dims = randDims(rng, count)
      const best = matrixChainCost(dims)
      const catalan = nthCatalan(count - 1)
      const c = num(best)
      const wrongs: [string, string][] = [
        [num(catalan), `${catalan} is the number of distinct parenthesations (Catalan number C(${count - 1})), not the cost.`],
        [num(dims.slice(0, count).reduce((a, b) => a * b, 1) * dims[count]), `Left-to-right multiplication in the given order gives a different cost than the optimal parenthesisation.`],
        [num(best + dims[1] * dims[count]), `This adds an extra term ${num(dims[1] * dims[count])} that does not appear in the optimal split.`],
        [num(Math.max(best - 10, 1)), `This is slightly below the optimum ${best}; the DP table finds no cheaper parenthesisation.`],
        [num(best * 2), `This is double the optimum ${best}, which happens if each subproblem cost is counted twice.`],
      ]
      return {
        prompt: `Matrices have dimensions ${fmtDims(dims)} (that is ${count} matrices). What is the minimum number of scalar multiplications needed to compute the product?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `The interval DP uses m[i,j] = min over k of m[i,k] + m[k+1,j] + dᵢ·dₖ₊₁·dⱼ₊₁ for dimensions ${fmtDims(dims)}. Filling by increasing chain length gives ${best} scalar multiplications.`,
        hint: 'Cost of splitting at k is left cost + right cost + dᵢ·dₖ₊₁·dⱼ₊₁.',
        correctWhy: `Correct: ${best} scalar multiplications with optimal parenthesisation.`,
      }
    },
  },
  {
    id: 'daa-u3-lcs',
    unit: 3,
    topic: 'Longest common subsequence',
    subtopic: 'LCS length',
    difficulty: 'Medium',
    type: 'Application',
    count: 20,
    seconds: 70,
    tags: ['lcs', 'dynamic programming'],
    gen: (rng) => {
      const base = randWord(rng, randInt(rng, 4, 6))
      const mutate = (w: string): string => {
        const chars = w.split('')
        const out: string[] = []
        for (const ch of chars) {
          if (rng() < 0.3) out.push(pick(rng, ALPH))
          out.push(ch)
          if (rng() < 0.2) out.push(pick(rng, ALPH))
        }
        return out.join('')
      }
      const x = mutate(base)
      const y = mutate(base)
      const best = lcsLength(x, y)
      const c = num(best)
      const wrongs: [string, string][] = [
        [num(Math.min(x.length, y.length)), `The full shorter string is rarely a subsequence of the other; the LCS is ${best}.`],
        [num(best + 1), `This is one longer than the true LCS ${best}.`],
        [num(Math.max(best - 1, 0)), `This is one shorter than the true LCS ${best}.`],
        [num(x.length), `The length of X alone is ${x.length}, which ignores whether those symbols appear in order inside Y.`],
        [num(best * 2), `This is twice the LCS length ${best}, which would require every matched symbol to be counted twice.`],
      ]
      return {
        prompt: `For X = "${x}" and Y = "${y}", what is the length of the longest common subsequence?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `The DP sets L(i,j) = L(i−1,j−1) + 1 when the characters match, otherwise max(L(i−1,j), L(i,j−1)). Filling the table for "${x}" and "${y}" gives LCS length ${best}.`,
        hint: 'Match characters on the diagonal, otherwise take the max of the two neighbours.',
        correctWhy: `Correct: the LCS of these two strings has length ${best}.`,
      }
    },
  },
  {
    id: 'daa-u3-edit-distance',
    unit: 3,
    topic: 'Longest common subsequence',
    subtopic: 'Edit distance',
    difficulty: 'Hard',
    type: 'Application',
    count: 15,
    seconds: 80,
    tags: ['edit distance', 'dynamic programming'],
    gen: (rng) => {
      const a = randWord(rng, randInt(rng, 3, 5))
      const b = randWord(rng, randInt(rng, 3, 5))
      const best = editDistance(a, b)
      const c = num(best)
      const wrongs: [string, string][] = [
        [num(Math.abs(a.length - b.length)), `The length difference ${Math.abs(a.length - b.length)} is only a lower bound; substitutions also cost operations.`],
        [num(best + 2), `This overcounts by two; the optimal alignment needs ${best} operations.`],
        [num(Math.max(best - 1, 0)), `This is one short of the true edit distance ${best}.`],
        [num(a.length + b.length), `Deleting everything and inserting the target would cost ${a.length + b.length}, which is not optimal.`],
        [num(lcsLength(a, b)), `${lcsLength(a, b)} is the LCS length, not the edit distance.`],
      ]
      return {
        prompt: `What is the Levenshtein (insert/delete/substitute) edit distance between "${a}" and "${b}"?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `The DP uses D(i,j) = D(i−1,j−1) when characters match, else 1 + min(D(i−1,j−1), D(i−1,j), D(i,j−1)). For "${a}" → "${b}" the minimum is ${best} operations.`,
        hint: 'Each mismatch costs 1 plus the cheapest of substitute, delete, or insert.',
        correctWhy: `Correct: edit distance ${best}.`,
      }
    },
  },
  {
    id: 'daa-u3-assembly-line',
    unit: 3,
    topic: 'Assembly line scheduling',
    subtopic: 'Fastest total time',
    difficulty: 'Hard',
    type: 'Application',
    count: 15,
    seconds: 90,
    tags: ['assembly line', 'dynamic programming'],
    gen: (rng) => {
      const n = randInt(rng, 3, 4)
      const a = [
        Array.from({ length: n }, () => randInt(rng, 2, 9)),
        Array.from({ length: n }, () => randInt(rng, 2, 9)),
      ]
      const t = [
        Array.from({ length: n }, () => randInt(rng, 1, 4)),
        Array.from({ length: n }, () => randInt(rng, 1, 4)),
      ]
      const entry = [randInt(rng, 1, 4), randInt(rng, 1, 4)]
      const exit = [randInt(rng, 1, 4), randInt(rng, 1, 4)]
      const best = assemblyLine(a, t, entry, exit)
      const c = num(best)
      const naive = Math.min(
        entry[0] + a[0].reduce((x, y) => x + y, 0) + exit[0],
        entry[1] + a[1].reduce((x, y) => x + y, 0) + exit[1],
      )
      const wrongs: [string, string][] = [
        [num(naive), `${naive} is the best single-line schedule without switching lines; allowing transfers gives ${best}.`],
        [num(best + 2), `This adds two time units beyond the optimum ${best}.`],
        [num(Math.max(best - 1, 1)), `This is one unit faster than the optimum, which the DP table rules out.`],
        [num(best + entry[0] + exit[0]), `Entry and exit costs are already included in the optimum ${best}; adding them again double-counts.`],
        [num(best * 2), `This is twice the optimum ${best}.`],
      ]
      return {
        prompt: `Two assembly lines have station times line 1 = [${a[0].join(', ')}] and line 2 = [${a[1].join(', ')}], transfer times line 1→2 = [${t[0].join(', ')}] and line 2→1 = [${t[1].join(', ')}], entry costs [${entry.join(', ')}] and exit costs [${exit.join(', ')}]. What is the minimum total time through all ${n} stations?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `The DP tracks f₁[j] and f₂[j], the fastest times to reach station j on each line, using f₁[j] = min(f₁[j−1] + a₁ⱼ, f₂[j−1] + t₂ⱼ + a₁ⱼ) and symmetrically for line 2. Adding exit costs and taking the minimum gives ${best}.`,
        hint: 'For each station, choose staying on the line versus transferring in.',
        correctWhy: `Correct: minimum total time ${best}.`,
      }
    },
  },
  {
    id: 'daa-u3-dp-concept',
    unit: 3,
    topic: 'DP fundamentals',
    subtopic: 'When DP applies',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 18,
    seconds: 50,
    tags: ['dynamic programming', 'optimal substructure'],
    gen: (rng) => {
      const cases = [
        {
          q: 'Which two properties must a problem have for dynamic programming to apply?',
          correct: 'Optimal substructure and overlapping subproblems',
          wrongs: [
            ['Greedy-choice property and matroid structure', 'Those are the requirements for greedy algorithms to be optimal, not DP.'],
            ['Linear structure and sorted input', 'Neither is required; DP works on trees, strings, and general graphs.'],
            ['Divide-and-conquer decomposition and disjoint subproblems', 'Disjoint subproblems mean no reuse, which is divide and conquer rather than DP.'],
          ],
          why: 'DP needs an optimal solution built from optimal sub-solutions (optimal substructure) that recur many times (overlap).',
        },
        {
          q: 'What distinguishes dynamic programming from plain divide and conquer?',
          correct: 'Subproblems overlap and their solutions are reused via a table',
          wrongs: [
            ['DP always uses recursion', 'DP can be iterative, and divide and conquer can be recursive; recursion is not the distinction.'],
            ['DP is always faster', 'DP can be slower than a specialised divide-and-conquer algorithm when subproblems do not overlap.'],
            ['DP requires sorting the input', 'Sorting is irrelevant to the DP distinction.'],
          ],
          why: 'Overlapping subproblems let DP store and reuse results, which divide and conquer does not need when subproblems are disjoint.',
        },
        {
          q: 'What is memoisation?',
          correct: 'Top-down recursion that caches each subproblem result the first time it is computed',
          wrongs: [
            ['Bottom-up filling of a table without recursion', 'That is tabulation, the bottom-up counterpart.'],
            ['Storing the input for later reuse', 'Memoisation caches subproblem results, not the raw input.'],
            ['Compressing a table to save memory', 'That is space optimisation, not memoisation.'],
          ],
          why: 'Memoisation keeps the natural recursive formulation and adds a cache keyed by the subproblem state.',
        },
        {
          q: 'Why is the 0/1 knapsack DP called pseudo-polynomial?',
          correct: 'Its running time is polynomial in the numeric capacity W, not in the number of bits used to encode W',
          wrongs: [
            ['Because it is not actually correct', 'The DP is correct; the label refers to the running-time parameterisation.'],
            ['Because it only works for small item counts', 'It works for any count; the issue is the dependence on the capacity value.'],
            ['Because it uses exponential memory', 'Memory is Θ(nW), which is polynomial in W, not exponential.'],
          ],
          why: 'Encoding W in binary takes log W bits, so a runtime of Θ(nW) is exponential in the input length.',
        },
        {
          q: 'What does the principle of optimality state?',
          correct: 'An optimal solution contains optimal solutions to its subproblems',
          wrongs: [
            ['A locally best choice always leads to a global optimum', 'That is the greedy-choice property, which can fail.'],
            ['Every problem has a unique optimal solution', 'Optimal solutions are often non-unique.'],
            ['The optimal solution is always found at the last table entry', 'The location of the answer depends on the DP formulation.'],
          ],
          why: 'Bellman\'s principle licenses the recursive formulation by guaranteeing that optimal sub-solutions compose into an optimal whole.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Focus on the structural properties DP exploits.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u3-dp-complexity',
    unit: 3,
    topic: 'DP fundamentals',
    subtopic: 'Time and space of classic DPs',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 16,
    seconds: 50,
    tags: ['dynamic programming', 'complexity'],
    gen: (rng) => {
      const table = [
        { name: 'LCS of strings of length m and n', time: 'Θ(mn)', space: 'Θ(mn)' },
        { name: '0/1 knapsack with n items and capacity W', time: 'Θ(nW)', space: 'Θ(nW)' },
        { name: 'Matrix chain multiplication of n matrices', time: 'Θ(n³)', space: 'Θ(n²)' },
        { name: 'Floyd-Warshall on a graph with V vertices', time: 'Θ(V³)', space: 'Θ(V²)' },
        { name: 'Making change for amount A with n denominations', time: 'Θ(nA)', space: 'Θ(A)' },
        { name: 'Edit distance for strings of length m and n', time: 'Θ(mn)', space: 'Θ(mn)' },
      ]
      const item = pick(rng, table)
      const mode = pick(rng, ['time', 'space'] as const)
      const correct = mode === 'time' ? item.time : item.space
      const wrongs: [string, string][] = []
      for (const t of table) {
        const val = mode === 'time' ? t.time : t.space
        if (val === correct) continue
        if (wrongs.some(([x]) => x === val)) continue
        wrongs.push([val, `${val} is the ${mode} bound of a different DP (${t.name}), not of ${item.name}.`])
      }
      wrongs.push([
        'Θ(2ⁿ)',
        `Exponential time is what the naive recursion costs; the whole point of the DP table is to avoid it.`,
      ])
      return {
        prompt: `What is the ${mode === 'time' ? 'time' : 'space'} complexity of the standard DP for ${item.name}?`,
        correct,
        wrong: pickWrongs(correct, wrongs, rng, 3),
        explanation: `The table has one entry per state. For ${item.name} that gives ${mode === 'time' ? item.time : item.space} ${mode} in the standard formulation.`,
        hint: 'Count the number of distinct DP states and the work done per state.',
        correctWhy: `Correct: ${correct}.`,
      }
    },
  },
  {
    id: 'daa-u3-dp-basics',
    unit: 3,
    topic: 'DP fundamentals',
    subtopic: 'Recognising dynamic programming',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 16,
    seconds: 40,
    tags: ['dynamic programming', 'basics'],
    gen: (rng) => {
      const cases = [
        {
          q: 'Dynamic programming is best described as:',
          correct: 'Solving each overlapping subproblem once and storing the result for reuse',
          wrongs: [
            ['Always choosing the locally best option at each step', 'That describes a greedy algorithm, which needs a proof of the greedy-choice property.'],
            ['Trying every possible solution and keeping the best', 'That is exhaustive search; DP avoids re-exploring shared subproblems.'],
            ['Splitting the input into independent halves', 'Independent halves are divide and conquer, where nothing is reused.'],
          ],
          why: 'The defining feature of DP is that overlapping subproblems are solved once and their answers are reused from a table or cache.',
        },
        {
          q: 'Which of these is a classic dynamic programming problem?',
          correct: 'Computing the n-th Fibonacci number with a table of previous values',
          wrongs: [
            ['Sorting an array with merge sort', 'Merge sort divides into disjoint halves, so it is divide and conquer.'],
            ['Selecting the maximum number of non-overlapping activities', 'Activity selection is solved optimally by a greedy earliest-finish rule.'],
            ['Finding the minimum spanning tree of a graph', 'Kruskal and Prim are greedy algorithms, not DP.'],
          ],
          why: 'Fibonacci has overlapping subproblems — fib(n−1) and fib(n−2) share almost all of their work — which is exactly what a DP table removes.',
        },
        {
          q: 'What does a DP table entry typically represent?',
          correct: 'The optimal value of a subproblem defined by a small set of indices',
          wrongs: [
            ['The position of the current element in the input', 'Table indices encode subproblem parameters, not a scan position.'],
            ['The number of operations performed so far', 'Counting work is bookkeeping, not the state being optimised.'],
            ['A random sample of previous inputs', 'DP is deterministic and depends on the stated subproblems only.'],
          ],
          why: 'Each cell is keyed by the parameters that define a subproblem, and its value is the best answer for exactly that subproblem.',
        },
        {
          q: 'Bottom-up dynamic programming differs from top-down memoisation because it:',
          correct: 'Fills the table iteratively in an order where dependencies are already computed',
          wrongs: [
            ['Uses no table at all', 'Bottom-up DP is built around a table; only the direction of computation changes.'],
            ['Is always asymptotically faster', 'Both usually share the same asymptotic time; the constant factors and stack use differ.'],
            ['Cannot solve the same problems', 'Any memoised recursion can be rewritten as a bottom-up table.'],
          ],
          why: 'Bottom-up DP orders the states so that every dependency appears earlier, removing recursion and often reducing memory overhead.',
        },
        {
          q: 'The 0/1 knapsack DP table is indexed by:',
          correct: 'The item prefix considered and the remaining capacity',
          wrongs: [
            ['The item weight only', 'Weight alone does not identify a subproblem; the set of items considered matters too.'],
            ['The item value only', 'Value is what is maximised, not part of the state index.'],
            ['The number of items and the total value', 'Capacity, not total value, bounds the feasible choices.'],
          ],
          why: 'dp[i][c] answers "best value using the first i items with capacity c", so both the prefix and the capacity are needed.',
        },
        {
          q: 'Why does the making-change DP store the minimum number of coins per amount?',
          correct: 'Because the optimal solution for an amount is built from optimal solutions of smaller amounts',
          wrongs: [
            ['Because greedy always fails for every coin system', 'Greedy is optimal for some systems, such as canonical ones, but DP works for all.'],
            ['Because coins must be used in sorted order', 'Order of use is irrelevant; only the multiset of coins matters.'],
            ['Because the amount is always a multiple of the largest coin', 'No such restriction exists in the problem statement.'],
          ],
          why: 'Each amount depends only on smaller amounts, so filling amounts in increasing order gives every entry its optimal value.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Ask whether subproblems overlap and are reused.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
]
