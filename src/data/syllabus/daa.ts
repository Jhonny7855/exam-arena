import type { Stage, UnitId } from '../../types'
import type { UnitSyllabus } from './types'

export const DAA_UNITS: UnitSyllabus[] = [
  {
    id: 1,
    code: 'U1',
    title: 'Introduction & Analysis',
    tagline: 'Counting the cost of computation',
    accent: '#f59e0b',
    overview:
      'Before designing an algorithm you must be able to measure one. This unit covers the notion of an algorithm and its specification, the RAM model, order notation, and the standard analysis of best, worst, and average case behaviour including the solution of elementary recurrences.',
    topics: [
      {
        name: 'Algorithm specification',
        summary:
          'An algorithm is a finite sequence of unambiguous instructions that transforms a set of inputs into a set of outputs and terminates on every valid input. Specification states preconditions, postconditions, and the exact input-output relation.',
        keyPoints: [
          'Finiteness, definiteness, effectiveness, and input/output are the five classical properties.',
          'A program is an implementation of an algorithm in a language; one algorithm may have many programs.',
          'Correctness is proved separately from efficiency.',
        ],
        pitfall: 'Treating an algorithm and a program as the same object. The algorithm is the abstract procedure; the program is one realisation of it.',
      },
      {
        name: 'Asymptotic notation',
        summary:
          'O gives an upper bound, Ω a lower bound, Θ a tight bound, and o/ω strict versions. They compare growth rates up to constant factors and are defined over all sufficiently large inputs.',
        keyPoints: [
          'f(n) = O(g(n)) iff there exist c > 0 and n₀ with f(n) ≤ c·g(n) for all n ≥ n₀.',
          'Θ(g) = O(g) ∩ Ω(g).',
          'Constants and lower-order terms are dropped: 3n² + 5n + 7 = Θ(n²).',
        ],
        pitfall: 'Reading O as "exactly this order". O(1) is also O(n²); the tight statement needs Θ.',
      },
      {
        name: 'Growth rate ordering',
        summary:
          'Standard orders are 1 ≺ log log n ≺ log n ≺ √n ≺ n ≺ n log n ≺ n² ≺ n³ ≺ 2ⁿ ≺ n! ≺ nⁿ. Comparing two functions reduces to comparing their ratio in the limit.',
        keyPoints: [
          'log_b n differs from log_2 n only by the constant log_b 2, so the base is irrelevant asymptotically.',
          'Any polynomial grows slower than any exponential.',
          'n log n is the lower bound for comparison sorting.',
        ],
        pitfall: 'Believing 2ⁿ = O(n^k) for large k. Exponentials always overtake polynomials.',
      },
      {
        name: 'Best, worst and average case',
        summary:
          'Worst case bounds the maximum cost over inputs of size n; best case the minimum; average case the expected cost under a stated input distribution. Worst case is the usual guarantee quoted.',
        keyPoints: [
          'Linear search is Θ(1) best, Θ(n) worst, Θ(n) average with uniform keys.',
          'Average case analysis requires an explicit probability model — without one it is undefined.',
          'Amortised analysis averages over a worst-case sequence of operations.',
        ],
        pitfall: 'Quoting a best-case bound as the algorithm complexity, which hides the true cost on hard inputs.',
      },
      {
        name: 'Recurrence relations',
        summary:
          'Divide-and-conquer cost satisfies recurrences such as T(n) = aT(n/b) + f(n). They are solved by substitution, recursion trees, or the master theorem.',
        keyPoints: [
          'Merge sort: T(n) = 2T(n/2) + Θ(n) = Θ(n log n).',
          'Binary search: T(n) = T(n/2) + Θ(1) = Θ(log n).',
          'T(n) = 2T(n/2) + Θ(n²) = Θ(n²) by the master theorem root case.',
        ],
        pitfall: 'Dropping the floor/ceiling in n/b without noting that it changes only constants.',
      },
      {
        name: 'Master theorem',
        summary:
          'For T(n) = aT(n/b) + f(n) with a ≥ 1, b > 1, compare f(n) with n^(log_b a): if f is polynomially smaller the bound is Θ(n^(log_b a)); if comparable it gains a log factor; if polynomially larger and regular, the bound is Θ(f(n)).',
        keyPoints: [
          'Case 1: f(n) = O(n^(log_b a − ε)) → T(n) = Θ(n^(log_b a)).',
          'Case 2: f(n) = Θ(n^(log_b a)) → T(n) = Θ(n^(log_b a) log n).',
          'Case 3: f(n) = Ω(n^(log_b a + ε)) with regularity → T(n) = Θ(f(n)).',
        ],
        pitfall: 'Applying the theorem when f(n) is not polynomially comparable, for example f(n) = n log n against n^(log_b a) = n.',
      },
      {
        name: 'Space and time trade-offs',
        summary:
          'An algorithm may exchange memory for speed: precomputed tables, hashing, and memoisation all buy time with space. Choosing a strategy requires balancing both resources.',
        keyPoints: [
          'Counting sort and radix sort achieve linear time by using extra arrays instead of comparisons.',
          'Memoisation turns exponential recursion into polynomial time at the cost of a table.',
          'In-place algorithms use O(1) auxiliary space but may be slower.',
        ],
        pitfall: 'Forgetting that the auxiliary space of recursion includes the call stack depth.',
      },
    ],
  },
  {
    id: 2,
    code: 'U2',
    title: 'Divide and Conquer',
    tagline: 'Split, solve, and combine',
    accent: '#ef4444',
    overview:
      'Divide and conquer solves a problem by splitting it into smaller instances of the same problem, solving them recursively, and combining the results. This unit covers the classical sorting and searching algorithms, their exact comparison counts, and the analysis of their recurrences.',
    topics: [
      {
        name: 'Divide and conquer paradigm',
        summary:
          'The paradigm has three steps: divide the instance into subinstances, conquer them recursively, and combine the sub-solutions. Efficiency comes from subproblems that shrink geometrically.',
        keyPoints: [
          'The recurrence T(n) = aT(n/b) + C(n) captures the cost structure.',
          'Subproblems must be of the same type as the original for recursion to apply.',
          'Combining cost often dominates, as in merge sort.',
        ],
        pitfall: 'Splitting into subproblems that overlap, which is dynamic programming territory, not divide and conquer.',
      },
      {
        name: 'Binary search',
        summary:
          'Binary search finds a key in a sorted array by comparing with the middle element and discarding half the remaining range. It needs Θ(log n) comparisons in the worst case.',
        keyPoints: [
          'Recurrence T(n) = T(n/2) + 1 gives T(n) = Θ(log n).',
          'The array must be sorted; otherwise the discard step is invalid.',
          'Iterative and recursive forms use O(1) and O(log n) space respectively.',
        ],
        pitfall: 'Using mid = (low + high) / 2 in a fixed-width type, which can overflow; prefer low + (high − low) / 2.',
      },
      {
        name: 'Merge sort',
        summary:
          'Merge sort splits the array in half, sorts each half recursively, and merges the two sorted halves in linear time. It runs in Θ(n log n) time in every case and needs Θ(n) auxiliary space.',
        keyPoints: [
          'T(n) = 2T(n/2) + Θ(n) = Θ(n log n) by master theorem case 2.',
          'Merge sort is stable and not in place.',
          'The number of comparisons in the worst case is n⌈log₂ n⌉ − 2^⌈log₂ n⌉ + 1.',
        ],
        pitfall: 'Assuming merge sort is faster than quicksort on average. It has better worst-case bounds but larger constants.',
      },
      {
        name: 'Quick sort',
        summary:
          'Quick sort partitions around a pivot so that smaller elements precede it and larger follow, then sorts the parts recursively. Average Θ(n log n), worst Θ(n²) when the pivot is always extreme.',
        keyPoints: [
          'Lomuto and Hoare partitions differ in swap count and pivot placement.',
          'Randomised pivot selection makes the worst case improbable.',
          'Median-of-three reduces the chance of degenerate splits.',
        ],
        pitfall: 'Claiming quicksort is Θ(n log n) in the worst case. Its worst case is quadratic.',
      },
      {
        name: 'Comparison sorting lower bound',
        summary:
          'Any comparison-based sort needs Ω(n log n) comparisons in the worst case, because the decision tree has n! leaves and therefore height at least log₂(n!).',
        keyPoints: [
          'log₂(n!) = Θ(n log n) by Stirling\'s approximation.',
          'The bound applies only to comparison-based algorithms.',
          'Counting and radix sort beat the bound by not comparing keys directly.',
        ],
        pitfall: 'Applying the lower bound to radix sort, which is not comparison based.',
      },
      {
        name: 'Elementary sorts',
        summary:
          'Bubble, selection, and insertion sort all take Θ(n²) worst-case time. Insertion sort is Θ(n) on nearly sorted input, which makes it the best of the three in practice.',
        keyPoints: [
          'Selection sort always performs exactly n(n−1)/2 comparisons.',
          'Bubble sort with early exit is Θ(n) on sorted input.',
          'Insertion sort is stable and in place.',
        ],
        pitfall: 'Calling bubble sort adaptive without an early-exit flag; plain bubble sort is always quadratic.',
      },
      {
        name: 'Heap sort and heaps',
        summary:
          'Heap sort builds a max-heap in linear time and repeatedly extracts the maximum, giving Θ(n log n) worst-case time with O(1) auxiliary space. It is not stable.',
        keyPoints: [
          'Build-heap costs Θ(n), not Θ(n log n), because most nodes are near the leaves.',
          'Each extraction costs Θ(log n) for sift-down.',
          'A node at index i has children 2i+1 and 2i+2 in a zero-based array.',
        ],
        pitfall: 'Assuming heap sort is stable. Swapping the root with the last element destroys relative order.',
      },
      {
        name: 'Max-min and other D&C problems',
        summary:
          'Finding both maximum and minimum by divide and conquer uses about 3n/2 − 2 comparisons instead of 2n − 2 for the naive scan, and the same recursion solves closest-pair and Karatsuba multiplication.',
        keyPoints: [
          'Pairwise comparison then comparing winners and losers saves comparisons.',
          'Karatsuba multiplies n-digit numbers in Θ(n^1.585).',
          'Strassen multiplies matrices in Θ(n^2.807).',
        ],
        pitfall: 'Counting 2n comparisons for simultaneous max and min when the paired method needs only 3n/2.',
      },
    ],
  },
  {
    id: 3,
    code: 'U3',
    title: 'Dynamic Programming',
    tagline: 'Remember what you already solved',
    accent: '#22c55e',
    overview:
      'Dynamic programming solves problems with overlapping subproblems and optimal substructure by storing sub-solutions in a table. This unit covers the principle of optimality, memoisation versus tabulation, and the canonical DP problems: change making, assembly line scheduling, knapsack, matrix chain multiplication, and longest common subsequence.',
    topics: [
      {
        name: 'DP fundamentals',
        summary:
          'DP applies when a problem has optimal substructure and overlapping subproblems. Sub-solutions are computed once and reused, either top-down with memoisation or bottom-up with a table.',
        keyPoints: [
          'Optimal substructure: an optimal solution contains optimal sub-solutions.',
          'Overlapping subproblems distinguish DP from plain divide and conquer.',
          'The state must capture everything the future needs to know about the past.',
        ],
        pitfall: 'Applying DP when subproblems are independent; that is divide and conquer, and the table only wastes space.',
      },
      {
        name: 'Principle of optimality',
        summary:
          'Bellman\'s principle states that an optimal policy has the property that whatever the initial state and decision, the remaining decisions are optimal for the resulting state. It licenses the recursive formulation of DP.',
        keyPoints: [
          'Every subpath of a shortest path is a shortest path.',
          'The principle can fail when the state does not record all relevant history.',
          'Verifying it is the first step of any DP derivation.',
        ],
        pitfall: 'Assuming optimal substructure without proof — some problems, like longest simple path, lack it.',
      },
      {
        name: 'Making change',
        summary:
          'With an unlimited supply of coins, the minimum number of coins to make amount A satisfies C(A) = 1 + min{C(A − dᵢ)} over usable denominations, filled bottom-up from 0 to A.',
        keyPoints: [
          'Time is Θ(nA) for n denominations and target A.',
          'The greedy choice is optimal only for canonical coin systems such as Indian or US currency.',
          'The DP also reconstructs the coin multiset by storing predecessor choices.',
        ],
        pitfall: 'Using greedy for an arbitrary denomination set, e.g. {1, 3, 4} with target 6, where greedy gives 4+1+1 and DP gives 3+3.',
      },
      {
        name: 'Assembly line scheduling',
        summary:
          'Two assembly lines with station times and transfer costs are scheduled by tracking, for each station, the fastest time to reach it on each line, giving Θ(n) total time.',
        keyPoints: [
          'f₁[j] = min(f₁[j−1] + a₁ⱼ, f₂[j−1] + t₂ⱼ + a₁ⱼ).',
          'The final answer adds the exit cost on either line.',
          'The table has two rows and n columns, so space is Θ(n) and can be reduced to Θ(1).',
        ],
        pitfall: 'Forgetting the transfer cost is paid in addition to the station time.',
      },
      {
        name: '0/1 knapsack',
        summary:
          'With n items of weight wᵢ and value vᵢ and capacity W, the best value satisfies V(i,c) = max(V(i−1,c), vᵢ + V(i−1, c−wᵢ)) when wᵢ ≤ c. The table is Θ(nW).',
        keyPoints: [
          'The DP is pseudo-polynomial because W appears in the running time.',
          'Fractional knapsack is solved greedily by value density and is not the same problem.',
          'Backtracking through the table recovers the chosen items.',
        ],
        pitfall: 'Using the 0/1 recurrence for the unbounded variant; unbounded allows repeated items and iterates c upward.',
      },
      {
        name: 'Matrix chain multiplication',
        summary:
          'Choosing the parenthesisation that minimises scalar multiplications satisfies m[i,j] = min over k of m[i,k] + m[k+1,j] + pᵢ₋₁pₖpⱼ, computed by increasing chain length in Θ(n³) time.',
        keyPoints: [
          'Dimensions p₀…pₙ describe n matrices, matrix i being pᵢ₋₁ × pᵢ.',
          'The number of distinct parenthesations is the Catalan number C(n−1).',
          'An O(n²) Hu-Tucker style improvement exists but is not required.',
        ],
        pitfall: 'Indexing the dimension product as pᵢpₖpⱼ instead of pᵢ₋₁pₖpⱼ, which shifts every cost by one matrix.',
      },
      {
        name: 'Longest common subsequence',
        summary:
          'LCS of X and Y satisfies L(i,j) = L(i−1,j−1) + 1 when xᵢ = yⱼ, and max(L(i−1,j), L(i,j−1)) otherwise, filled in Θ(mn) time.',
        keyPoints: [
          'Subsequence means not necessarily contiguous; substring would be a different DP.',
          'The table reconstructs one LCS by walking backwards from (m,n).',
          'Edit distance uses a closely related recurrence with substitution costs.',
        ],
        pitfall: 'Confusing longest common subsequence with longest common substring, which requires contiguity and a different table.',
      },
      {
        name: 'Optimal binary search tree',
        summary:
          'Given search probabilities, the BST minimising expected search cost satisfies a Knuth-style interval recurrence filled by increasing interval length, in Θ(n³) or Θ(n²) with the Knuth optimisation.',
        keyPoints: [
          'cost(i,j) = sum of probabilities + min over root k of cost(i,k−1) + cost(k+1,j).',
          'The interval DP is the same shape as matrix chain multiplication.',
          'Weight-balanced is not the same as cost-optimal.',
        ],
        pitfall: 'Building a height-balanced tree and assuming it minimises expected search cost; probabilities decide the optimum.',
      },
    ],
  },
  {
    id: 4,
    code: 'U4',
    title: 'Greedy Method & Graphs',
    tagline: 'Take the best now, prove it later',
    accent: '#8b5cf6',
    overview:
      'Greedy algorithms build a solution one locally optimal choice at a time and are justified by an exchange argument. This unit covers the classical greedy problems and the fundamental graph algorithms for traversal, connectivity, spanning trees, and shortest paths.',
    topics: [
      {
        name: 'Greedy strategy',
        summary:
          'A greedy algorithm selects the locally best feasible option at each step and never reconsiders. Correctness requires the greedy-choice property and optimal substructure, usually proved by exchange.',
        keyPoints: [
          'Feasibility must be checkable incrementally.',
          'The exchange argument swaps an optimal solution toward the greedy prefix without loss.',
          'Greedy fails on 0/1 knapsack but succeeds on fractional knapsack.',
        ],
        pitfall: 'Assuming greedy is always optimal because it is fast; a counterexample disproves it immediately.',
      },
      {
        name: 'Activity selection',
        summary:
          'To schedule the maximum number of non-overlapping activities, sort by finish time and repeatedly take the next compatible activity. The greedy is optimal and runs in Θ(n log n) for the sort.',
        keyPoints: [
          'Choosing the earliest finishing activity leaves maximal room for the rest.',
          'Sorting by start time or by duration does not work.',
          'The exchange argument swaps the first greedy pick into any optimal schedule.',
        ],
        pitfall: 'Sorting by earliest start time, which fails on an activity that starts early and runs very long.',
      },
      {
        name: 'Fractional knapsack',
        summary:
          'Sort items by value per unit weight and take them in that order, splitting the last item. This greedy is optimal in Θ(n log n) because the fractional relaxation has the greedy-choice property.',
        keyPoints: [
          'The split item contributes a proportional fraction of its value.',
          'Density order is optimal only when items are divisible.',
          'The 0/1 version needs DP because taking an item is all-or-nothing.',
        ],
        pitfall: 'Applying the density greedy to 0/1 knapsack, where it can be arbitrarily far from optimal.',
      },
      {
        name: 'Job sequencing with deadlines',
        summary:
          'With unit-time jobs and deadlines, maximise profit by sorting jobs by decreasing profit and scheduling each in the latest free slot at or before its deadline, using a disjoint-set structure for near-linear time.',
        keyPoints: [
          'Each job takes exactly one time unit in the classical problem.',
          'The latest-free-slot rule preserves earlier slots for tighter deadlines.',
          'Sorting dominates the cost at Θ(n log n).',
        ],
        pitfall: 'Scheduling a job in the earliest free slot, which can block a job with an earlier deadline and lose profit.',
      },
      {
        name: 'Huffman coding',
        summary:
          'Huffman coding builds an optimal prefix code by repeatedly merging the two lowest-frequency nodes. The result minimises the weighted external path length, giving Θ(n log n) with a heap.',
        keyPoints: [
          'The two least frequent symbols are siblings at maximum depth in some optimal tree.',
          'Prefix-free codes correspond exactly to leaves of a binary tree.',
          'A tie between frequencies means multiple optimal codes exist.',
        ],
        pitfall: 'Claiming the Huffman code is unique. Ties produce several optimal trees with equal cost.',
      },
      {
        name: 'Graph traversal: BFS and DFS',
        summary:
          'BFS explores by increasing distance using a queue and finds shortest paths in unweighted graphs; DFS explores depth first using a stack or recursion and yields discovery and finish times, topological order, and cycle detection.',
        keyPoints: [
          'BFS is Θ(V+E) and gives a shortest-path tree in unweighted graphs.',
          'DFS is Θ(V+E) and classifies edges as tree, back, forward, or cross.',
          'A directed graph is acyclic iff DFS finds no back edge.',
        ],
        pitfall: 'Using BFS to find shortest paths in a weighted graph; it ignores edge weights.',
      },
      {
        name: 'Connectivity and components',
        summary:
          'A connected component is a maximal set of mutually reachable vertices. Counting components is a single traversal; strong connectivity in directed graphs needs Kosaraju or Tarjan.',
        keyPoints: [
          'Undirected components are found by repeated BFS or DFS from unvisited vertices.',
          'Strongly connected components are found by two DFS passes in Kosaraju.',
          'Union-find answers dynamic connectivity queries in near-constant amortised time.',
        ],
        pitfall: 'Confusing weak and strong connectivity in a directed graph.',
      },
      {
        name: 'Minimum spanning trees',
        summary:
          'Kruskal sorts edges by weight and adds those joining different components; Prim grows a tree from one vertex using a priority queue. Both are optimal and run in O(E log V).',
        keyPoints: [
          'Kruskal uses union-find to detect cycles in O(E log E).',
          'Prim is better on dense graphs with an adjacency matrix at Θ(V²).',
          'The cut property justifies both algorithms.',
        ],
        pitfall: 'Believing the MST is unique. Equal edge weights allow several distinct MSTs of the same total weight.',
      },
      {
        name: 'Single source shortest paths',
        summary:
          'Dijkstra grows the set of settled vertices by minimum tentative distance and is correct for non-negative weights; Bellman-Ford relaxes all edges V−1 times and handles negative weights and negative cycles.',
        keyPoints: [
          'Dijkstra with a binary heap is O((V+E) log V).',
          'Bellman-Ford is Θ(VE) and detects negative cycles in one extra pass.',
          'A negative edge can break Dijkstra because a settled vertex may later improve.',
        ],
        pitfall: 'Running Dijkstra on a graph with negative edge weights.',
      },
      {
        name: 'All pairs shortest paths',
        summary:
          'Floyd-Warshall computes all-pairs distances in Θ(V³) with the recurrence d[i][j] = min(d[i][j], d[i][k] + d[k][j]) over intermediate vertices; Johnson combines Bellman-Ford reweighting with Dijkstra for sparse graphs.',
        keyPoints: [
          'The outer loop must iterate over intermediate vertex k.',
          'Negative cycles appear as negative entries on the diagonal.',
          'Path reconstruction uses a next-hop matrix.',
        ],
        pitfall: 'Putting k in the innermost loop, which produces wrong results.',
      },
    ],
  },
  {
    id: 5,
    code: 'U5',
    title: 'Backtracking & Branch and Bound',
    tagline: 'Search the tree, prune the waste',
    accent: '#06b6d4',
    overview:
      'Backtracking systematically searches a state-space tree and abandons partial solutions as soon as they cannot be completed. Branch and bound adds bounding functions to prune subtrees that cannot beat the best known solution. This unit covers the classical combinatorial problems solved by both techniques.',
    topics: [
      {
        name: 'Backtracking framework',
        summary:
          'Backtracking builds solutions incrementally, checking at each step whether the partial assignment can be extended. When it cannot, the algorithm undoes the last choice and tries the next alternative.',
        keyPoints: [
          'The state-space tree has one level per decision variable.',
          'Pruning happens through feasibility and constraint checks.',
          'Worst-case time is exponential even with pruning; pruning improves the practical constant.',
        ],
        pitfall: 'Pruning only at complete leaves, which turns backtracking into plain brute force.',
      },
      {
        name: 'N-Queens',
        summary:
          'Placing n non-attacking queens on an n×n board is solved column by column, rejecting any placement that shares a row or diagonal with an existing queen. Solutions exist for every n except 2 and 3.',
        keyPoints: [
          'Row and both diagonals can be tracked with boolean arrays for O(1) conflict checks.',
          'The diagonal index is row − col and row + col.',
          'Counting solutions for n = 8 gives 92, of which 12 are distinct under symmetry.',
        ],
        pitfall: 'Checking only rows and columns, which misses diagonal conflicts.',
      },
      {
        name: 'Hamiltonian cycles',
        summary:
          'A Hamiltonian cycle visits every vertex exactly once and returns to the start. Backtracking extends a path vertex by vertex, rejecting moves to visited vertices or to a vertex that cannot complete the cycle.',
        keyPoints: [
          'Deciding whether a Hamiltonian cycle exists is NP-complete.',
          'A degree-based bound prunes vertices with no usable remaining neighbours.',
          'The TSP tour cost minimisation adds a cost bound to the same search tree.',
        ],
        pitfall: 'Forgetting the closing edge back to the start vertex when checking the final cycle.',
      },
      {
        name: 'Subset sum',
        summary:
          'Given positive weights and a target, backtracking includes or excludes each item and prunes when the running sum exceeds the target or the remaining items cannot reach it.',
        keyPoints: [
          'Sorting descending improves pruning because the bound tightens sooner.',
          'Subset sum is NP-complete but pseudo-polynomial DP solves it for small targets.',
          'The recursion tree has 2ⁿ leaves before pruning.',
        ],
        pitfall: 'Pruning only when the sum exceeds the target, missing the case where the remainder is too small.',
      },
      {
        name: 'Graph colouring',
        summary:
          'Assigning colours so adjacent vertices differ, using backtracking with the smallest available colour at each vertex, finds a colouring with a given number of colours or reports failure.',
        keyPoints: [
          'The chromatic number is the minimum number of colours needed.',
          'Welsh-Powell orders vertices by decreasing degree to improve pruning.',
          'Deciding 3-colourability is NP-complete.',
        ],
        pitfall: 'Assuming the greedy colouring always finds the chromatic number; it can use more colours than necessary.',
      },
      {
        name: 'Branch and bound',
        summary:
          'Branch and bound explores a search tree with a bounding function that discards subtrees whose best possible completion cannot beat the incumbent solution. It is the standard exact method for combinatorial optimisation.',
        keyPoints: [
          'Best-first search expands the most promising node; depth-first keeps memory small.',
          'The bound must never underestimate the true completion cost.',
          'A good incumbent found early dramatically increases pruning.',
        ],
        pitfall: 'Using an optimistic bound that is invalid, which prunes the optimal solution.',
      },
      {
        name: 'Travelling salesman problem',
        summary:
          'TSP seeks the cheapest Hamiltonian cycle. Branch and bound with a reduced-cost matrix bound solves moderate instances exactly, while heuristics such as nearest neighbour and 2-opt give fast approximations.',
        keyPoints: [
          'Row and column reduction gives a lower bound on any tour through the node.',
          'The nearest-neighbour heuristic can be far from optimal in the worst case.',
          'Metric TSP admits a 1.5-approximation via Christofides.',
        ],
        pitfall: 'Believing branch and bound makes TSP polynomial; it is still exponential in the worst case.',
      },
      {
        name: 'Assignment problem',
        summary:
          'Assigning n workers to n jobs at minimum cost is solved exactly by the Hungarian algorithm in Θ(n³), and by branch and bound for larger or constrained variants.',
        keyPoints: [
          'The cost matrix is square; dummy rows or columns handle imbalance.',
          'Subtracting row minima then column minima creates zeros without changing the optimum.',
          'The assignment problem is a special case of min-cost flow.',
        ],
        pitfall: 'Greedily picking the cheapest remaining cell, which can force an expensive assignment later.',
      },
    ],
  },
  {
    id: 6,
    code: 'U6',
    title: 'NP-Completeness & Approximation',
    tagline: 'When exact is too expensive',
    accent: '#ec4899',
    overview:
      'This unit formalises computational intractability and the practical response to it. It covers the classes P, NP, NP-hard and NP-complete, polynomial reductions, the standard NP-complete problems, approximation algorithms with their ratios, and randomised algorithms.',
    topics: [
      {
        name: 'Decision problems and classes P and NP',
        summary:
          'P contains decision problems solvable in polynomial time. NP contains problems whose yes-instances have a polynomial certificate checkable in polynomial time. P ⊆ NP, with equality an open question.',
        keyPoints: [
          'NP means nondeterministic polynomial time, not "not polynomial".',
          'A certificate is verified by a deterministic polynomial-time verifier.',
          'Every problem in P is in NP because the solution itself can be verified.',
        ],
        pitfall: 'Assuming NP contains only hard problems; all of P is inside NP.',
      },
      {
        name: 'Polynomial reductions',
        summary:
          'A polynomial-time many-one reduction A ≤p B maps instances of A to instances of B preserving yes/no answers in polynomial time. It transfers solvability and hardness between problems.',
        keyPoints: [
          'A ≤p B and B ∈ P implies A ∈ P.',
          'A ≤p B and A is NP-hard implies B is NP-hard.',
          'The reduction must run in polynomial time and preserve answers exactly.',
        ],
        pitfall: 'Reducing the known-hard problem to the new one and then claiming the new one is hard — the direction is reversed.',
      },
      {
        name: 'NP-hard and NP-complete',
        summary:
          'A problem is NP-hard if every NP problem reduces to it; it is NP-complete if it is NP-hard and in NP. Cook-Levin established SAT as the first NP-complete problem.',
        keyPoints: [
          'To prove X NP-complete: show X ∈ NP, then reduce a known NP-complete problem to X.',
          'SAT ≤p 3-SAT ≤p clique ≤p vertex cover chains the classical reductions.',
          'NP-hard problems need not be decidable or in NP.',
        ],
        pitfall: 'Proving membership in NP but forgetting the hardness reduction, which only gives X ∈ NP.',
      },
      {
        name: 'Classic NP-complete problems',
        summary:
          'SAT, 3-SAT, clique, vertex cover, independent set, Hamiltonian cycle, TSP decision, subset sum, partition, bin packing, and graph colouring are all NP-complete.',
        keyPoints: [
          '3-SAT is the standard starting point for reductions because of its regular clause structure.',
          'Clique in G equals independent set in the complement graph.',
          'Subset sum and partition are weakly NP-complete; they have pseudo-polynomial DP solutions.',
        ],
        pitfall: 'Treating weakly NP-complete problems as hopeless; they are tractable when the numeric values are small.',
      },
      {
        name: 'Approximation algorithms',
        summary:
          'An α-approximation runs in polynomial time and is within a factor α of the optimum. Vertex cover admits a 2-approximation, metric TSP a 1.5-approximation, and bin packing an 11/9 asymptotic bound.',
        keyPoints: [
          'The ratio is measured against the optimal value, not against a heuristic baseline.',
          'Some problems have no constant-factor approximation unless P = NP.',
          'PTAS and FPTAS families trade running time for accuracy.',
        ],
        pitfall: 'Quoting a ratio for a maximisation problem without inverting it; the convention differs between min and max problems.',
      },
      {
        name: 'Bin packing',
        summary:
          'Packing items into the fewest bins of fixed capacity is NP-hard. First-fit decreasing uses at most 11/9·OPT + 6/9 bins, and no algorithm can beat 3/2 unless P = NP.',
        keyPoints: [
          'First-fit decreasing sorts items descending then places each in the first bin that fits.',
          'Next-fit is simpler but can use nearly twice the optimal number of bins.',
          'The decision version "can it be done in k bins" is NP-complete.',
        ],
        pitfall: 'Assuming first-fit decreasing is optimal; simple instances exist where it uses more bins than necessary.',
      },
      {
        name: 'Randomised algorithms',
        summary:
          'Randomised algorithms make random choices to gain simplicity or speed. Las Vegas algorithms are always correct with random running time; Monte Carlo algorithms may err with bounded probability.',
        keyPoints: [
          'Randomised quicksort achieves Θ(n log n) expected time against any fixed input.',
          'Miller-Rabin primality testing is a Monte Carlo algorithm with adjustable error probability.',
          'Randomised selection finds the k-th smallest element in expected linear time.',
        ],
        pitfall: 'Confusing Las Vegas and Monte Carlo: only the latter can output a wrong answer.',
      },
      {
        name: 'Selection and order statistics',
        summary:
          'The k-th smallest element can be found in Θ(n) worst case by median-of-medians, or in expected Θ(n) by randomised quickselect, without sorting the whole array.',
        keyPoints: [
          'Quickselect partitions and recurses into one side only, giving expected linear time.',
          'Median-of-medians guarantees a 3n/10 to 7n/10 split, giving worst-case linear time.',
          'Sorting first would cost Θ(n log n) unnecessarily.',
        ],
        pitfall: 'Recursing into both partitions in quickselect, which degenerates to quicksort.',
      },
    ],
  },
]

export const DAA_STAGES: Stage[] = [
  {
    id: 1,
    name: 'Foundation',
    range: [1, 20],
    goal: 'Build foundational understanding of notation, recurrences, and algorithm properties.',
    mix: { Easy: 0.6, Medium: 0.3, Hard: 0.1 },
  },
  {
    id: 2,
    name: 'Concept Builder',
    range: [21, 40],
    goal: 'Strengthen conceptual understanding through comparisons and interpretation.',
    mix: { Easy: 0.4, Medium: 0.45, Hard: 0.15 },
  },
  {
    id: 3,
    name: 'Application Arena',
    range: [41, 60],
    goal: 'Apply theory to tracing, recurrence solving, and algorithm design.',
    mix: { Easy: 0.2, Medium: 0.55, Hard: 0.25 },
  },
  {
    id: 4,
    name: 'Advanced Challenge',
    range: [61, 80],
    goal: 'Solve multi-step and analytically demanding problems.',
    mix: { Easy: 0.1, Medium: 0.45, Hard: 0.45 },
  },
  {
    id: 5,
    name: 'Master Arena',
    range: [81, 100],
    goal: 'Demonstrate full-syllabus mastery under exam conditions.',
    mix: { Easy: 0.1, Medium: 0.3, Hard: 0.6 },
  },
]

export const DAA_UNIT_IDS: UnitId[] = [1, 2, 3, 4, 5, 6]
