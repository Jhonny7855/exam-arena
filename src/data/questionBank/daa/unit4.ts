import type { Family } from '../build'
import { num, pickWrongs } from '../build'
import { pick, randInt, shuffle, type Rng } from '../../../lib/rng'
import {
  type Edge,
  bfsOrder,
  dfsOrder,
  components,
  kruskal,
  prim,
  dijkstra,
  floydWarshall,
  activitySelection,
  fractionalKnapsack,
  jobSequencing,
  huffmanCost,
  buildMatrix,
} from '../../../lib/algorithms'

function randomConnectedGraph(rng: Rng, n: number, extra: number): Edge[] {
  const edges: Edge[] = []
  const used = new Set<string>()
  const add = (u: number, v: number) => {
    if (u === v) return
    const key = u < v ? `${u}-${v}` : `${v}-${u}`
    if (used.has(key)) return
    used.add(key)
    edges.push({ u, v, w: randInt(rng, 1, 12) })
  }
  const perm = shuffle(rng, Array.from({ length: n }, (_, i) => i))
  for (let i = 1; i < n; i++) {
    const j = randInt(rng, 0, i - 1)
    add(perm[i], perm[j])
  }
  let guard = 0
  while (edges.length < n - 1 + extra && guard < 200) {
    guard++
    add(randInt(rng, 0, n - 1), randInt(rng, 0, n - 1))
  }
  return edges
}

const edgeList = (edges: Edge[]) =>
  edges.map((e) => `${e.u}–${e.v} (${e.w})`).join(', ')

const fmtOrder = (o: number[]) => o.join(' → ')

export const daaUnit4Families: Family[] = [
  {
    id: 'daa-u4-activity-selection',
    unit: 4,
    topic: 'Activity selection',
    subtopic: 'Maximum compatible activities',
    difficulty: 'Medium',
    type: 'Application',
    count: 20,
    seconds: 70,
    tags: ['greedy', 'activity selection'],
    gen: (rng) => {
      const n = randInt(rng, 4, 7)
      const intervals: [number, number][] = []
      let t = 0
      for (let i = 0; i < n; i++) {
        const s = t + randInt(rng, 0, 3)
        const e = s + randInt(rng, 1, 4)
        intervals.push([s, e])
        t = s + randInt(rng, 0, 2)
      }
      const best = activitySelection(intervals)
      const total = intervals.length
      const c = num(best)
      const wrongs: [string, string][] = [
        [num(total), `${total} is the total number of activities; some overlap and cannot all be selected.`],
        [num(Math.max(best - 1, 1)), `This is one fewer than the greedy optimum ${best}.`],
        [num(best + 1), `This exceeds the maximum compatible set ${best}.`],
        [num(Math.ceil(total / 2)), `Halving the activity count has no relation to the overlap structure here.`],
        [num(1), `Only one activity would be selectable only if all intervals overlapped, which is not the case.`],
      ]
      return {
        prompt: `Activities with intervals (start, finish) are: ${intervals.map(([s, e]) => `(${s}, ${e})`).join(', ')}. What is the maximum number of non-overlapping activities that can be selected?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Sorting by finish time and repeatedly taking the next activity that starts at or after the last chosen finish gives ${best} activities. This greedy is optimal by an exchange argument.`,
        hint: 'Sort by finish time, then take each activity that starts after the previous finish.',
        correctWhy: `Correct: ${best} non-overlapping activities.`,
      }
    },
  },
  {
    id: 'daa-u4-fractional-knapsack',
    unit: 4,
    topic: 'Fractional knapsack',
    subtopic: 'Density-ordered greedy',
    difficulty: 'Hard',
    type: 'Application',
    count: 15,
    seconds: 80,
    tags: ['greedy', 'fractional knapsack'],
    gen: (rng) => {
      const n = randInt(rng, 3, 4)
      const weights = Array.from({ length: n }, () => randInt(rng, 2, 8))
      const values = Array.from({ length: n }, () => randInt(rng, 6, 24))
      const capacity = randInt(rng, 6, 16)
      const frac = fractionalKnapsack(weights, values, capacity)
      const c = String(frac)
      const wrongs: [string, string][] = [
        [num(weights.reduce((a, b) => a + b, 0) <= capacity ? values.reduce((a, b) => a + b, 0) : Math.max(...values)), `Taking the single most valuable item (or everything) does not use the density ordering that makes fractional knapsack optimal.`],
        [num(Math.round(frac) + 2), `This is above the optimum ${frac}; the density-ordered greedy achieves exactly ${frac}.`],
        [num(Math.max(Math.round(frac) - 3, 1)), `This is below the optimum ${frac}.`],
        [num(values.reduce((a, b) => a + b, 0)), `Taking all items exceeds the capacity of ${capacity}.`],
        [num(capacity), `The answer is a value, not the capacity itself.`],
      ]
      return {
        prompt: `Items have weights [${weights.join(', ')}] and values [${values.join(', ')}]. The knapsack capacity is ${capacity} and items may be split. What is the maximum total value?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Sorting by value density and taking items until the capacity is exhausted, splitting the last item proportionally, gives ${frac}. Because items are divisible, this greedy is optimal.`,
        hint: 'Order by value per unit weight and fill until the capacity is used up.',
        correctWhy: `Correct: the fractional optimum is ${frac}.`,
      }
    },
  },
  {
    id: 'daa-u4-job-sequencing',
    unit: 4,
    topic: 'Job sequencing with deadlines',
    subtopic: 'Maximum profit schedule',
    difficulty: 'Hard',
    type: 'Application',
    count: 15,
    seconds: 80,
    tags: ['greedy', 'job sequencing'],
    gen: (rng) => {
      const n = randInt(rng, 3, 5)
      const profits = Array.from({ length: n }, () => randInt(rng, 10, 90))
      const deadlines = Array.from({ length: n }, () => randInt(rng, 1, 3))
      const best = jobSequencing(profits, deadlines)
      const c = num(best)
      const total = profits.reduce((a, b) => a + b, 0)
      const wrongs: [string, string][] = [
        [num(total), `${total} is the sum of all profits, but the deadlines of ${deadlines.join(', ')} do not allow scheduling every job.`],
        [num(Math.max(...profits)), `This is only the single best job's profit, not the best schedule.`],
        [num(best + Math.min(...profits)), `This adds a job that cannot fit within its deadline.`],
        [num(Math.max(best - Math.min(...profits), 0)), `This drops a job that can actually be scheduled, giving less than ${best}.`],
        [num(profits.filter((_, i) => deadlines[i] >= 1).length), `This counts jobs, not the profit of the optimal schedule.`],
      ]
      return {
        prompt: `Jobs have profits [${profits.join(', ')}] and deadlines [${deadlines.join(', ')}]. Each job takes exactly one time unit and a job must finish by its deadline. What is the maximum total profit?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Sort jobs by decreasing profit and place each in the latest free time slot at or before its deadline. For these profits and deadlines the best schedule earns ${best}.`,
        hint: 'Sort by profit descending and assign the latest available slot before each deadline.',
        correctWhy: `Correct: maximum profit ${best}.`,
      }
    },
  },
  {
    id: 'daa-u4-huffman',
    unit: 4,
    topic: 'Huffman coding',
    subtopic: 'Weighted external path length',
    difficulty: 'Hard',
    type: 'Application',
    count: 18,
    seconds: 80,
    tags: ['huffman', 'greedy'],
    gen: (rng) => {
      const n = randInt(rng, 4, 6)
      const freqs = Array.from({ length: n }, () => randInt(rng, 2, 30)).sort((a, b) => a - b)
      const cost = huffmanCost(freqs)
      const c = num(cost)
      const sum = freqs.reduce((a, b) => a + b, 0)
      const wrongs: [string, string][] = [
        [num(sum), `${sum} is the total frequency, which equals the cost only when every symbol has depth 1.`],
        [num(cost + Math.min(...freqs)), `This adds one extra symbol cost beyond the Huffman total ${cost}.`],
        [num(Math.max(cost - Math.max(...freqs), 1)), `This undercounts; the Huffman merge order gives ${cost}.`],
        [num(cost * 2), `This is double the Huffman cost ${cost}.`],
        [num(sum * Math.ceil(Math.log2(n))), `A fixed-length code with ⌈log₂ ${n}⌉ bits per symbol costs ${sum * Math.ceil(Math.log2(n))}, which Huffman improves on.`],
      ]
      return {
        prompt: `Symbols have frequencies [${freqs.join(', ')}]. What is the minimum weighted external path length (total encoded length in bits) of an optimal prefix code?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Huffman repeatedly merges the two smallest weights. For [${freqs.join(', ')}] the merges sum to ${cost}, which equals the weighted external path length of the optimal prefix code.`,
        hint: 'Merge the two smallest frequencies repeatedly and add each merged weight.',
        correctWhy: `Correct: optimal cost ${cost} bits.`,
      }
    },
  },
  {
    id: 'daa-u4-bfs-order',
    unit: 4,
    topic: 'Graph traversal: BFS and DFS',
    subtopic: 'BFS visit order',
    difficulty: 'Medium',
    type: 'Application',
    count: 18,
    seconds: 70,
    tags: ['bfs', 'traversal'],
    gen: (rng) => {
      const n = randInt(rng, 5, 7)
      const edges = randomConnectedGraph(rng, n, randInt(rng, 0, 2))
      const order = bfsOrder(n, edges, 0)
      const correct = fmtOrder(order)
      const wrongs: [string, string][] = [
        [fmtOrder(dfsOrder(n, edges, 0)), 'This is the DFS visit order, which follows one branch to the bottom before backtracking. BFS uses a queue and visits level by level.'],
        [fmtOrder([...order].reverse()), 'Reversing the BFS order does not correspond to any valid queue-based traversal from vertex 0.'],
        [fmtOrder([...order].slice(1).concat(order[0])), 'Rotating the order moves the start vertex to the end, but BFS always visits the start first.'],
        [fmtOrder(shuffle(rng, order)), 'A shuffled order is not a valid BFS traversal; neighbours are visited in increasing index order from the queue.'],
      ]
      return {
        prompt: `A graph on vertices 0…${n - 1} has undirected edges: ${edgeList(edges)}. Running BFS from vertex 0 and visiting neighbours in increasing index order, what is the visit order?`,
        correct,
        wrong: pickWrongs(correct, wrongs, rng, 3),
        explanation: `BFS uses a FIFO queue: start with 0, enqueue unvisited neighbours in increasing order, then dequeue and repeat. For this graph the order is ${correct}.`,
        hint: 'Use a queue; enqueue neighbours in increasing index order.',
        correctWhy: `Correct: BFS visits ${correct}.`,
      }
    },
  },
  {
    id: 'daa-u4-dfs-order',
    unit: 4,
    topic: 'Graph traversal: BFS and DFS',
    subtopic: 'DFS visit order',
    difficulty: 'Medium',
    type: 'Application',
    count: 18,
    seconds: 70,
    tags: ['dfs', 'traversal'],
    gen: (rng) => {
      const n = randInt(rng, 5, 7)
      const edges = randomConnectedGraph(rng, n, randInt(rng, 0, 2))
      const order = dfsOrder(n, edges, 0)
      const correct = fmtOrder(order)
      const wrongs: [string, string][] = [
        [fmtOrder(bfsOrder(n, edges, 0)), 'This is the BFS order, which visits all neighbours of a vertex before descending. DFS descends as deep as possible first.'],
        [fmtOrder([...order].reverse()), 'Reversing the DFS order does not match a valid depth-first traversal from vertex 0.'],
        [fmtOrder([...order].slice(1).concat(order[0])), 'DFS always visits the start vertex first, so it cannot appear at the end.'],
        [fmtOrder(shuffle(rng, order)), 'A shuffled sequence does not respect the recursive descent structure of DFS.'],
      ]
      return {
        prompt: `A graph on vertices 0…${n - 1} has undirected edges: ${edgeList(edges)}. Running recursive DFS from vertex 0 and visiting neighbours in increasing index order, what is the visit (discovery) order?`,
        correct,
        wrong: pickWrongs(correct, wrongs, rng, 3),
        explanation: `DFS marks a vertex when first reached and immediately recurses into its smallest unvisited neighbour. For this graph the discovery order is ${correct}.`,
        hint: 'Recurse into the smallest unvisited neighbour immediately.',
        correctWhy: `Correct: DFS discovers ${correct}.`,
      }
    },
  },
  {
    id: 'daa-u4-components',
    unit: 4,
    topic: 'Connectivity and components',
    subtopic: 'Counting connected components',
    difficulty: 'Easy',
    type: 'Application',
    count: 15,
    seconds: 60,
    tags: ['connectivity', 'components'],
    gen: (rng) => {
      const n = randInt(rng, 5, 8)
      const edges = randomConnectedGraph(rng, n, randInt(rng, 0, 2))
      const drop = randInt(rng, 0, Math.min(2, edges.length - 1))
      const kept = shuffle(rng, edges).slice(0, Math.max(edges.length - drop, 0))
      const count = components(n, kept)
      const c = num(count)
      const wrongs: [string, string][] = [
        [num(count + 1), `This is one more than the actual number of components ${count}.`],
        [num(Math.max(count - 1, 1)), `This is one fewer than the actual number of components ${count}.`],
        [num(n), `${n} would mean every vertex is isolated, which is not the case here.`],
        [num(1), `The graph is not fully connected, so there is more than one component.`],
        [num(kept.length), `${kept.length} counts edges, not connected components.`],
      ]
      return {
        prompt: `A graph on vertices 0…${n - 1} has undirected edges: ${kept.length ? edgeList(kept) : '(none)'}. How many connected components does it have?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Running a traversal from each unvisited vertex and counting the number of traversals gives the component count. Here it is ${count}.`,
        hint: 'Count how many times you must restart a traversal from an unvisited vertex.',
        correctWhy: `Correct: ${count} connected components.`,
      }
    },
  },
  {
    id: 'daa-u4-kruskal',
    unit: 4,
    topic: 'Minimum spanning trees',
    subtopic: 'MST total weight',
    difficulty: 'Hard',
    type: 'Application',
    count: 18,
    seconds: 90,
    tags: ['mst', 'kruskal'],
    gen: (rng) => {
      const n = randInt(rng, 4, 6)
      const edges = randomConnectedGraph(rng, n, randInt(rng, 1, 3))
      const { weight, picked } = kruskal(n, edges)
      const c = num(weight)
      const total = edges.reduce((a, b) => a + b.w, 0)
      const wrongs: [string, string][] = [
        [num(total), `${total} is the sum of all edge weights, which would create cycles; the MST uses only ${n - 1} edges.`],
        [num(weight + 1), `This is one unit heavier than the MST weight ${weight}.`],
        [num(Math.max(weight - 1, 0)), `This is one unit lighter than the MST weight ${weight}, which no spanning tree achieves.`],
        [num(weight * 2), `This is double the MST weight ${weight}.`],
        [num(Math.min(...edges.map((e) => e.w)) * (n - 1)), `Multiplying the lightest edge by n−1 assumes all tree edges have that weight, which is false here.`],
      ]
      return {
        prompt: `A weighted graph on vertices 0…${n - 1} has undirected edges: ${edgeList(edges)}. What is the total weight of a minimum spanning tree?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Kruskal sorts edges by weight and adds each edge that joins two different components. The chosen edges are ${picked.map((e) => `${e.u}–${e.v}(${e.w})`).join(', ')}, totalling ${weight}.`,
        hint: 'Sort edges by weight and add them unless they create a cycle.',
        correctWhy: `Correct: MST weight ${weight}.`,
      }
    },
  },
  {
    id: 'daa-u4-dijkstra',
    unit: 4,
    topic: 'Single source shortest paths',
    subtopic: 'Shortest distances from a source',
    difficulty: 'Hard',
    type: 'Application',
    count: 18,
    seconds: 90,
    tags: ['dijkstra', 'shortest path'],
    gen: (rng) => {
      const n = randInt(rng, 4, 5)
      const edges = randomConnectedGraph(rng, n, randInt(rng, 1, 3))
      const dist = dijkstra(n, edges, 0)
      const target = randInt(rng, 1, n - 1)
      const c = dist[target] === Infinity ? '∞ (unreachable)' : num(dist[target])
      const maxW = Math.max(...edges.map((e) => e.w))
      const wrongs: [string, string][] = [
        [num(dist[target] + maxW), `This is one maximum edge weight heavier than the shortest distance ${dist[target]}.`],
        [num(Math.max(dist[target] - 1, 0)), `This is below the true shortest distance ${dist[target]}, which no path achieves.`],
        [num(dist[target] * 2), `This doubles the shortest distance ${dist[target]}.`],
        [num(Math.min(...edges.filter((e) => e.u === 0 || e.v === 0).map((e) => e.w))), `This is only the weight of the cheapest edge leaving the source, not the path cost to vertex ${target}.`],
        [num(n - 1), `${n - 1} is the edge count of a spanning tree, not a distance.`],
      ]
      return {
        prompt: `A weighted undirected graph on vertices 0…${n - 1} has edges: ${edgeList(edges)}. What is the shortest-path distance from vertex 0 to vertex ${target}?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Dijkstra settles the closest unsettled vertex each round and relaxes its edges. Distances from vertex 0 are [${dist.map((d) => (d === Infinity ? '∞' : d)).join(', ')}], so the distance to vertex ${target} is ${c}.`,
        hint: 'Settle the closest vertex first, then relax its outgoing edges.',
        correctWhy: `Correct: shortest distance ${c}.`,
      }
    },
  },
  {
    id: 'daa-u4-floyd',
    unit: 4,
    topic: 'All pairs shortest paths',
    subtopic: 'Floyd-Warshall distance',
    difficulty: 'Hard',
    type: 'Application',
    count: 15,
    seconds: 90,
    tags: ['floyd-warshall', 'all pairs'],
    gen: (rng) => {
      const n = randInt(rng, 4, 5)
      const edges = randomConnectedGraph(rng, n, randInt(rng, 1, 3))
      const d = floydWarshall(n, edges)
      const i = randInt(rng, 0, n - 1)
      let j = randInt(rng, 0, n - 1)
      if (j === i) j = (j + 1) % n
      const c = d[i][j] === Infinity ? '∞ (unreachable)' : num(d[i][j])
      const wrongs: [string, string][] = [
        [num(d[i][j] + 2), `This is two units heavier than the true all-pairs distance ${d[i][j]}.`],
        [num(Math.max(d[i][j] - 2, 0)), `This is below the true all-pairs distance ${d[i][j]}.`],
        [num(d[i][j] * 2), `This doubles the true distance ${d[i][j]}.`],
        [num(Math.abs(i - j)), `The index difference is not a path length in a weighted graph.`],
        [num(buildMatrix(n, edges)[i][j] === Infinity ? 0 : buildMatrix(n, edges)[i][j]), `This is the direct-edge weight, which ignores potentially cheaper multi-hop routes.`],
      ]
      return {
        prompt: `A weighted undirected graph on vertices 0…${n - 1} has edges: ${edgeList(edges)}. After running Floyd-Warshall, what is the shortest distance from vertex ${i} to vertex ${j}?`,
        correct: c,
        wrong: pickWrongs(c, wrongs, rng, 3),
        explanation: `Floyd-Warshall relaxes d[i][j] = min(d[i][j], d[i][k] + d[k][j]) for every intermediate vertex k. The resulting distance matrix has d[${i}][${j}] = ${c}.`,
        hint: 'Consider every vertex as an intermediate hop in turn.',
        correctWhy: `Correct: d[${i}][${j}] = ${c}.`,
      }
    },
  },
  {
    id: 'daa-u4-greedy-concept',
    unit: 4,
    topic: 'Greedy strategy',
    subtopic: 'Correctness of greedy choices',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 18,
    seconds: 50,
    tags: ['greedy', 'exchange argument'],
    gen: (rng) => {
      const cases = [
        {
          q: 'Which problem is solved optimally by the greedy density ordering?',
          correct: 'Fractional knapsack',
          wrongs: [
            ['0/1 knapsack', 'The 0/1 version needs DP because a locally best density choice can block a better combination.'],
            ['Longest common subsequence', 'LCS needs DP; no greedy rule is known to be optimal.'],
            ['Matrix chain multiplication', 'Parenthesisation choice needs interval DP.'],
          ],
          why: 'Divisibility makes the density ordering exchange-safe, so greedy is optimal for fractional knapsack.',
        },
        {
          q: 'Which ordering makes the activity-selection greedy optimal?',
          correct: 'Sort by earliest finish time',
          wrongs: [
            ['Sort by earliest start time', 'An early-starting long activity can block many short ones.'],
            ['Sort by shortest duration', 'Short duration does not guarantee the earliest finish.'],
            ['Sort by latest start time', 'This delays the schedule and reduces the number of activities.'],
          ],
          why: 'Choosing the earliest finishing activity leaves the maximum remaining time for the rest.',
        },
        {
          q: 'What is the purpose of an exchange argument in proving a greedy algorithm correct?',
          correct: 'Show that any optimal solution can be transformed to include the greedy choice without loss',
          wrongs: [
            ['Show that the greedy algorithm runs in polynomial time', 'Complexity and correctness are separate; exchange arguments establish optimality.'],
            ['Show that no other algorithm is faster', 'Exchange arguments prove optimality, not speed.'],
            ['Show that the greedy choice is the only feasible choice', 'The greedy choice need not be the only feasible one, just extendable to an optimum.'],
          ],
          why: 'If an optimal solution can always be swapped to agree with the greedy prefix, the greedy algorithm is optimal.',
        },
        {
          q: 'Why does the density greedy fail on 0/1 knapsack?',
          correct: 'Items cannot be split, so a high-density item can block a better combination',
          wrongs: [
            ['Because density is not well defined', 'Density is well defined; the issue is indivisibility.'],
            ['Because sorting is too expensive', 'Sorting is only Θ(n log n) and is not the obstacle.'],
            ['Because the capacity is an integer', 'Integrality of the capacity is not the core problem; indivisibility of items is.'],
          ],
          why: 'Without splitting, taking a slightly better-density item may prevent taking two items with a larger combined value.',
        },
        {
          q: 'Which graph problem does Kruskal solve greedily and correctly?',
          correct: 'Minimum spanning tree',
          wrongs: [
            ['Shortest path from one source', 'Shortest paths need Dijkstra or Bellman-Ford; Kruskal builds a spanning tree, not paths.'],
            ['Maximum clique', 'Clique is NP-hard and not solved greedily.'],
            ['Graph colouring with the minimum number of colours', 'Greedy colouring can use more colours than the chromatic number.'],
          ],
          why: 'The cut property guarantees that the cheapest edge crossing any cut belongs to some MST, which validates Kruskal.',
        },
      ]
      const c = pick(rng, cases)
      return {
        prompt: c.q,
        correct: c.correct,
        wrong: pickWrongs(c.correct, c.wrongs as [string, string][], rng, 3),
        explanation: c.why,
        hint: 'Check whether divisibility or the cut property is what saves the greedy choice.',
        correctWhy: `Correct. ${c.why}`,
      }
    },
  },
  {
    id: 'daa-u4-graph-properties',
    unit: 4,
    topic: 'Connectivity and components',
    subtopic: 'Tree and edge counting',
    difficulty: 'Medium',
    type: 'Application',
    count: 16,
    seconds: 50,
    tags: ['trees', 'edges', 'connectivity'],
    gen: (rng) => {
      const n = randInt(rng, 5, 20)
      const mode = pick(rng, ['tree-edges', 'cycle-edges', 'sparse'] as const)
      if (mode === 'tree-edges') {
        const c = num(n - 1)
        return {
          prompt: `A connected undirected graph on ${n} vertices is a tree. How many edges does it have?`,
          correct: c,
          wrong: [
            [num(n), `${n} edges would create exactly one cycle, so the graph would not be a tree.`],
            [num(n + 1), `That is more edges than a tree on ${n} vertices can have.`],
            [num((n * (n - 1)) / 2), `${num((n * (n - 1)) / 2)} is the number of edges in a complete graph, not a tree.`],
          ],
          explanation: `Every tree on n vertices has exactly n − 1 edges, because each edge added to a forest reduces the component count by one. With n = ${n} that is ${c}.`,
          hint: 'A tree on n vertices always has n − 1 edges.',
          correctWhy: `Correct: ${c} edges.`,
        }
      }
      if (mode === 'cycle-edges') {
        const k = randInt(rng, 3, Math.min(n, 9))
        const c = num(k)
        return {
          prompt: `A simple cycle graph contains ${k} vertices. How many edges does it have?`,
          correct: c,
          wrong: [
            [num(k - 1), `${k - 1} edges would make it a path, which has two endpoints; a cycle closes on itself.`],
            [num(k + 1), `A cycle has exactly as many edges as vertices.`],
            [num((k * (k - 1)) / 2), `${num((k * (k - 1)) / 2)} is the edge count of a complete graph, not a cycle.`],
          ],
          explanation: `A cycle visits each of its ${k} vertices and returns to the start, so it has exactly ${k} edges.`,
          hint: 'A cycle closes on itself, so edges equal vertices.',
          correctWhy: `Correct: ${c} edges.`,
        }
      }
      const c = num(n - 1)
      return {
        prompt: `A connected graph on ${n} vertices has the minimum possible number of edges. How many edges does it have?`,
        correct: c,
        wrong: [
          [num(n), `${n} edges is one more than the minimum for a connected graph on ${n} vertices.`],
          [num(1), `A single edge connects only two vertices, so it cannot connect ${n}.`],
          [num((n * (n - 1)) / 2), `That is the maximum for a simple graph, not the minimum.`],
        ],
        explanation: `A minimally connected graph is a tree, and every tree on n vertices has n − 1 edges. For n = ${n} that is ${c}.`,
        hint: 'Minimal connectivity is achieved by a spanning tree.',
        correctWhy: `Correct: ${c} edges.`,
      }
    },
  },
]
