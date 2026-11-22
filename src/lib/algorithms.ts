export interface Edge {
  u: number
  v: number
  w: number
}

export interface WeightedGraph {
  n: number
  edges: Edge[]
  directed?: boolean
}

export function buildMatrix(n: number, edges: Edge[], directed = false): number[][] {
  const m: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity))
  for (let i = 0; i < n; i++) m[i][i] = 0
  for (const { u, v, w } of edges) {
    if (w < m[u][v]) m[u][v] = w
    if (!directed && w < m[v][u]) m[v][u] = w
  }
  return m
}

export function adjacency(n: number, edges: Edge[], directed = false): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const { u, v } of edges) {
    adj[u].push(v)
    if (!directed) adj[v].push(u)
  }
  for (const list of adj) list.sort((a, b) => a - b)
  return adj
}

export function bfsOrder(n: number, edges: Edge[], start = 0, directed = false): number[] {
  const adj = adjacency(n, edges, directed)
  const seen = new Array(n).fill(false)
  const order: number[] = []
  const queue = [start]
  seen[start] = true
  while (queue.length) {
    const u = queue.shift()!
    order.push(u)
    for (const v of adj[u]) {
      if (!seen[v]) {
        seen[v] = true
        queue.push(v)
      }
    }
  }
  return order
}

export function dfsOrder(n: number, edges: Edge[], start = 0, directed = false): number[] {
  const adj = adjacency(n, edges, directed)
  const seen = new Array(n).fill(false)
  const order: number[] = []
  const visit = (u: number) => {
    seen[u] = true
    order.push(u)
    for (const v of adj[u]) if (!seen[v]) visit(v)
  }
  visit(start)
  return order
}

export function components(n: number, edges: Edge[]): number {
  const adj = adjacency(n, edges)
  const seen = new Array(n).fill(false)
  let count = 0
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    count++
    const stack = [s]
    seen[s] = true
    while (stack.length) {
      const u = stack.pop()!
      for (const v of adj[u]) {
        if (!seen[v]) {
          seen[v] = true
          stack.push(v)
        }
      }
    }
  }
  return count
}

class DSU {
  parent: number[]
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i)
  }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]
      x = this.parent[x]
    }
    return x
  }
  union(a: number, b: number): boolean {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return false
    this.parent[ra] = rb
    return true
  }
}

export function kruskal(n: number, edges: Edge[]): { weight: number; picked: Edge[] } {
  const dsu = new DSU(n)
  const sorted = [...edges].sort((a, b) => a.w - b.w || a.u - b.u || a.v - b.v)
  const picked: Edge[] = []
  let weight = 0
  for (const e of sorted) {
    if (dsu.union(e.u, e.v)) {
      picked.push(e)
      weight += e.w
      if (picked.length === n - 1) break
    }
  }
  return { weight, picked }
}

export function prim(n: number, edges: Edge[], start = 0): { weight: number; order: number[] } {
  const m = buildMatrix(n, edges)
  const inTree = new Array(n).fill(false)
  const key = new Array(n).fill(Infinity)
  key[start] = 0
  const order: number[] = []
  let weight = 0
  for (let iter = 0; iter < n; iter++) {
    let u = -1
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && (u === -1 || key[i] < key[u])) u = i
    }
    if (u === -1 || key[u] === Infinity) break
    inTree[u] = true
    order.push(u)
    weight += key[u]
    for (let v = 0; v < n; v++) {
      if (!inTree[v] && m[u][v] < key[v]) key[v] = m[u][v]
    }
  }
  return { weight, order }
}

export function dijkstra(n: number, edges: Edge[], source = 0, directed = false): number[] {
  const adj = Array.from({ length: n }, () => [] as { to: number; w: number }[])
  for (const { u, v, w } of edges) {
    adj[u].push({ to: v, w })
    if (!directed) adj[v].push({ to: u, w })
  }
  const dist = new Array(n).fill(Infinity)
  const done = new Array(n).fill(false)
  dist[source] = 0
  for (let iter = 0; iter < n; iter++) {
    let u = -1
    for (let i = 0; i < n; i++) {
      if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i
    }
    if (u === -1 || dist[u] === Infinity) break
    done[u] = true
    for (const { to, w } of adj[u]) {
      if (dist[u] + w < dist[to]) dist[to] = dist[u] + w
    }
  }
  return dist
}

export function floydWarshall(n: number, edges: Edge[], directed = false): number[][] {
  const d = buildMatrix(n, edges, directed)
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j]
      }
    }
  }
  return d
}

export function mergeSortCount(arr: number[]): { sorted: number[]; comparisons: number } {
  let comparisons = 0
  const sort = (a: number[]): number[] => {
    if (a.length <= 1) return a
    const mid = Math.floor(a.length / 2)
    const left = sort(a.slice(0, mid))
    const right = sort(a.slice(mid))
    const out: number[] = []
    let i = 0
    let j = 0
    while (i < left.length && j < right.length) {
      comparisons++
      if (left[i] <= right[j]) out.push(left[i++])
      else out.push(right[j++])
    }
    while (i < left.length) out.push(left[i++])
    while (j < right.length) out.push(right[j++])
    return out
  }
  return { sorted: sort(arr), comparisons }
}

export function insertionSortCount(arr: number[]): number {
  let comparisons = 0
  const a = [...arr]
  for (let i = 1; i < a.length; i++) {
    const key = a[i]
    let j = i - 1
    while (j >= 0) {
      comparisons++
      if (a[j] > key) {
        a[j + 1] = a[j]
        j--
      } else break
    }
    a[j + 1] = key
  }
  return comparisons
}

export function selectionSortCount(arr: number[]): number {
  let comparisons = 0
  const a = [...arr]
  for (let i = 0; i < a.length - 1; i++) {
    let min = i
    for (let j = i + 1; j < a.length; j++) {
      comparisons++
      if (a[j] < a[min]) min = j
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]]
  }
  return comparisons
}

export function bubbleSortCount(arr: number[]): { comparisons: number; swaps: number } {
  let comparisons = 0
  let swaps = 0
  const a = [...arr]
  for (let i = 0; i < a.length - 1; i++) {
    let changed = false
    for (let j = 0; j < a.length - 1 - i; j++) {
      comparisons++
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        swaps++
        changed = true
      }
    }
    if (!changed) break
  }
  return { comparisons, swaps }
}

export function binarySearchCount(sorted: number[], target: number): number {
  let low = 0
  let high = sorted.length - 1
  let count = 0
  while (low <= high) {
    count++
    const mid = Math.floor((low + high) / 2)
    if (sorted[mid] === target) return count
    if (sorted[mid] < target) low = mid + 1
    else high = mid - 1
  }
  return count
}

export function linearSearchCount(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) if (arr[i] === target) return i + 1
  return arr.length
}

export function quickSortPartition(arr: number[], low: number, high: number): number {
  const a = [...arr]
  const pivot = a[high]
  let i = low - 1
  for (let j = low; j < high; j++) {
    if (a[j] <= pivot) {
      i++
      ;[a[i], a[j]] = [a[j], a[i]]
    }
  }
  ;[a[i + 1], a[high]] = [a[high], a[i + 1]]
  return i + 1
}

export function partitionArray(arr: number[]): { left: number[]; pivot: number; right: number[] } {
  const pivot = arr[arr.length - 1]
  const left: number[] = []
  const right: number[] = []
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= pivot) left.push(arr[i])
    else right.push(arr[i])
  }
  return { left, pivot, right }
}

export function quickselect(arr: number[], k: number): number {
  const a = [...arr]
  const go = (lo: number, hi: number, kk: number): number => {
    if (lo === hi) return a[lo]
    const pivot = a[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      if (a[j] <= pivot) {
        ;[a[i], a[j]] = [a[j], a[i]]
        i++
      }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    if (kk === i) return a[i]
    if (kk < i) return go(lo, i - 1, kk)
    return go(i + 1, hi, kk)
  }
  return go(0, a.length - 1, k - 1)
}

export function coinChangeMin(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1
    }
  }
  return dp[amount]
}

export function coinChangeWays(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(0)
  dp[0] = 1
  for (const c of coins) {
    for (let a = c; a <= amount; a++) dp[a] += dp[a - c]
  }
  return dp[amount]
}

export function knapsack01(weights: number[], values: number[], capacity: number): number {
  const n = weights.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let c = 0; c <= capacity; c++) {
      dp[i][c] = dp[i - 1][c]
      if (weights[i - 1] <= c) {
        dp[i][c] = Math.max(dp[i][c], values[i - 1] + dp[i - 1][c - weights[i - 1]])
      }
    }
  }
  return dp[n][capacity]
}

export function fractionalKnapsack(weights: number[], values: number[], capacity: number): number {
  const items = weights.map((w, i) => ({ w, v: values[i], r: values[i] / w }))
  items.sort((a, b) => b.r - a.r)
  let remaining = capacity
  let total = 0
  for (const it of items) {
    if (remaining <= 0) break
    const take = Math.min(it.w, remaining)
    total += take * it.r
    remaining -= take
  }
  return Math.round(total * 100) / 100
}

export function matrixChainCost(dims: number[]): number {
  const n = dims.length - 1
  const m: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      m[i][j] = Infinity
      for (let k = i; k < j; k++) {
        const cost = m[i][k] + m[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
        if (cost < m[i][j]) m[i][j] = cost
      }
    }
  }
  return m[0][n - 1]
}

export function lcsLength(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

export function editDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

export function assemblyLine(a: number[][], t: number[][], entry: number[], exit: number[]): number {
  const n = a[0].length
  const f: number[][] = [new Array(n).fill(0), new Array(n).fill(0)]
  f[0][0] = entry[0] + a[0][0]
  f[1][0] = entry[1] + a[1][0]
  for (let j = 1; j < n; j++) {
    f[0][j] = Math.min(f[0][j - 1] + a[0][j], f[1][j - 1] + t[1][j] + a[0][j])
    f[1][j] = Math.min(f[1][j - 1] + a[1][j], f[0][j - 1] + t[0][j] + a[1][j])
  }
  return Math.min(f[0][n - 1] + exit[0], f[1][n - 1] + exit[1])
}

export function activitySelection(intervals: [number, number][]): number {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1])
  let count = 0
  let lastEnd = -Infinity
  for (const [s, e] of sorted) {
    if (s >= lastEnd) {
      count++
      lastEnd = e
    }
  }
  return count
}

export function jobSequencing(profits: number[], deadlines: number[]): number {
  const jobs = profits.map((p, i) => ({ p, d: deadlines[i] })).sort((a, b) => b.p - a.p)
  const maxD = Math.max(...deadlines)
  const slot = new Array(maxD + 1).fill(false)
  let total = 0
  for (const job of jobs) {
    for (let d = Math.min(job.d, maxD); d >= 1; d--) {
      if (!slot[d]) {
        slot[d] = true
        total += job.p
        break
      }
    }
  }
  return total
}

export function huffmanCost(freqs: number[]): number {
  const heap = [...freqs].sort((a, b) => a - b)
  let cost = 0
  while (heap.length > 1) {
    const a = heap.shift()!
    const b = heap.shift()!
    const merged = a + b
    cost += merged
    let i = 0
    while (i < heap.length && heap[i] < merged) i++
    heap.splice(i, 0, merged)
  }
  return cost
}

export function nQueensCount(n: number): number {
  let count = 0
  const cols = new Array(n).fill(false)
  const d1 = new Array(2 * n).fill(false)
  const d2 = new Array(2 * n).fill(false)
  const place = (row: number) => {
    if (row === n) {
      count++
      return
    }
    for (let c = 0; c < n; c++) {
      if (cols[c] || d1[row - c + n] || d2[row + c]) continue
      cols[c] = d1[row - c + n] = d2[row + c] = true
      place(row + 1)
      cols[c] = d1[row - c + n] = d2[row + c] = false
    }
  }
  place(0)
  return count
}

export function subsetSumCount(weights: number[], target: number): number {
  let count = 0
  const go = (i: number, sum: number) => {
    if (sum === target) {
      count++
      return
    }
    if (i >= weights.length || sum > target) return
    go(i + 1, sum + weights[i])
    go(i + 1, sum)
  }
  go(0, 0)
  return count
}

export function hamiltonianCycles(n: number, edges: Edge[]): number {
  const adj = adjacency(n, edges)
  const seen = new Array(n).fill(false)
  let count = 0
  const go = (u: number, depth: number) => {
    if (depth === n) {
      if (adj[u].includes(0)) count++
      return
    }
    for (const v of adj[u]) {
      if (!seen[v]) {
        seen[v] = true
        go(v, depth + 1)
        seen[v] = false
      }
    }
  }
  seen[0] = true
  go(0, 1)
  return count
}

export function chromaticNumber(n: number, edges: Edge[]): number {
  const adj = adjacency(n, edges)
  const color = new Array(n).fill(0)
  let best = n
  const canColor = (v: number, c: number) => adj[v].every((u) => color[u] !== c)
  const go = (v: number, used: number) => {
    if (used >= best) return
    if (v === n) {
      best = used
      return
    }
    for (let c = 1; c <= used + 1; c++) {
      if (canColor(v, c)) {
        color[v] = c
        go(v + 1, Math.max(used, c))
        color[v] = 0
      }
    }
  }
  go(0, 0)
  return best
}

export function firstFitDecreasing(items: number[], capacity: number): number {
  const sorted = [...items].sort((a, b) => b - a)
  const bins: number[] = []
  for (const it of sorted) {
    let placed = false
    for (let i = 0; i < bins.length; i++) {
      if (bins[i] + it <= capacity) {
        bins[i] += it
        placed = true
        break
      }
    }
    if (!placed) bins.push(it)
  }
  return bins.length
}

export function nextFit(items: number[], capacity: number): number {
  let bins = 1
  let current = 0
  for (const it of items) {
    if (current + it <= capacity) current += it
    else {
      bins++
      current = it
    }
  }
  return items.length ? bins : 0
}

export function subsetSumDP(weights: number[], target: number): boolean {
  const dp = new Array(target + 1).fill(false)
  dp[0] = true
  for (const w of weights) {
    for (let s = target; s >= w; s--) if (dp[s - w]) dp[s] = true
  }
  return dp[target]
}

export function greedyCoinCount(coins: number[], amount: number): number {
  const sorted = [...coins].sort((a, b) => b - a)
  let remaining = amount
  let count = 0
  for (const c of sorted) {
    while (remaining >= c) {
      remaining -= c
      count++
    }
  }
  return remaining === 0 ? count : -1
}

export function masterCase(a: number, b: number, fPower: number): 1 | 2 | 3 {
  const critical = Math.log(a) / Math.log(b)
  if (fPower < critical - 1e-9) return 1
  if (Math.abs(fPower - critical) < 1e-9) return 2
  return 3
}

export function nthCatalan(n: number): number {
  let result = 1
  for (let i = 0; i < n; i++) result = (result * 2 * (2 * i + 1)) / (i + 2)
  return Math.round(result)
}

export function numComparisonsMergeSortWorst(n: number): number {
  const p = Math.ceil(Math.log2(Math.max(n, 1)))
  return n * p - Math.pow(2, p) + 1
}

export function factorial(n: number): number {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

export function toBase(n: number, base: number): string {
  return n.toString(base).toUpperCase()
}

export function powerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

export function heapChildren(i: number): [number, number] {
  return [2 * i + 1, 2 * i + 2]
}

export function heapParent(i: number): number {
  return Math.floor((i - 1) / 2)
}

export function heapHeight(n: number): number {
  return Math.floor(Math.log2(Math.max(n, 1)))
}

export function medianOfMediansSplit(n: number): number {
  return Math.floor(n / 10)
}
