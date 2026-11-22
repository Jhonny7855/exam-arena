export type Sym = string

export interface DFA {
  states: string[]
  alphabet: Sym[]
  start: string
  finals: string[]
  delta: Record<string, Record<Sym, string>>
}

export interface NFA {
  states: string[]
  alphabet: Sym[]
  start: string
  finals: string[]
  delta: Record<string, Record<Sym, string[]>>
  eps: Record<string, string[]>
}

export function runDFA(dfa: DFA, input: string): { accepted: boolean; path: string[] } {
  let cur = dfa.start
  const path = [cur]
  for (const ch of input) {
    const row = dfa.delta[cur]
    const next = row?.[ch]
    if (next === undefined) return { accepted: false, path }
    cur = next
    path.push(cur)
  }
  return { accepted: dfa.finals.includes(cur), path }
}

export function countAcceptedDFA(dfa: DFA, length: number): number {
  let counts: Record<string, number> = {}
  for (const s of dfa.states) counts[s] = 0
  counts[dfa.start] = 1
  for (let i = 0; i < length; i++) {
    const next: Record<string, number> = {}
    for (const s of dfa.states) next[s] = 0
    for (const s of dfa.states) {
      const c = counts[s]
      if (!c) continue
      for (const a of dfa.alphabet) {
        const t = dfa.delta[s]?.[a]
        if (t !== undefined) next[t] += c
      }
    }
    counts = next
  }
  return dfa.finals.reduce((sum, f) => sum + (counts[f] ?? 0), 0)
}

export function allStrings(alphabet: string[], maxLen: number): string[] {
  const out: string[] = ['']
  let frontier = ['']
  for (let len = 1; len <= maxLen; len++) {
    const next: string[] = []
    for (const s of frontier) for (const a of alphabet) next.push(s + a)
    out.push(...next)
    frontier = next
  }
  return out
}

export function epsClosure(nfa: NFA, states: Iterable<string>): Set<string> {
  const result = new Set<string>()
  const stack = [...states]
  while (stack.length) {
    const s = stack.pop()!
    if (result.has(s)) continue
    result.add(s)
    for (const t of nfa.eps[s] ?? []) if (!result.has(t)) stack.push(t)
  }
  return result
}

export function moveSet(nfa: NFA, states: Iterable<string>, symbol: string): Set<string> {
  const out = new Set<string>()
  for (const s of states) {
    for (const t of nfa.delta[s]?.[symbol] ?? []) out.add(t)
  }
  return out
}

export function runNFA(nfa: NFA, input: string): { accepted: boolean; endStates: string[] } {
  let current = epsClosure(nfa, [nfa.start])
  for (const ch of input) {
    const moved = moveSet(nfa, current, ch)
    current = epsClosure(nfa, moved)
    if (current.size === 0) return { accepted: false, endStates: [] }
  }
  const endStates = [...current].sort()
  return { accepted: endStates.some((s) => nfa.finals.includes(s)), endStates }
}

export function subsetConstruction(nfa: NFA): DFA {
  const startSet = epsClosure(nfa, [nfa.start])
  const key = (s: Set<string>) => [...s].sort().join(',') || '∅'
  const index = new Map<string, Set<string>>()
  const queue: Set<string>[] = [startSet]
  index.set(key(startSet), startSet)
  const transitions: Record<string, Record<string, string>> = {}
  const finals: string[] = []
  const order: string[] = []

  while (queue.length) {
    const set = queue.shift()!
    const k = key(set)
    order.push(k)
    if ([...set].some((s) => nfa.finals.includes(s))) finals.push(k)
    transitions[k] = {}
    for (const a of nfa.alphabet) {
      const moved = epsClosure(nfa, moveSet(nfa, set, a))
      const mk = key(moved)
      transitions[k][a] = mk
      if (!index.has(mk)) {
        index.set(mk, moved)
        queue.push(moved)
      }
    }
  }

  return {
    states: order,
    alphabet: nfa.alphabet,
    start: key(startSet),
    finals,
    delta: transitions,
  }
}

export function reachableStates(dfa: DFA): Set<string> {
  const seen = new Set<string>([dfa.start])
  const stack = [dfa.start]
  while (stack.length) {
    const s = stack.pop()!
    for (const a of dfa.alphabet) {
      const t = dfa.delta[s]?.[a]
      if (t !== undefined && !seen.has(t)) {
        seen.add(t)
        stack.push(t)
      }
    }
  }
  return seen
}

export function minimizeDFA(dfa: DFA): DFA {
  const reachable = reachableStates(dfa)
  const states = dfa.states.filter((s) => reachable.has(s))
  const finals = states.filter((s) => dfa.finals.includes(s))
  const nonFinals = states.filter((s) => !dfa.finals.includes(s))

  let classes: string[][] = []
  if (finals.length) classes.push(finals)
  if (nonFinals.length) classes.push(nonFinals)

  const classOf = (s: string) => classes.findIndex((c) => c.includes(s))

  let changed = true
  while (changed) {
    changed = false
    const next: string[][] = []
    for (const group of classes) {
      const buckets = new Map<string, string[]>()
      for (const s of group) {
        const signature = dfa.alphabet
          .map((a) => {
            const t = dfa.delta[s]?.[a]
            return t === undefined ? '-' : String(classOf(t))
          })
          .join('|')
        const list = buckets.get(signature) ?? []
        list.push(s)
        buckets.set(signature, list)
      }
      if (buckets.size > 1) changed = true
      for (const list of buckets.values()) next.push(list)
    }
    classes = next
  }

  const label = (group: string[]) => group.slice().sort().join('+')
  const newStates = classes.map(label)
  const startClass = classes.find((c) => c.includes(dfa.start))!
  const newFinals = classes.filter((c) => c.some((s) => dfa.finals.includes(s))).map(label)
  const delta: Record<string, Record<string, string>> = {}
  for (const group of classes) {
    const rep = group[0]
    delta[label(group)] = {}
    for (const a of dfa.alphabet) {
      const t = dfa.delta[rep]?.[a]
      if (t !== undefined) {
        const target = classes.find((c) => c.includes(t))!
        delta[label(group)][a] = label(target)
      }
    }
  }

  return {
    states: newStates,
    alphabet: dfa.alphabet,
    start: label(startClass),
    finals: newFinals,
    delta,
  }
}

export type RegexNode =
  | { type: 'empty' }
  | { type: 'eps' }
  | { type: 'sym'; value: string }
  | { type: 'cat'; left: RegexNode; right: RegexNode }
  | { type: 'alt'; left: RegexNode; right: RegexNode }
  | { type: 'star'; node: RegexNode }

let regexStateCounter = 0

function newNodeId(prefix: string): string {
  regexStateCounter += 1
  return `${prefix}${regexStateCounter}`
}

export function regexToNFA(node: RegexNode, alphabet: string[]): NFA {
  const states: string[] = []
  const delta: Record<string, Record<string, string[]>> = {}
  const eps: Record<string, string[]> = {}

  const addState = (prefix: string) => {
    const id = newNodeId(prefix)
    states.push(id)
    delta[id] = {}
    eps[id] = []
    return id
  }

  const addEdge = (from: string, symbol: string, to: string) => {
    delta[from][symbol] = [...(delta[from][symbol] ?? []), to]
  }

  const addEps = (from: string, to: string) => {
    eps[from] = [...(eps[from] ?? []), to]
  }

  const build = (n: RegexNode): { start: string; end: string } => {
    switch (n.type) {
      case 'eps': {
        const s = addState('e')
        const e = addState('e')
        addEps(s, e)
        return { start: s, end: e }
      }
      case 'empty': {
        const s = addState('x')
        const e = addState('x')
        return { start: s, end: e }
      }
      case 'sym': {
        const s = addState('s')
        const e = addState('s')
        addEdge(s, n.value, e)
        return { start: s, end: e }
      }
      case 'cat': {
        const l = build(n.left)
        const r = build(n.right)
        addEps(l.end, r.start)
        return { start: l.start, end: r.end }
      }
      case 'alt': {
        const s = addState('a')
        const e = addState('a')
        const l = build(n.left)
        const r = build(n.right)
        addEps(s, l.start)
        addEps(s, r.start)
        addEps(l.end, e)
        addEps(r.end, e)
        return { start: s, end: e }
      }
      case 'star': {
        const s = addState('k')
        const e = addState('k')
        const inner = build(n.node)
        addEps(s, e)
        addEps(s, inner.start)
        addEps(inner.end, inner.start)
        addEps(inner.end, e)
        return { start: s, end: e }
      }
    }
  }

  const { start, end } = build(node)
  return { states, alphabet, start, finals: [end], delta, eps }
}

export const sym = (value: string): RegexNode => ({ type: 'sym', value })
export const eps = (): RegexNode => ({ type: 'eps' })
export const cat = (...nodes: RegexNode[]): RegexNode =>
  nodes.reduce((acc, n) => ({ type: 'cat', left: acc, right: n }))
export const alt = (...nodes: RegexNode[]): RegexNode =>
  nodes.slice(1).reduce((acc, n) => ({ type: 'alt', left: acc, right: n }), nodes[0])
export const star = (node: RegexNode): RegexNode => ({ type: 'star', node })

export function regexAccepts(node: RegexNode, alphabet: string[], input: string): boolean {
  const nfa = regexToNFA(node, alphabet)
  return runNFA(nfa, input).accepted
}

export interface CnfGrammar {
  start: string
  variables: string[]
  terminals: string[]
  rules: { from: string; to: string[] }[]
}

export function cykAccepts(grammar: CnfGrammar, input: string): boolean {
  const n = input.length
  const allowsEps = grammar.rules.some((r) => r.from === grammar.start && r.to.length === 0)
  if (n === 0) return allowsEps

  const table: Set<string>[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => new Set<string>()))

  for (let i = 0; i < n; i++) {
    for (const rule of grammar.rules) {
      if (rule.to.length === 1 && rule.to[0] === input[i]) table[i][i].add(rule.from)
    }
  }

  for (let span = 2; span <= n; span++) {
    for (let i = 0; i + span - 1 < n; i++) {
      const j = i + span - 1
      for (let k = i; k < j; k++) {
        for (const rule of grammar.rules) {
          if (rule.to.length !== 2) continue
          const [b, c] = rule.to
          if (table[i][k].has(b) && table[k + 1][j].has(c)) table[i][j].add(rule.from)
        }
      }
    }
  }

  return table[0][n - 1].has(grammar.start)
}

export interface TM {
  states: string[]
  tapeAlphabet: string[]
  blank: string
  start: string
  accept: string
  reject: string
  delta: Record<string, Record<string, { write: string; move: 'L' | 'R'; next: string }>>
}

export interface TMResult {
  halted: boolean
  accepted: boolean
  tape: string
  head: number
  state: string
  steps: number
  trace: { state: string; head: number; tape: string }[]
}

export function runTM(tm: TM, input: string, maxSteps = 400): TMResult {
  const tape = new Map<number, string>()
  for (let i = 0; i < input.length; i++) tape.set(i, input[i])
  let head = 0
  let state = tm.start
  let steps = 0
  const trace: { state: string; head: number; tape: string }[] = []

  const snapshot = () => {
    const positions = [...tape.keys()]
    const lo = Math.min(0, head, ...positions)
    const hi = Math.max(0, head, ...positions)
    let s = ''
    for (let i = lo; i <= hi; i++) s += tape.get(i) ?? tm.blank
    return s
  }

  while (steps < maxSteps) {
    trace.push({ state, head, tape: snapshot() })
    if (state === tm.accept) {
      return { halted: true, accepted: true, tape: snapshot(), head, state, steps, trace }
    }
    if (state === tm.reject) {
      return { halted: true, accepted: false, tape: snapshot(), head, state, steps, trace }
    }
    const symbol = tape.get(head) ?? tm.blank
    const move = tm.delta[state]?.[symbol]
    if (!move) {
      return { halted: true, accepted: false, tape: snapshot(), head, state, steps, trace }
    }
    tape.set(head, move.write)
    head += move.move === 'R' ? 1 : -1
    state = move.next
    steps += 1
  }

  return { halted: false, accepted: false, tape: snapshot(), head, state, steps, trace }
}

export interface PDA {
  states: string[]
  inputAlphabet: string[]
  stackAlphabet: string[]
  start: string
  startStack: string
  finals: string[]
  delta: Record<string, Record<string, Record<string, { next: string; replace: string[] }[]>>>
}

export interface PDAConfig {
  state: string
  inputIndex: number
  stack: string[]
}

export function runPDA(pda: PDA, input: string, maxSteps = 400): { accepted: boolean; endStack: string[] | null } {
  const key = (c: PDAConfig) => `${c.state}|${c.inputIndex}|${c.stack.join('')}`
  const startStack = [pda.startStack]
  const queue: PDAConfig[] = [{ state: pda.start, inputIndex: 0, stack: startStack }]
  const seen = new Set<string>([key(queue[0])])
  let steps = 0
  let fallback: string[] | null = null

  while (queue.length && steps < maxSteps) {
    const cfg = queue.shift()!
    steps += 1
    const top = cfg.stack[cfg.stack.length - 1] ?? pda.startStack

    if (cfg.inputIndex === input.length && pda.finals.includes(cfg.state)) {
      return { accepted: true, endStack: cfg.stack }
    }

    const transitions: { symbol: string | null; next: string; replace: string[] }[] = []
    const row = pda.delta[cfg.state]?.[top]
    if (row) {
      for (const [symbol, moves] of Object.entries(row)) {
        for (const m of moves) transitions.push({ symbol: symbol === 'ε' ? null : symbol, next: m.next, replace: m.replace })
      }
    }

    for (const t of transitions) {
      if (t.symbol !== null) {
        if (cfg.inputIndex >= input.length) continue
        if (input[cfg.inputIndex] !== t.symbol) continue
      }
      const stack = cfg.stack.slice(0, -1)
      for (let i = t.replace.length - 1; i >= 0; i--) stack.push(t.replace[i])
      const nextCfg: PDAConfig = {
        state: t.next,
        inputIndex: cfg.inputIndex + (t.symbol === null ? 0 : 1),
        stack,
      }
      const k = key(nextCfg)
      if (!seen.has(k)) {
        seen.add(k)
        queue.push(nextCfg)
      }
    }

    if (cfg.inputIndex === input.length && !fallback) fallback = cfg.stack
  }

  return { accepted: false, endStack: fallback }
}

export function fmtSet(states: string[]): string {
  if (states.length === 0) return '∅'
  return `{${[...states].sort().join(', ')}}`
}

export function fmtStack(stack: string[]): string {
  return stack.length ? stack.join('') : 'ε'
}
