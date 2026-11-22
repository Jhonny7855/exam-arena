import type { SubjectId } from '../types'

export interface FormulaCard {
  label: string
  formula: string
  note: string
}

export interface CheatSection {
  unit: number
  title: string
  accent: string
  formulas: FormulaCard[]
  traps: string[]
}

export const CHEATSHEET_BY_SUBJECT: Record<SubjectId, CheatSection[]> = {
  tafl: [
    {
      unit: 1,
      title: 'Preliminaries',
      accent: '#4f7cff',
      formulas: [
        { label: 'Power set', formula: '|P(A)| = 2^|A|', note: 'Source of the 2^n bound in subset construction.' },
        { label: 'De Morgan', formula: '(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ   ·   (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ', note: 'Both directions hold; they are not one-way implications.' },
        { label: 'Implication', formula: 'P → Q ≡ ¬P ∨ Q ≡ ¬Q → ¬P', note: 'Converse Q → P and inverse ¬P → ¬Q are not equivalent.' },
        { label: 'Quantifier negation', formula: '¬∀x P(x) ≡ ∃x ¬P(x)   ·   ¬∃x P(x) ≡ ∀x ¬P(x)', note: 'Negate inward one quantifier at a time.' },
        { label: 'Equivalence relation', formula: 'reflexive ∧ symmetric ∧ transitive', note: 'Induces a partition of the set, and vice versa.' },
        { label: 'Injective', formula: 'f(a) = f(b) ⇒ a = b', note: 'Surjectivity depends on the declared codomain.' },
        { label: 'Weak induction', formula: 'P(0) ∧ (P(n) → P(n+1)) ⇒ ∀n P(n)', note: 'Strong form allows the hypothesis P(0..n).' },
      ],
      traps: [
        'Empty set is a subset of every set, but is an element only of sets that contain ∅.',
        'A relation that is both symmetric and antisymmetric is a subset of the identity relation.',
        'Skipping the base case invalidates an induction proof entirely.',
      ],
    },
    {
      unit: 2,
      title: 'Regular Languages',
      accent: '#8b5cf6',
      formulas: [
        { label: 'Strings of length n', formula: '|Σ| = k ⇒ exactly k^n strings', note: 'So Σ* is countably infinite for any finite alphabet.' },
        { label: 'Reversal', formula: '(xy)^R = y^R x^R', note: 'Order swaps; this trips people on concatenation of three or more.' },
        { label: 'Kleene star', formula: 'L* = ∪_{i≥0} L^i = {ε} ∪ L+', note: 'ε ∈ L* for every L, even when ε ∉ L.' },
        { label: 'Star identities', formula: '∅* = {ε}   ·   ε* = {ε}   ·   (L*)* = L*', note: '(L1 ∪ L2)* need not equal L1* ∪ L2*.' },
        { label: 'All strings over {a,b}', formula: '(a*b*)* = (a ∪ b)*', note: 'Classic equivalence asked in exams.' },
        { label: 'Pumping lemma (RL)', formula: 'w = xyz, |xy| ≤ n, |y| ≥ 1, xy^i z ∈ L ∀i ≥ 0', note: 'Necessary, not sufficient. Passing never proves regularity.' },
        { label: 'Closure', formula: 'union, ∩, complement, concat, star, reversal, homomorphism', note: 'Regular languages are closed under all of these.' },
      ],
      traps: [
        '{ε} ≠ ∅ — the first holds one string, the second holds none.',
        'In a pumping proof you cannot choose the decomposition; you must defeat every valid split.',
        'Concatenation binds tighter than union: a ∪ bc means a ∪ (bc).',
      ],
    },
    {
      unit: 3,
      title: 'Finite State Machines',
      accent: '#22d3ee',
      formulas: [
        { label: 'DFA tuple', formula: 'M = (Q, Σ, δ, q₀, F)', note: 'δ: Q × Σ → Q must be total; add a dead state if needed.' },
        { label: 'NFA transition', formula: 'δ ⊆ Q × (Σ ∪ {ε}) × Q', note: 'Accepts if some run ends in F — existential, not universal.' },
        { label: 'ε-closure', formula: 'ε-closure(q) ∋ q, transitively closed under ε-moves', note: 'Always close again after consuming a symbol.' },
        { label: 'Subset construction bound', formula: 'at most 2^n DFA states', note: 'Only reachable subsets matter in practice; bound is tight for some languages.' },
        { label: 'Subset acceptance', formula: 'S is final iff S ∩ F ≠ ∅', note: 'One final member is enough — not all of them.' },
        { label: 'Thompson construction', formula: '≤ 2·|r| states, single start and single final', note: 'Star adds an ε-loop back to the split point.' },
        { label: 'Minimisation', formula: 'split final/non-final, refine until stable', note: 'Minimal DFA is unique up to isomorphism — a language invariant.' },
      ],
      traps: [
        'NFAs are not more powerful than DFAs, only more succinct.',
        'Marking a subset final only when all members are final drops accepted strings.',
        'Mealy output appears one step earlier than Moore output; account for the initial Moore symbol.',
      ],
    },
    {
      unit: 4,
      title: 'Context Free Grammar',
      accent: '#34d399',
      formulas: [
        { label: 'CFG tuple', formula: 'G = (V, T, P, S)', note: 'Every production has exactly one variable on the left.' },
        { label: 'Language', formula: 'L(G) = {w ∈ T* : S ⇒* w}', note: 'Derivation replaces one variable per step.' },
        { label: 'Ambiguity', formula: 'two distinct parse trees ⇒ ambiguous', note: 'Different derivation orders are not ambiguity.' },
        { label: 'Chomsky Normal Form', formula: 'A → BC   |   A → a   (plus S → ε if needed)', note: 'Reintroduce S → ε after eliminating ε-productions.' },
        { label: 'CNF derivation length', formula: '|w| = n ⇒ exactly 2n − 1 steps', note: 'Basis for CYK parsing complexity.' },
        { label: 'Greibach Normal Form', formula: 'A → aα, α ∈ V*', note: 'Each step consumes exactly one terminal.' },
        { label: 'CFL closure', formula: 'closed: ∪, concat, star, reversal, homomorphism, ∩ with regular', note: 'Not closed under ∩ or complement.' },
      ],
      traps: [
        'Inherent ambiguity is a property of the language, not a fixable grammar defect.',
        'E → E + E | E * E | id is ambiguous and encodes no precedence.',
        'a^n b^n c^n disproves closure under intersection.',
      ],
    },
    {
      unit: 5,
      title: 'Push Down Automata',
      accent: '#f59e0b',
      formulas: [
        { label: 'PDA tuple', formula: 'P = (Q, Σ, Γ, δ, q₀, Z₀, F)', note: 'Only the top of the stack is visible.' },
        { label: 'Move notation', formula: '(q, aw, Zα) ⊢ (p, w, γα) for δ(q,a,Z) ∋ (p, γ)', note: 'γ is written with the new top symbol leftmost.' },
        { label: 'Push order', formula: 'to push A then B, write BA as γ', note: 'Reversing this silently changes the language.' },
        { label: 'Acceptance modes', formula: 'final state ⇔ empty stack', note: 'The two modes define the same language class.' },
        { label: 'Deterministic PDA', formula: 'at most one move; no ε-move competing with a symbol move', note: 'DCFL ⊂ CFL; wcw^R is deterministic, ww^R is not.' },
        { label: 'CFG → PDA', formula: 'one state, push start symbol, expand by reversed RHS', note: 'Stack holds the remaining sentential form.' },
        { label: 'Pumping lemma (CFL)', formula: 'w = uvxyz, |vxy| ≤ p, |vy| ≥ 1, uv^i xy^i z ∈ L', note: 'v and y are pumped together, never independently.' },
      ],
      traps: [
        'A PDA cannot inspect the whole stack — only the top symbol.',
        'Mixing final-state and empty-stack acceptance without clearing the stack accepts too much.',
        'ww^R has no DPDA; nondeterminism is essential there.',
      ],
    },
    {
      unit: 6,
      title: 'Turing Machine and REL',
      accent: '#f472b6',
      formulas: [
        { label: 'TM tuple', formula: 'M = (Q, Σ, Γ, δ, q₀, q_accept, q_reject)', note: 'Tape is infinite to the right; blank B fills unused cells.' },
        { label: 'Transition', formula: 'δ: Q × Γ → Q × Γ × {L, R}', note: 'Read, write, move, change state — one step.' },
        { label: 'Variants', formula: 'multi-tape ≡ multitrack ≡ 2-way ≡ nondeterministic', note: 'Same language class; only simulation overhead differs.' },
        { label: 'Universal TM', formula: 'U(⟨M, w⟩) simulates M on w', note: 'Loops whenever M loops — it does not decide halting.' },
        { label: 'Language classes', formula: 'Recursive ⊂ RE (strict)', note: 'L recursive iff both L and L̄ are RE.' },
        { label: 'Halting problem', formula: 'H = {⟨M,w⟩ : M halts on w} is RE but not recursive', note: 'Complement of H is not RE at all.' },
        { label: 'Rice\'s theorem', formula: 'every non-trivial semantic property is undecidable', note: 'Applies to properties of the language, not the machine code.' },
      ],
      traps: [
        'A TM need not halt; partial functions are the natural output model.',
        'The Church-Turing thesis is a thesis, not a theorem.',
        '"Recognisable" is weaker than "decidable" — recognition permits looping.',
      ],
    },
    {
      unit: 7,
      title: 'Computability',
      accent: '#a3e635',
      formulas: [
        { label: 'Partial vs total', formula: 'dom(f) = inputs where the machine halts', note: 'Total computable = machine that always halts.' },
        { label: 'Primitive recursive', formula: 'zero, successor, projections + composition + recursion', note: 'Always terminate; Ackermann is computable but not primitive recursive.' },
        { label: 'Reduction transfer', formula: 'A ≤ B and A undecidable ⇒ B undecidable', note: 'Direction matters — this is the most common error.' },
        { label: 'P and NP', formula: 'P ⊆ NP', note: 'NP = nondeterministic polynomial, not "not polynomial".' },
        { label: 'NP-complete', formula: 'X ∈ NP ∧ every NP problem ≤p X', note: 'Cook-Levin: SAT is the first NP-complete problem.' },
        { label: 'Proving NP-complete', formula: 'show X ∈ NP, then reduce known NP-complete → X', note: 'Reducing X to a known problem proves nothing about X.' },
        { label: 'Reduction consequences', formula: 'A ≤p B ∧ B ∈ P ⇒ A ∈ P', note: 'Reductions must run in polynomial time.' },
      ],
      traps: [
        'Reversing the reduction direction is the single most common NP-completeness mistake.',
        'NP-hard problems need not be in NP, or even decidable.',
        'Equivalence of CFGs is decidable; ambiguity of CFGs is not.',
      ],
    },
  ],
  daa: [
    {
      unit: 1,
      title: 'Introduction & Analysis',
      accent: '#f59e0b',
      formulas: [
        { label: 'Big-O', formula: 'f(n) = O(g(n)) ⇔ ∃c>0, n₀ : f(n) ≤ c·g(n) ∀n ≥ n₀', note: 'Upper bound only; O(1) is also O(n²).' },
        { label: 'Theta', formula: 'Θ(g) = O(g) ∩ Ω(g)', note: 'Use Θ when you mean the tight order.' },
        { label: 'Growth order', formula: '1 ≺ log log n ≺ log n ≺ √n ≺ n ≺ n log n ≺ n² ≺ n³ ≺ 2ⁿ ≺ n! ≺ nⁿ', note: 'Any exponential eventually beats any polynomial.' },
        { label: 'Master theorem', formula: 'T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a)', note: 'Case 1: Θ(n^(log_b a)); Case 2: ×log n; Case 3: Θ(f(n)) if regular.' },
        { label: 'Merge sort', formula: 'T(n) = 2T(n/2) + Θ(n) = Θ(n log n)', note: 'Master theorem case 2.' },
        { label: 'Binary search', formula: 'T(n) = T(n/2) + Θ(1) = Θ(log n)', note: 'Requires a sorted array.' },
        { label: 'Log base', formula: 'log_b n = log_2 n / log_2 b', note: 'Base changes are constant factors, invisible asymptotically.' },
      ],
      traps: [
        'Master theorem fails when f(n) is not polynomially comparable, e.g. f(n) = n log n vs n.',
        'Quoting a best-case bound as the algorithm complexity.',
        'Recursion space includes call-stack depth.',
      ],
    },
    {
      unit: 2,
      title: 'Divide and Conquer',
      accent: '#ef4444',
      formulas: [
        { label: 'Paradigm recurrence', formula: 'T(n) = aT(n/b) + C(n)', note: 'Subproblems must be the same type and non-overlapping.' },
        { label: 'Merge sort', formula: 'Θ(n log n) always, Θ(n) auxiliary space, stable', note: 'Worst-case comparisons: n⌈log₂n⌉ − 2^⌈log₂n⌉ + 1.' },
        { label: 'Quick sort', formula: 'average Θ(n log n), worst Θ(n²)', note: 'Randomised or median-of-three pivots make the worst case improbable.' },
        { label: 'Comparison lower bound', formula: 'Ω(n log n) comparisons', note: 'Decision tree has n! leaves ⇒ height ≥ log₂(n!).' },
        { label: 'Heap sort', formula: 'Θ(n log n) worst, O(1) extra space, not stable', note: 'Build-heap is Θ(n), each of n extractions costs Θ(log n).' },
        { label: 'Heap indexing (0-based)', formula: 'children of i are 2i+1 and 2i+2', note: 'Parent of i is ⌊(i−1)/2⌋.' },
        { label: 'Elementary sorts', formula: 'bubble, selection, insertion all Θ(n²) worst', note: 'Selection sort always does exactly n(n−1)/2 comparisons.' },
        { label: 'Simultaneous max-min', formula: '≈ 3n/2 − 2 comparisons', note: 'Naive double scan costs 2n − 2.' },
      ],
      traps: [
        'Quick sort worst case is quadratic, never n log n.',
        'The n log n lower bound does not apply to radix or counting sort.',
        'Heap sort is not stable.',
      ],
    },
    {
      unit: 3,
      title: 'Dynamic Programming',
      accent: '#22c55e',
      formulas: [
        { label: 'DP preconditions', formula: 'optimal substructure ∧ overlapping subproblems', note: 'Independent subproblems means divide and conquer.' },
        { label: 'Coin change', formula: 'C(A) = 1 + min{C(A − dᵢ)}', note: 'Θ(nA) time; greedy is optimal only for canonical systems.' },
        { label: '0/1 knapsack', formula: 'V(i,c) = max(V(i−1,c), vᵢ + V(i−1, c−wᵢ))', note: 'Θ(nW), pseudo-polynomial because W appears in the runtime.' },
        { label: 'Unbounded knapsack', formula: 'iterate capacity upward and allow V(i, c−wᵢ)', note: 'Using the 0/1 recurrence here is a classic error.' },
        { label: 'Matrix chain', formula: 'm[i,j] = min_k { m[i,k] + m[k+1,j] + pᵢ₋₁pₖpⱼ }', note: 'Θ(n³), filled by increasing chain length.' },
        { label: 'LCS', formula: 'xᵢ = yⱼ ⇒ L(i,j) = L(i−1,j−1)+1, else max(L(i−1,j), L(i,j−1))', note: 'Θ(mn); subsequence need not be contiguous.' },
        { label: 'Assembly line', formula: 'f₁[j] = min(f₁[j−1] + a₁ⱼ, f₂[j−1] + t₂ⱼ + a₁ⱼ)', note: 'Add the exit cost at the end.' },
        { label: 'Parenthesations', formula: 'Catalan number C(n−1) for n matrices', note: 'DP explores them in Θ(n³) rather than exponentially.' },
      ],
      traps: [
        'Confusing longest common subsequence with longest common substring.',
        'Greedy fails on 0/1 knapsack: {1,3,4} target 6 gives 4+1+1, DP gives 3+3.',
        'Optimal substructure must be proved, not assumed — longest simple path lacks it.',
      ],
    },
    {
      unit: 4,
      title: 'Greedy Method & Graphs',
      accent: '#8b5cf6',
      formulas: [
        { label: 'Greedy correctness', formula: 'greedy-choice property + optimal substructure', note: 'Usually established by an exchange argument.' },
        { label: 'Activity selection', formula: 'sort by finish time, take next compatible', note: 'Θ(n log n); sorting by start time or duration fails.' },
        { label: 'Fractional knapsack', formula: 'sort by value/weight, split the last item', note: 'Optimal because items are divisible.' },
        { label: 'Job sequencing', formula: 'sort by profit desc, place in latest free slot ≤ deadline', note: 'Earliest free slot can block a tighter deadline.' },
        { label: 'Huffman', formula: 'repeatedly merge two lowest frequencies', note: 'Θ(n log n) with a heap; ties give multiple optimal codes.' },
        { label: 'BFS / DFS', formula: 'both Θ(V + E)', note: 'BFS gives shortest paths in unweighted graphs only.' },
        { label: 'Dijkstra', formula: 'O((V + E) log V) with a binary heap', note: 'Requires non-negative weights.' },
        { label: 'Bellman-Ford', formula: 'Θ(VE), V−1 relaxation rounds', note: 'Handles negative weights and detects negative cycles in one extra pass.' },
        { label: 'Floyd-Warshall', formula: 'd[i][j] = min(d[i][j], d[i][k] + d[k][j])', note: 'Θ(V³); k must be the outermost loop.' },
        { label: 'MST', formula: 'Kruskal O(E log E) · Prim O(V²) dense', note: 'MST is not unique when edge weights tie.' },
      ],
      traps: [
        'Running Dijkstra with negative edge weights.',
        'Putting k innermost in Floyd-Warshall produces wrong answers.',
        'Greedy by value density fails on 0/1 knapsack.',
      ],
    },
    {
      unit: 5,
      title: 'Backtracking & Branch and Bound',
      accent: '#06b6d4',
      formulas: [
        { label: 'Backtracking', formula: 'depth-first over a state-space tree, undo on failure', note: 'One level per decision variable.' },
        { label: 'N-Queens', formula: 'solutions exist for all n except 2 and 3', note: 'n = 8 has 92 solutions, 12 up to symmetry.' },
        { label: 'Diagonal test', formula: 'row − col and row + col identify both diagonals', note: 'Boolean arrays give O(1) conflict checks.' },
        { label: 'Subset sum', formula: '2ⁿ leaves before pruning', note: 'Sort descending so the bound tightens sooner.' },
        { label: 'Graph colouring', formula: 'chromatic number = minimum colours', note: 'Greedy colouring may exceed the chromatic number.' },
        { label: 'Branch and bound', formula: 'bound must never underestimate the true completion cost', note: 'An optimistic invalid bound prunes the optimum.' },
        { label: 'TSP bound', formula: 'row + column reduction of the cost matrix', note: 'Christofides gives a 1.5-approximation for metric TSP.' },
        { label: 'Assignment', formula: 'Hungarian algorithm Θ(n³)', note: 'Row minima then column minima create zeros without changing the optimum.' },
      ],
      traps: [
        'Pruning only at complete leaves reduces backtracking to brute force.',
        'Forgetting the closing edge back to the start in Hamiltonian cycle checks.',
        'Branch and bound does not make TSP polynomial.',
      ],
    },
    {
      unit: 6,
      title: 'NP-Completeness & Approximation',
      accent: '#ec4899',
      formulas: [
        { label: 'P', formula: 'decidable by a deterministic algorithm in polynomial time', note: 'P ⊆ NP; equality is open.' },
        { label: 'NP', formula: 'yes-instances have a polynomial certificate verifiable in poly time', note: 'NP = nondeterministic polynomial time.' },
        { label: 'NP-hard', formula: 'every NP problem ≤p X', note: 'Need not be in NP or even decidable.' },
        { label: 'NP-complete', formula: 'X ∈ NP ∧ X is NP-hard', note: 'Cook-Levin: SAT is NP-complete.' },
        { label: 'Reduction', formula: 'A ≤p B ∧ B ∈ P ⇒ A ∈ P', note: 'Must run in polynomial time and preserve answers.' },
        { label: 'Vertex cover', formula: '2-approximation by maximal matching', note: 'Ratio measured against the optimum, not a baseline.' },
        { label: 'Metric TSP', formula: '1.5-approximation (Christofides)', note: 'General TSP has no constant-factor approximation unless P = NP.' },
        { label: 'Bin packing', formula: 'first-fit decreasing ≤ 11/9·OPT + 6/9', note: 'No algorithm beats 3/2 unless P = NP.' },
        { label: 'Selection', formula: 'quickselect expected Θ(n) · median-of-medians Θ(n) worst', note: 'Quickselect recurses into one side only.' },
        { label: 'Las Vegas vs Monte Carlo', formula: 'Las Vegas: always correct · Monte Carlo: may err', note: 'Miller-Rabin is Monte Carlo.' },
      ],
      traps: [
        'Reducing X to a known NP-complete problem and claiming X is hard — direction reversed.',
        'Proving X ∈ NP without the hardness reduction only shows membership.',
        'Weakly NP-complete problems are tractable when numeric values are small.',
      ],
    },
  ],
}
