import type { Family } from '../build'
import { num, pickWrongs } from '../build'
import { pick, randInt, shuffle, type Rng } from '../../../lib/rng'
import {
  mergeSortCount,
  insertionSortCount,
  selectionSortCount,
  bubbleSortCount,
  binarySearchCount,
  linearSearchCount,
  partitionArray,
  numComparisonsMergeSortWorst,
  heapChildren,
  heapParent,
  heapHeight,
} from '../../../lib/algorithms'

function randomArray(rng: Rng, n: number, lo = 1, hi = 99): number[] {
  return Array.from({ length: n }, () => randInt(rng, lo, hi))
}

function distinctArray(rng: Rng, n: number): number[] {
  const pool = shuffle(rng, Array.from({ length: 60 }, (_, i) => i + 1)).slice(0, n)
  return pool
}

const fmt = (a: number[]) => `[${a.join(', ')}]`

export const daaUnit2Families: Family[] = [
  {
    id: 'daa-u2-merge-comparisons',
    unit: 2,
    topic: 'Merge sort',
    subtopic: 'Comparison count on a concrete input',
    difficulty: 'Medium',
    type: 'Application',
    count: 20,
    seconds: 70,
    tags: ['merge sort', 'comparisons'],
    gen: (rng) => {
      const n = randInt(rng, 6, 12)
      const arr = distinctArray(rng, n)
      const { comparisons, sorted } = mergeSortCount(arr)
      const c = num(comparisons)
      const wrongs: [string, string][] = [
        [num(n * Math.ceil(Math.log2(n))), `n·⌈log₂ n⌉ = ${n}·${Math.ceil(Math.log2(n))} is the crude upper bound on merge-sort comparisons, not the exact count for this input. The actual count is smaller because some merges finish early.`],
        [num(n - 1), `${n - 1} is the number of comparisons a single linear pass would need, but merge sort performs a comparison at every merge level.`],
        [num(comparisons + n), `This overshoots by ${n}, roughly one extra comparison per element. The exact merge trace for this input gives ${c}.`],
        [num(Math.max(comparisons - n, 1)), `This undershoots by about ${n}. Each merge level contributes comparisons, so the total is larger.`],
        [num(comparisons * 2), `This is exactly twice the correct value ${c}, which happens if you count each comparison at both the left and right merge.`],
      ]
      return {
        prompt: `Merge sort is run on the array ${fmt(arr)}. Counting only element comparisons performed during merging, how many comparisons does it make in total?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Simulating the merge tree for ${fmt(arr)}: the halves are sorted recursively and each merge compares the current fronts until one side is exhausted. The total is ${c} comparisons, producing ${fmt(sorted)}.`,
        hint: 'Recursively sort the two halves, then count comparisons made while merging them.',
        correctWhy: `Correct: the merge trace makes exactly ${c} comparisons and yields ${fmt(sorted)}.`,
      }
    },
  },
  {
    id: 'daa-u2-binary-search-count',
    unit: 2,
    topic: 'Binary search',
    subtopic: 'Comparison count',
    difficulty: 'Medium',
    type: 'Application',
    count: 18,
    seconds: 60,
    tags: ['binary search', 'comparisons'],
    gen: (rng) => {
      const n = randInt(rng, 8, 40)
      const arr = Array.from({ length: n }, (_, i) => (i + 1) * 3)
      const idx = randInt(rng, 0, n - 1)
      const target = arr[idx]
      const count = binarySearchCount(arr, target)
      const c = num(count)
      const worst = Math.ceil(Math.log2(n + 1))
      const wrongs: [string, string][] = [
        [num(worst), `${worst} is the worst-case bound ⌈log₂(n+1)⌉ for ${n} elements, but this particular target is found earlier.`],
        [num(n), `${n} is the cost of a linear scan; binary search discards half the range each step.`],
        [num(count + 1), `This is one comparison more than the actual trace, which finds the target in ${c} probes.`],
        [num(Math.max(count - 1, 1)), `This is one comparison short. The probe that succeeds still counts, giving ${c}.`],
        [num(idx + 1), `${idx + 1} is the position of the target, which is what linear search would cost, not binary search.`],
      ]
      return {
        prompt: `Binary search looks for ${target} in the sorted array [${arr.slice(0, Math.min(n, 10)).join(', ')}${n > 10 ? ', …' : ''}] of ${n} elements (values 3, 6, 9, …). How many comparisons does it perform before finding the target?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Each step compares the target with the middle element and discards one half. Tracing the halving intervals for ${target} in this ${n}-element array gives ${c} comparisons.`,
        hint: 'Track low, high, and mid; each probe eliminates half the remaining range.',
        correctWhy: `Correct: the halving trace reaches ${target} after ${c} comparisons.`,
      }
    },
  },
  {
    id: 'daa-u2-insertion-count',
    unit: 2,
    topic: 'Elementary sorts',
    subtopic: 'Insertion sort comparisons',
    difficulty: 'Medium',
    type: 'Application',
    count: 18,
    seconds: 60,
    tags: ['insertion sort', 'comparisons'],
    gen: (rng) => {
      const n = randInt(rng, 5, 9)
      const arr = distinctArray(rng, n)
      const comparisons = insertionSortCount(arr)
      const c = num(comparisons)
      const maxComp = (n * (n - 1)) / 2
      const wrongs: [string, string][] = [
        [num(maxComp), `${num(maxComp)} = n(n−1)/2 is the worst case for a reverse-sorted array; this input needs fewer because some elements are already in order.`],
        [num(n - 1), `${n - 1} is the best case, one comparison per element, which only happens when the array is already sorted.`],
        [num(comparisons + n), `This overcounts by ${n}. Only elements that must shift backwards generate extra comparisons.`],
        [num(Math.max(comparisons - 2, 1)), `This undercounts. Each element compares against its left neighbours until it finds a smaller one.`],
        [num(maxComp - comparisons + 1), `This is a difference between the worst case and the actual count, not the count itself.`],
      ]
      return {
        prompt: `Insertion sort sorts ${fmt(arr)}. How many key comparisons does it perform in total?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Each element is compared with the elements to its left until the correct insertion point is found. For ${fmt(arr)} this trace performs ${c} comparisons.`,
        hint: 'For each element, count comparisons with preceding elements until you find a smaller one.',
        correctWhy: `Correct: the insertion trace performs ${c} comparisons.`,
      }
    },
  },
  {
    id: 'daa-u2-selection-count',
    unit: 2,
    topic: 'Elementary sorts',
    subtopic: 'Selection sort comparisons',
    difficulty: 'Easy',
    type: 'Application',
    count: 15,
    seconds: 45,
    tags: ['selection sort', 'comparisons'],
    gen: (rng) => {
      const n = randInt(rng, 5, 12)
      const exact = (n * (n - 1)) / 2
      const c = num(exact)
      const wrongs: [string, string][] = [
        [num(n * n), `${n}² counts n comparisons for each of n passes, but the last pass has nothing left to scan.`],
        [num(n), `${n} would be one comparison per pass; selection sort scans the whole remaining suffix each time.`],
        [num(n - 1), `${n - 1} is the number of swaps, not the number of comparisons.`],
        [num(exact + n), `This adds ${n} extra comparisons. The exact total for ${n} elements is ${c}.`],
        [num(exact - 1), `This is one short. The first pass alone performs ${n - 1} comparisons.`],
      ]
      return {
        prompt: `Selection sort is applied to an array of ${n} elements. Exactly how many comparisons does it perform, regardless of the initial order?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Selection sort scans the unsorted suffix for the minimum: ${n - 1} comparisons in the first pass, ${n - 2} in the second, down to 1. The sum is n(n−1)/2 = ${c}, independent of the input order.`,
        hint: 'Sum (n−1) + (n−2) + … + 1.',
        correctWhy: `Correct: n(n−1)/2 = ${c} comparisons, always.`,
      }
    },
  },
  {
    id: 'daa-u2-bubble-swaps',
    unit: 2,
    topic: 'Elementary sorts',
    subtopic: 'Bubble sort swaps',
    difficulty: 'Medium',
    type: 'Application',
    count: 15,
    seconds: 60,
    tags: ['bubble sort', 'swaps', 'inversions'],
    gen: (rng) => {
      const n = randInt(rng, 5, 8)
      const arr = distinctArray(rng, n)
      const { swaps } = bubbleSortCount(arr)
      const c = num(swaps)
      let inversions = 0
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (arr[i] > arr[j]) inversions++
      const wrongs: [string, string][] = [
        [num(inversions + n), `This is larger than the inversion count ${inversions}. Bubble sort performs exactly one swap per inversion, no more.`],
        [num(Math.max(inversions - 1, 1)), `This is one fewer than the inversion count. Every inversion is fixed by exactly one adjacent swap.`],
        [num((n * (n - 1)) / 2), `n(n−1)/2 is the maximum possible inversions, reached only by a reverse-sorted array; this input has ${inversions}.`],
        [num(n), `${n} is the number of elements, not the number of inversions.`],
        [num(inversions * 2), `This doubles the inversion count ${inversions}. Each inversion costs exactly one swap.`],
      ]
      return {
        prompt: `Bubble sort sorts ${fmt(arr)}. How many swaps does it perform?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Bubble sort swaps adjacent out-of-order pairs, and each swap removes exactly one inversion. Counting inversions in ${fmt(arr)} gives ${inversions}, so the algorithm performs ${c} swaps.`,
        hint: 'Count inversions: pairs (i, j) with i < j but a[i] > a[j].',
        correctWhy: `Correct: ${inversions} inversions means exactly ${c} swaps.`,
      }
    },
  },
  {
    id: 'daa-u2-quick-partition',
    unit: 2,
    topic: 'Quick sort',
    subtopic: 'Partition result',
    difficulty: 'Medium',
    type: 'Application',
    count: 18,
    seconds: 60,
    tags: ['quicksort', 'partition'],
    gen: (rng) => {
      const n = randInt(rng, 6, 10)
      const arr = distinctArray(rng, n)
      const { left, pivot, right } = partitionArray(arr)
      const correct = `Left ${fmt(left)}, pivot ${pivot}, right ${fmt(right)}`
      const wrongs: [string, string][] = [
        [
          `Left ${fmt(right)}, pivot ${pivot}, right ${fmt(left)}`,
          'The left and right groups are swapped: elements ≤ pivot belong on the left and elements > pivot on the right.',
        ],
        [
          `Left ${fmt(left)}, pivot ${pivot}, right ${fmt([...right].reverse())}`,
          'Reversing the right group changes the partition output. Lomuto partitioning preserves the relative order of elements greater than the pivot.',
        ],
        [
          `Left ${fmt([...left].reverse())}, pivot ${pivot}, right ${fmt(right)}`,
          'The left group is reversed here, but the partition preserves the original relative order of elements less than or equal to the pivot.',
        ],
        [
          `Left ${fmt(left)}, pivot ${Math.max(...arr)}, right ${fmt(right)}`,
          `The pivot is the last element of the input, ${pivot}, not the maximum value ${Math.max(...arr)}.`,
        ],
        [
          `Left ${fmt(left)}, pivot ${arr[0]}, right ${fmt(right)}`,
          `The pivot is the last element, ${pivot}, not the first element ${arr[0]}.`,
        ],
        [
          `Left ${fmt([...left, pivot].sort((a, b) => a - b))}, pivot ${pivot}, right ${fmt(right)}`,
          `Including the pivot inside the left group double-counts it; the pivot sits between the two groups.`,
        ],
        [
          `Left ${fmt(left)}, pivot ${pivot}, right ${fmt([...right, pivot])}`,
          `Appending the pivot to the right group duplicates it, since the pivot is already the separator.`,
        ],
        [
          `Left ${fmt(left)}, pivot ${Math.min(...arr)}, right ${fmt(right)}`,
          `The pivot is the last element ${pivot}, not the minimum ${Math.min(...arr)}.`,
        ],
      ]
      return {
        prompt: `A Lomuto partition is applied to ${fmt(arr)}, using the last element as pivot. What are the resulting left group, pivot, and right group?`,
        correct,
        wrong: pickWrongs(correct, wrongs, rng, 3),
        explanation: `The pivot is the last element, ${pivot}. Scanning left to right, every element ≤ ${pivot} moves to the left group in its original relative order and the rest stay on the right. That gives left ${fmt(left)} and right ${fmt(right)}.`,
        hint: 'Pivot is the last element; keep elements ≤ pivot on the left in original order.',
        correctWhy: `Correct: left ${fmt(left)}, pivot ${pivot}, right ${fmt(right)}.`,
      }
    },
  },
  {
    id: 'daa-u2-quick-worst',
    unit: 2,
    topic: 'Quick sort',
    subtopic: 'Worst-case behaviour',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 15,
    seconds: 50,
    tags: ['quicksort', 'worst case'],
    gen: (rng) => {
      const cases = [
        {
          q: 'On which input does quicksort with a last-element pivot degrade to Θ(n²)?',
          correct: 'An already sorted (or reverse sorted) array',
          wrongs: [
            ['A randomly permuted array', 'Random input gives the expected Θ(n log n) behaviour; the degenerate case is monotone order.'],
            ['An array of all distinct random values', 'Distinct random values produce roughly balanced partitions in expectation.'],
            ['An array with many duplicates only', 'Duplicates cause problems for some partition schemes, but the classic quadratic case is sorted input.'],
          ],
          why: 'With sorted input the last element is always the maximum, so each partition is sizes n−1 and 0.',
        },
        {
          q: 'What is the recurrence for quicksort in the worst case?',
          correct: 'T(n) = T(n−1) + Θ(n)',
          wrongs: [
            ['T(n) = 2T(n/2) + Θ(n)', 'That is the balanced case, which gives Θ(n log n).'],
            ['T(n) = T(n/2) + Θ(1)', 'That is binary search, which does not sort.'],
            ['T(n) = 2T(n−1) + Θ(1)', 'The recursion makes two calls but on partitions summing to n−1, not two calls of size n−1.'],
          ],
          why: 'A maximally unbalanced partition reduces the problem size by only one per level while costing Θ(n) to partition.',
        },
        {
          q: 'Which technique makes the quadratic worst case of quicksort unlikely on any fixed input?',
          correct: 'Choosing the pivot uniformly at random',
          wrongs: [
            ['Always choosing the first element', 'That is exactly the choice that triggers quadratic behaviour on sorted input.'],
            ['Always choosing the median of the whole array', 'Finding the true median costs extra work and is not the standard fix; randomisation is.'],
            ['Sorting the array first', 'Sorting first makes the last-element pivot degenerate, the opposite of a fix.'],
          ],
          why: 'Random pivots make every input behave like a random input in expectation, giving expected Θ(n log n).',
        },
        {
          q: 'What is the average-case time complexity of quicksort?',
          correct: 'Θ(n log n)',
          wrongs: [
            ['Θ(n²)', 'Θ(n²) is the worst case only.'],
            ['Θ(n)', 'Partitioning alone is linear, but the recursion adds a logarithmic factor.'],
            ['Θ(log n)', 'Sorting cannot be sublinear in the input size.'],
          ],
          why: 'Random pivots split the array in a 1:9 ratio on average often enough to give Θ(n log n).',
        },
        {
          q: 'How much auxiliary space does in-place quicksort use?',
          correct: 'Θ(log n) from the recursion stack on average',
          wrongs: [
            ['Θ(n) because of the partition buffer', 'Lomuto and Hoare partitions rearrange in place without an auxiliary array.'],
            ['Θ(1) in every case', 'The recursion stack grows with depth, which is Θ(log n) on average and Θ(n) in the worst case.'],
            ['Θ(n log n)', 'No structure of that size is allocated by in-place quicksort.'],
          ],
          why: 'Only the call stack is used, and balanced partitions give logarithmic depth.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Think about how the pivot choice affects partition balance.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u2-sort-properties',
    unit: 2,
    topic: 'Comparison sorting lower bound',
    subtopic: 'Stability and in-place properties',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 16,
    seconds: 45,
    tags: ['stability', 'in-place', 'sorting'],
    gen: (rng) => {
      const table: { name: string; stable: boolean; inPlace: boolean; worst: string }[] = [
        { name: 'Merge sort', stable: true, inPlace: false, worst: 'Θ(n log n)' },
        { name: 'Quick sort', stable: false, inPlace: true, worst: 'Θ(n²)' },
        { name: 'Heap sort', stable: false, inPlace: true, worst: 'Θ(n log n)' },
        { name: 'Insertion sort', stable: true, inPlace: true, worst: 'Θ(n²)' },
        { name: 'Selection sort', stable: false, inPlace: true, worst: 'Θ(n²)' },
        { name: 'Bubble sort', stable: true, inPlace: true, worst: 'Θ(n²)' },
      ]
      const item = pick(rng, table)
      const mode = pick(rng, ['stable', 'inplace', 'worst'] as const)
      if (mode === 'stable') {
        const correct = item.stable ? 'Stable' : 'Not stable'
        return {
          prompt: `Is ${item.name.toLowerCase()} a stable sorting algorithm?`,
          correct,
          wrong: item.stable
            ? [
                ['Not stable', `${item.name} preserves the relative order of equal keys, which is the definition of stable.`],
                ['Stable only for distinct keys', 'Stability is specifically about equal keys, so this answer is backwards.'],
                ['Stable only when the input is sorted', 'Stability is a structural property of the algorithm, not of the input.'],
              ]
            : [
                ['Stable', `${item.name} can move equal keys past one another, so it does not preserve their relative order.`],
                ['Stable only for distinct keys', 'Stability concerns equal keys, so this reverses the meaning.'],
                ['Stable only when the input is reversed', 'Stability does not depend on the input order.'],
              ],
          explanation: item.stable
            ? `${item.name} only exchanges elements when strictly necessary in a way that preserves equal-key order, so it is stable. Its worst case is ${item.worst}.`
            : `${item.name} performs long-distance exchanges that can reorder equal keys, so it is not stable. Its worst case is ${item.worst}.`,
          hint: 'Stability means equal keys keep their original relative order.',
          correctWhy: `Correct: ${item.name} is ${item.stable ? '' : 'not '}stable.`,
        }
      }
      if (mode === 'inplace') {
        const correct = item.inPlace ? 'In place' : 'Not in place'
        return {
          prompt: `Does ${item.name.toLowerCase()} sort in place (Θ(1) auxiliary space)?`,
          correct,
          wrong: item.inPlace
            ? [
                ['Not in place', `${item.name} needs only a constant number of extra variables beyond the input array.`],
                ['In place only for sorted input', 'In-place refers to auxiliary memory, which does not depend on input order.'],
                ['In place only with extra memory', 'That is a contradiction; in place means no auxiliary array proportional to n.'],
              ]
            : [
                ['In place', `${item.name} needs an auxiliary buffer proportional to the input size, so it is not in place.`],
                ['In place only for small arrays', 'The auxiliary requirement scales with n, so it is not constant for any size.'],
                ['In place because it uses the call stack', 'The call stack plus the merge buffer make the space super-constant.'],
              ],
          explanation: item.inPlace
            ? `${item.name} rearranges elements inside the input array with only constant extra storage, so it is in place.`
            : `${item.name} requires an auxiliary array of size Θ(n) for merging, so it is not in place.`,
          hint: 'In place means O(1) auxiliary space beyond the input.',
          correctWhy: `Correct: ${item.name} is ${item.inPlace ? '' : 'not '}in place.`,
        }
      }
      const correct = item.worst
      const wrongs: [string, string][] = [
        ...table
          .filter((t) => t.worst !== correct)
          .filter((t, i, arr) => arr.findIndex((x) => x.worst === t.worst) === i)
          .map((t) => [
            t.worst,
            `${t.worst} is the worst-case bound of ${t.name.toLowerCase()}, not of ${item.name.toLowerCase()}.`,
          ] as [string, string]),
        ['Θ(n³)', `Θ(n³) is not the worst case of ${item.name.toLowerCase()}; its cost is either n log n or n², never cubic.`],
        ['Θ(log n)', `Θ(log n) would mean the algorithm never inspects most elements, which no general sort does.`],
        ['Θ(1)', `Sorting always inspects the input, so a constant worst-case bound is impossible.`],
        ['Θ(n log² n)', `The extra squared logarithm never appears in ${item.name.toLowerCase()}; each level costs at most linear work.`],
      ]
      return {
        prompt: `What is the worst-case time complexity of ${item.name.toLowerCase()}?`,
        correct,
        wrong: pickWrongs(correct, wrongs, rng, 3),
        explanation: `${item.name} has worst-case time ${item.worst}. ${
          item.worst === 'Θ(n log n)'
            ? 'Its divide-and-conquer structure keeps the cost logarithmic per level even in the worst case.'
            : 'A degenerate or maximally unbalanced structure forces quadratic work in the worst case.'
        }`,
        hint: 'Recall whether the algorithm guarantees balanced splits.',
        correctWhy: `Correct: ${item.worst} in the worst case.`,
      }
    },
  },
  {
    id: 'daa-u2-lower-bound',
    unit: 2,
    topic: 'Comparison sorting lower bound',
    subtopic: 'Decision tree argument',
    difficulty: 'Hard',
    type: 'Conceptual',
    count: 14,
    seconds: 60,
    tags: ['lower bound', 'decision tree'],
    gen: (rng) => {
      const cases = [
        {
          q: 'Why does any comparison-based sort require Ω(n log n) comparisons in the worst case?',
          correct: 'The decision tree has n! leaves, so its height is at least log₂(n!) = Θ(n log n)',
          wrongs: [
            ['Because there are n! possible inputs and each must be examined', 'The algorithm does not need to examine every permutation; the argument is about the depth of the decision tree.'],
            ['Because each comparison can only eliminate one element', 'A comparison eliminates many permutations at once, not just one element.'],
            ['Because the array has n elements and each needs log n comparisons', 'The per-element intuition is not the proof; the decision-tree leaf count is.'],
          ],
          why: 'Each permutation must reach a distinct leaf, so the binary decision tree needs at least n! leaves and hence height ≥ log₂(n!).',
        },
        {
          q: 'What is log₂(n!) asymptotically?',
          correct: 'Θ(n log n)',
          wrongs: [
            ['Θ(n)', 'Stirling\'s approximation gives n log n − n + O(log n), which is Θ(n log n).'],
            ['Θ(n²)', 'The quadratic term is not present in log₂(n!).'],
            ['Θ(log n)', 'log(n!) grows far faster than log n.'],
          ],
          why: 'Stirling\'s approximation gives log₂(n!) = n log₂ n − n log₂ e + O(log n) = Θ(n log n).',
        },
        {
          q: 'Does the Ω(n log n) lower bound apply to counting sort?',
          correct: 'No, because counting sort is not comparison based',
          wrongs: [
            ['Yes, so counting sort cannot be linear', 'Counting sort is linear precisely because it avoids comparisons.'],
            ['Yes, but only for large n', 'The bound simply does not apply to non-comparison sorts at any n.'],
            ['No, because counting sort uses extra memory', 'The reason is that it does not compare keys, not that it uses memory.'],
          ],
          why: 'The lower bound is proved for comparison-based algorithms only; counting sort indexes by key value instead.',
        },
        {
          q: 'How many leaves must the decision tree of a correct comparison sort have?',
          correct: 'At least n!',
          wrongs: [
            ['At least n', 'Each of the n! input permutations needs its own leaf.'],
            ['At least n log n', 'The number of leaves is n!, whose logarithm is n log n; the leaf count itself is much larger.'],
            ['Exactly 2ⁿ', 'The tree is binary, but the required leaf count is n!, not 2ⁿ.'],
          ],
          why: 'A correct sort must output a different permutation for each input, so the leaves must cover all n! orders.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Count the permutations a correct sort must distinguish.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u2-heap-indices',
    unit: 2,
    topic: 'Heap sort and heaps',
    subtopic: 'Array representation of a heap',
    difficulty: 'Medium',
    type: 'Application',
    count: 16,
    seconds: 50,
    tags: ['heap', 'indices'],
    gen: (rng) => {
      const n = randInt(rng, 10, 31)
      const i = randInt(rng, 1, n - 3)
      const [l, r] = heapChildren(i)
      const p = heapParent(i)
      const mode = pick(rng, ['children', 'parent', 'height', 'build'] as const)
      if (mode === 'children') {
        const correct = `Left child ${l}, right child ${r}`
        return {
          prompt: `In a zero-based array representation of a binary heap with ${n} elements, a node sits at index ${i}. Which indices hold its children?`,
          correct,
          wrong: [
            [`Left child ${l + 1}, right child ${r + 1}`, 'The zero-based formulas are 2i+1 and 2i+2; adding one corresponds to the one-based convention.'],
            [`Left child ${2 * i}, right child ${2 * i + 1}`, 'Those are the one-based formulas, which are off by one for a zero-based array.'],
            [`Left child ${i + 1}, right child ${i + 2}`, 'Children of a heap node are not adjacent array positions; they are at 2i+1 and 2i+2.'],
            [`Left child ${2 * i + 2}, right child ${2 * i + 3}`, 'Swapping the roles and shifting by one mixes the one-based and zero-based conventions.'],
            [`Left child ${l + 2}, right child ${r + 2}`, `Shifting both children by two places them at the wrong depth of the tree.`],
          ],
          explanation: `For zero-based indexing, children of index i are 2i+1 and 2i+2. With i = ${i}: 2·${i}+1 = ${l} and 2·${i}+2 = ${r}.`,
          hint: 'Use children = 2i+1 and 2i+2 for zero-based arrays.',
          correctWhy: `Correct: children at ${l} and ${r}.`,
        }
      }
      if (mode === 'parent') {
        const correct = `${p}`
        const wrongs: [string, string][] = [
          [`${Math.floor(i / 2)}`, `Floor(i/2) = ${Math.floor(i / 2)} is the one-based parent formula; for a zero-based array the parent is floor((i−1)/2) = ${p}.`],
          [`${i - 1}`, 'The parent is not simply the previous array slot; it is found by halving the index.'],
          [`${2 * i}`, `${2 * i} is a child index of this node, not its parent.`],
          [`${i - 2}`, 'Subtracting two does not halve the index, so it does not land on the parent.'],
          [`${Math.ceil(i / 2)}`, `Rounding the half index up gives ${Math.ceil(i / 2)}, which differs from floor((i−1)/2) = ${p}.`],
          [`${2 * i + 1}`, 'That is the left child of this node, not its parent.'],
          [`${2 * i + 2}`, 'That is the right child of this node, not its parent.'],
          [`${i + 1}`, 'The next array slot is a sibling position at most, never the parent.'],
          [`${i + Math.floor(i / 2)}`, 'Adding half the index instead of subtracting one before halving does not give the parent.'],
        ]
        return {
          prompt: `In a zero-based array binary heap, what is the parent index of the node at index ${i}?`,
          correct,
          wrong: pickWrongs(correct, wrongs, rng, 3),
          explanation: `For zero-based indexing the parent of i is floor((i−1)/2). With i = ${i}: floor(${i - 1}/2) = ${p}.`,
          hint: 'Parent = floor((i−1)/2) in zero-based arrays.',
          correctWhy: `Correct: parent index ${p}.`,
        }
      }
      if (mode === 'height') {
        const h = heapHeight(n)
        const correct = `${h}`
        return {
          prompt: `What is the height (number of edges on the longest root-to-leaf path) of a heap stored as a complete binary tree with ${n} elements?`,
          correct,
          wrong: [
            [`${h + 1}`, `${h + 1} counts levels rather than edges; the height in edges is floor(log₂ n) = ${h}.`],
            [`${Math.ceil(Math.log2(n))}`, `The height in edges is floor(log₂ ${n}) = ${h}, not the ceiling.`],
            [`${n - 1}`, 'A complete tree is balanced, so its height is logarithmic, not linear.'],
            [`${h + 2}`, `This adds two extra levels beyond the true height ${h}.`],
            [`${Math.max(h - 1, 0)}`, `This drops one level; a complete tree with ${n} nodes reaches height ${h}.`],
            [`${Math.floor(n / 2)}`, 'Half the node count is not a height; the height is logarithmic in n.'],
            [`${Math.floor(Math.sqrt(n))}`, 'The square root is unrelated to the depth of a balanced binary tree.'],
          ],
          explanation: `A complete binary tree with n nodes has height floor(log₂ n). Here floor(log₂ ${n}) = ${h}.`,
          hint: 'Height of a complete binary tree with n nodes is floor(log₂ n).',
          correctWhy: `Correct: height ${h}.`,
        }
      }
      const correct = 'Θ(n)'
      return {
        prompt: 'What is the time complexity of building a heap from an arbitrary array of n elements (bottom-up build-heap)?',
        correct,
        wrong: [
          ['Θ(n log n)', 'The naive per-node bound gives n log n, but the tighter sum of sift-down costs is linear because most nodes are near the leaves.'],
          ['Θ(log n)', 'Building a heap touches every element, so it cannot be logarithmic.'],
          ['Θ(n²)', 'Sift-down costs decrease geometrically with depth, summing to Θ(n).'],
          ['Θ(n² log n)', 'This compounds the quadratic and logarithmic terms that do not appear in the build-heap analysis.'],
          ['Θ(1)', 'Every element must be examined at least once, so constant time is impossible.'],
          ['Θ(n³)', 'No cubic term arises; each node is sifted down at most once.'],
        ],
        explanation: 'Nodes at height h cost O(h) to sift down, and there are about n/2^(h+1) such nodes. The sum Σ h·n/2^h converges to Θ(n).',
        hint: 'Sum sift-down costs by level; most nodes are at the bottom.',
        correctWhy: 'Correct: bottom-up build-heap is Θ(n).',
      }
    },
  },
  {
    id: 'daa-u2-merge-worst-formula',
    unit: 2,
    topic: 'Merge sort',
    subtopic: 'Worst-case comparison formula',
    difficulty: 'Hard',
    type: 'Application',
    count: 12,
    seconds: 70,
    tags: ['merge sort', 'worst case', 'formula'],
    gen: (rng) => {
      const n = randInt(rng, 5, 33)
      const exact = numComparisonsMergeSortWorst(n)
      const c = num(exact)
      const p = Math.ceil(Math.log2(n))
      const wrongs: [string, string][] = [
        [num(n * p), `${n}·⌈log₂ n⌉ = ${num(n * p)} overcounts by ${num(n * p - exact)} because the last merge level does not perform a full n comparisons.`],
        [num(n * Math.floor(Math.log2(n))), `${n}·⌊log₂ n⌋ = ${num(n * Math.floor(Math.log2(n)))} uses the floor instead of the ceiling, giving the wrong level count.`],
        [num(n - 1), `${n - 1} is a single linear merge, not the total over all levels.`],
        [num(exact + n), `This adds ${n} extra comparisons beyond the exact worst case ${c}.`],
        [num(Math.max(exact - p, 1)), `This drops the ${p} term from the formula, undercounting the total.`],
      ]
      return {
        prompt: `What is the exact worst-case number of comparisons performed by merge sort on n = ${n} elements?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `The worst-case comparison count is n⌈log₂ n⌉ − 2^⌈log₂ n⌉ + 1. With n = ${n} and ⌈log₂ n⌉ = ${p}, this gives ${n}·${p} − ${Math.pow(2, p)} + 1 = ${c}.`,
        hint: 'Use n⌈log₂ n⌉ − 2^⌈log₂ n⌉ + 1.',
        correctWhy: `Correct: ${c} comparisons in the worst case.`,
      }
    },
  },
  {
    id: 'daa-u2-maxmin',
    unit: 2,
    topic: 'Max-min and other D&C problems',
    subtopic: 'Simultaneous maximum and minimum',
    difficulty: 'Hard',
    type: 'Application',
    count: 12,
    seconds: 60,
    tags: ['max-min', 'comparisons', 'divide and conquer'],
    gen: (rng) => {
      const n = randInt(rng, 8, 40) * 2
      const exact = (3 * n) / 2 - 2
      const c = num(exact)
      const wrongs: [string, string][] = [
        [num(2 * n - 2), `${num(2 * n - 2)} = 2n − 2 is the naive two-pass cost, which does not exploit the pair structure.`],
        [num(n - 1), `${n - 1} finds only the maximum (or only the minimum), not both.`],
        [num((3 * n) / 2), `This omits the −2 correction from the base case of the recursion, giving ${num((3 * n) / 2)} instead of ${c}.`],
        [num(n), `${n} comparisons would not even suffice to find a single extreme in the worst case for this structure.`],
        [num(2 * n), `This is more than the naive bound, so it cannot be optimal.`],
      ]
      return {
        prompt: `Using the divide-and-conquer pairing method, what is the exact number of comparisons needed to find both the maximum and the minimum of ${n} elements?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Pairing the elements and comparing within pairs takes n/2 comparisons. Then each pair contributes one loser to the minimum pool and one winner to the maximum pool, each of size n/2, and finding each extreme costs n/2 − 1 comparisons. Total: n/2 + 2(n/2 − 1) = 3n/2 − 2 = ${c}.`,
        hint: 'Compare within pairs first, then find max among winners and min among losers.',
        correctWhy: `Correct: 3n/2 − 2 = ${c} comparisons.`,
      }
    },
  },
  {
    id: 'daa-u2-search-comparison',
    unit: 2,
    topic: 'Binary search',
    subtopic: 'Binary versus linear search',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 14,
    seconds: 45,
    tags: ['binary search', 'linear search'],
    gen: (rng) => {
      const cases = [
        {
          q: 'What is the precondition for binary search to work correctly?',
          correct: 'The array must be sorted',
          wrongs: [
            ['The array must contain distinct elements', 'Duplicates are allowed; the ordering is what matters.'],
            ['The array length must be a power of two', 'Binary search works for any length by using floor/ceil midpoints.'],
            ['The array must be stored in a linked list', 'Binary search needs random access, so an array is preferred.'],
          ],
          why: 'Binary search discards half the range based on an ordering comparison, which is only valid on sorted data.',
        },
        {
          q: 'For a sorted array of n elements, which is faster asymptotically?',
          correct: 'Binary search, at Θ(log n) versus Θ(n)',
          wrongs: [
            ['Linear search, at Θ(log n)', 'Linear search is Θ(n); the two are swapped here.'],
            ['They are the same, at Θ(n)', 'Binary search exploits the sorted order to halve the range each step.'],
            ['Binary search, at Θ(1)', 'Binary search is logarithmic, not constant.'],
          ],
          why: 'Binary search halves the search space per comparison, giving logarithmic time on sorted input.',
        },
        {
          q: 'What is the maximum number of comparisons binary search needs on a sorted array of 1,000 elements?',
          correct: '10',
          wrongs: [
            ['1000', 'That is the linear search worst case.'],
            ['500', 'Halving the range does not cost one comparison per discarded element.'],
            ['100', 'The bound is ⌈log₂(n+1)⌉ = 10, not 100.'],
          ],
          why: '⌈log₂(1001)⌉ = 10, since 2¹⁰ = 1024 ≥ 1001.',
        },
        {
          q: 'Which search should you use on an unsorted array if you must search only once?',
          correct: 'Linear search, because sorting would cost more than it saves',
          wrongs: [
            ['Binary search, because it is always faster', 'Binary search is invalid on unsorted data.'],
            ['Binary search after a single pass to check order', 'Checking order is a linear pass, and the data is unsorted, so binary search still fails.'],
            ['Neither works on unsorted data', 'Linear search works on any array.'],
          ],
          why: 'Sorting costs Θ(n log n), which exceeds the Θ(n) of one linear scan.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Consider what binary search needs from the input.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
]
