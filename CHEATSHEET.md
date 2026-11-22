# EXAM ARENA — Cheatsheet

Every formula and trap below is mirrored inside the app at `/cheatsheet`.
Generated from `src/data/cheatsheet.ts` — run `npx vite-node scripts/export-cheatsheet.ts` after editing it.

## TAFL — Theory of Automata & Formal Languages

7 units · 49 formulas · 21 exam traps

### Unit 1 · Preliminaries

| Concept | Formula | Note |
| --- | --- | --- |
| Power set | `\|P(A)\| = 2^\|A\|` | Source of the 2^n bound in subset construction. |
| De Morgan | `(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ   ·   (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ` | Both directions hold; they are not one-way implications. |
| Implication | `P → Q ≡ ¬P ∨ Q ≡ ¬Q → ¬P` | Converse Q → P and inverse ¬P → ¬Q are not equivalent. |
| Quantifier negation | `¬∀x P(x) ≡ ∃x ¬P(x)   ·   ¬∃x P(x) ≡ ∀x ¬P(x)` | Negate inward one quantifier at a time. |
| Equivalence relation | `reflexive ∧ symmetric ∧ transitive` | Induces a partition of the set, and vice versa. |
| Injective | `f(a) = f(b) ⇒ a = b` | Surjectivity depends on the declared codomain. |
| Weak induction | `P(0) ∧ (P(n) → P(n+1)) ⇒ ∀n P(n)` | Strong form allows the hypothesis P(0..n). |

**Exam traps**

- Empty set is a subset of every set, but is an element only of sets that contain ∅.
- A relation that is both symmetric and antisymmetric is a subset of the identity relation.
- Skipping the base case invalidates an induction proof entirely.

### Unit 2 · Regular Languages

| Concept | Formula | Note |
| --- | --- | --- |
| Strings of length n | `\|Σ\| = k ⇒ exactly k^n strings` | So Σ* is countably infinite for any finite alphabet. |
| Reversal | `(xy)^R = y^R x^R` | Order swaps; this trips people on concatenation of three or more. |
| Kleene star | `L* = ∪_{i≥0} L^i = {ε} ∪ L+` | ε ∈ L* for every L, even when ε ∉ L. |
| Star identities | `∅* = {ε}   ·   ε* = {ε}   ·   (L*)* = L*` | (L1 ∪ L2)* need not equal L1* ∪ L2*. |
| All strings over {a,b} | `(a*b*)* = (a ∪ b)*` | Classic equivalence asked in exams. |
| Pumping lemma (RL) | `w = xyz, \|xy\| ≤ n, \|y\| ≥ 1, xy^i z ∈ L ∀i ≥ 0` | Necessary, not sufficient. Passing never proves regularity. |
| Closure | `union, ∩, complement, concat, star, reversal, homomorphism` | Regular languages are closed under all of these. |

**Exam traps**

- {ε} ≠ ∅ — the first holds one string, the second holds none.
- In a pumping proof you cannot choose the decomposition; you must defeat every valid split.
- Concatenation binds tighter than union: a ∪ bc means a ∪ (bc).

### Unit 3 · Finite State Machines

| Concept | Formula | Note |
| --- | --- | --- |
| DFA tuple | `M = (Q, Σ, δ, q₀, F)` | δ: Q × Σ → Q must be total; add a dead state if needed. |
| NFA transition | `δ ⊆ Q × (Σ ∪ {ε}) × Q` | Accepts if some run ends in F — existential, not universal. |
| ε-closure | `ε-closure(q) ∋ q, transitively closed under ε-moves` | Always close again after consuming a symbol. |
| Subset construction bound | `at most 2^n DFA states` | Only reachable subsets matter in practice; bound is tight for some languages. |
| Subset acceptance | `S is final iff S ∩ F ≠ ∅` | One final member is enough — not all of them. |
| Thompson construction | `≤ 2·\|r\| states, single start and single final` | Star adds an ε-loop back to the split point. |
| Minimisation | `split final/non-final, refine until stable` | Minimal DFA is unique up to isomorphism — a language invariant. |

**Exam traps**

- NFAs are not more powerful than DFAs, only more succinct.
- Marking a subset final only when all members are final drops accepted strings.
- Mealy output appears one step earlier than Moore output; account for the initial Moore symbol.

### Unit 4 · Context Free Grammar

| Concept | Formula | Note |
| --- | --- | --- |
| CFG tuple | `G = (V, T, P, S)` | Every production has exactly one variable on the left. |
| Language | `L(G) = {w ∈ T* : S ⇒* w}` | Derivation replaces one variable per step. |
| Ambiguity | `two distinct parse trees ⇒ ambiguous` | Different derivation orders are not ambiguity. |
| Chomsky Normal Form | `A → BC   \|   A → a   (plus S → ε if needed)` | Reintroduce S → ε after eliminating ε-productions. |
| CNF derivation length | `\|w\| = n ⇒ exactly 2n − 1 steps` | Basis for CYK parsing complexity. |
| Greibach Normal Form | `A → aα, α ∈ V*` | Each step consumes exactly one terminal. |
| CFL closure | `closed: ∪, concat, star, reversal, homomorphism, ∩ with regular` | Not closed under ∩ or complement. |

**Exam traps**

- Inherent ambiguity is a property of the language, not a fixable grammar defect.
- E → E + E | E * E | id is ambiguous and encodes no precedence.
- a^n b^n c^n disproves closure under intersection.

### Unit 5 · Push Down Automata

| Concept | Formula | Note |
| --- | --- | --- |
| PDA tuple | `P = (Q, Σ, Γ, δ, q₀, Z₀, F)` | Only the top of the stack is visible. |
| Move notation | `(q, aw, Zα) ⊢ (p, w, γα) for δ(q,a,Z) ∋ (p, γ)` | γ is written with the new top symbol leftmost. |
| Push order | `to push A then B, write BA as γ` | Reversing this silently changes the language. |
| Acceptance modes | `final state ⇔ empty stack` | The two modes define the same language class. |
| Deterministic PDA | `at most one move; no ε-move competing with a symbol move` | DCFL ⊂ CFL; wcw^R is deterministic, ww^R is not. |
| CFG → PDA | `one state, push start symbol, expand by reversed RHS` | Stack holds the remaining sentential form. |
| Pumping lemma (CFL) | `w = uvxyz, \|vxy\| ≤ p, \|vy\| ≥ 1, uv^i xy^i z ∈ L` | v and y are pumped together, never independently. |

**Exam traps**

- A PDA cannot inspect the whole stack — only the top symbol.
- Mixing final-state and empty-stack acceptance without clearing the stack accepts too much.
- ww^R has no DPDA; nondeterminism is essential there.

### Unit 6 · Turing Machine and REL

| Concept | Formula | Note |
| --- | --- | --- |
| TM tuple | `M = (Q, Σ, Γ, δ, q₀, q_accept, q_reject)` | Tape is infinite to the right; blank B fills unused cells. |
| Transition | `δ: Q × Γ → Q × Γ × {L, R}` | Read, write, move, change state — one step. |
| Variants | `multi-tape ≡ multitrack ≡ 2-way ≡ nondeterministic` | Same language class; only simulation overhead differs. |
| Universal TM | `U(⟨M, w⟩) simulates M on w` | Loops whenever M loops — it does not decide halting. |
| Language classes | `Recursive ⊂ RE (strict)` | L recursive iff both L and L̄ are RE. |
| Halting problem | `H = {⟨M,w⟩ : M halts on w} is RE but not recursive` | Complement of H is not RE at all. |
| Rice's theorem | `every non-trivial semantic property is undecidable` | Applies to properties of the language, not the machine code. |

**Exam traps**

- A TM need not halt; partial functions are the natural output model.
- The Church-Turing thesis is a thesis, not a theorem.
- "Recognisable" is weaker than "decidable" — recognition permits looping.

### Unit 7 · Computability

| Concept | Formula | Note |
| --- | --- | --- |
| Partial vs total | `dom(f) = inputs where the machine halts` | Total computable = machine that always halts. |
| Primitive recursive | `zero, successor, projections + composition + recursion` | Always terminate; Ackermann is computable but not primitive recursive. |
| Reduction transfer | `A ≤ B and A undecidable ⇒ B undecidable` | Direction matters — this is the most common error. |
| P and NP | `P ⊆ NP` | NP = nondeterministic polynomial, not "not polynomial". |
| NP-complete | `X ∈ NP ∧ every NP problem ≤p X` | Cook-Levin: SAT is the first NP-complete problem. |
| Proving NP-complete | `show X ∈ NP, then reduce known NP-complete → X` | Reducing X to a known problem proves nothing about X. |
| Reduction consequences | `A ≤p B ∧ B ∈ P ⇒ A ∈ P` | Reductions must run in polynomial time. |

**Exam traps**

- Reversing the reduction direction is the single most common NP-completeness mistake.
- NP-hard problems need not be in NP, or even decidable.
- Equivalence of CFGs is decidable; ambiguity of CFGs is not.

## DAA — Design and Analysis of Algorithms

6 units · 51 formulas · 18 exam traps

### Unit 1 · Introduction & Analysis

| Concept | Formula | Note |
| --- | --- | --- |
| Big-O | `f(n) = O(g(n)) ⇔ ∃c>0, n₀ : f(n) ≤ c·g(n) ∀n ≥ n₀` | Upper bound only; O(1) is also O(n²). |
| Theta | `Θ(g) = O(g) ∩ Ω(g)` | Use Θ when you mean the tight order. |
| Growth order | `1 ≺ log log n ≺ log n ≺ √n ≺ n ≺ n log n ≺ n² ≺ n³ ≺ 2ⁿ ≺ n! ≺ nⁿ` | Any exponential eventually beats any polynomial. |
| Master theorem | `T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a)` | Case 1: Θ(n^(log_b a)); Case 2: ×log n; Case 3: Θ(f(n)) if regular. |
| Merge sort | `T(n) = 2T(n/2) + Θ(n) = Θ(n log n)` | Master theorem case 2. |
| Binary search | `T(n) = T(n/2) + Θ(1) = Θ(log n)` | Requires a sorted array. |
| Log base | `log_b n = log_2 n / log_2 b` | Base changes are constant factors, invisible asymptotically. |

**Exam traps**

- Master theorem fails when f(n) is not polynomially comparable, e.g. f(n) = n log n vs n.
- Quoting a best-case bound as the algorithm complexity.
- Recursion space includes call-stack depth.

### Unit 2 · Divide and Conquer

| Concept | Formula | Note |
| --- | --- | --- |
| Paradigm recurrence | `T(n) = aT(n/b) + C(n)` | Subproblems must be the same type and non-overlapping. |
| Merge sort | `Θ(n log n) always, Θ(n) auxiliary space, stable` | Worst-case comparisons: n⌈log₂n⌉ − 2^⌈log₂n⌉ + 1. |
| Quick sort | `average Θ(n log n), worst Θ(n²)` | Randomised or median-of-three pivots make the worst case improbable. |
| Comparison lower bound | `Ω(n log n) comparisons` | Decision tree has n! leaves ⇒ height ≥ log₂(n!). |
| Heap sort | `Θ(n log n) worst, O(1) extra space, not stable` | Build-heap is Θ(n), each of n extractions costs Θ(log n). |
| Heap indexing (0-based) | `children of i are 2i+1 and 2i+2` | Parent of i is ⌊(i−1)/2⌋. |
| Elementary sorts | `bubble, selection, insertion all Θ(n²) worst` | Selection sort always does exactly n(n−1)/2 comparisons. |
| Simultaneous max-min | `≈ 3n/2 − 2 comparisons` | Naive double scan costs 2n − 2. |

**Exam traps**

- Quick sort worst case is quadratic, never n log n.
- The n log n lower bound does not apply to radix or counting sort.
- Heap sort is not stable.

### Unit 3 · Dynamic Programming

| Concept | Formula | Note |
| --- | --- | --- |
| DP preconditions | `optimal substructure ∧ overlapping subproblems` | Independent subproblems means divide and conquer. |
| Coin change | `C(A) = 1 + min{C(A − dᵢ)}` | Θ(nA) time; greedy is optimal only for canonical systems. |
| 0/1 knapsack | `V(i,c) = max(V(i−1,c), vᵢ + V(i−1, c−wᵢ))` | Θ(nW), pseudo-polynomial because W appears in the runtime. |
| Unbounded knapsack | `iterate capacity upward and allow V(i, c−wᵢ)` | Using the 0/1 recurrence here is a classic error. |
| Matrix chain | `m[i,j] = min_k { m[i,k] + m[k+1,j] + pᵢ₋₁pₖpⱼ }` | Θ(n³), filled by increasing chain length. |
| LCS | `xᵢ = yⱼ ⇒ L(i,j) = L(i−1,j−1)+1, else max(L(i−1,j), L(i,j−1))` | Θ(mn); subsequence need not be contiguous. |
| Assembly line | `f₁[j] = min(f₁[j−1] + a₁ⱼ, f₂[j−1] + t₂ⱼ + a₁ⱼ)` | Add the exit cost at the end. |
| Parenthesations | `Catalan number C(n−1) for n matrices` | DP explores them in Θ(n³) rather than exponentially. |

**Exam traps**

- Confusing longest common subsequence with longest common substring.
- Greedy fails on 0/1 knapsack: {1,3,4} target 6 gives 4+1+1, DP gives 3+3.
- Optimal substructure must be proved, not assumed — longest simple path lacks it.

### Unit 4 · Greedy Method & Graphs

| Concept | Formula | Note |
| --- | --- | --- |
| Greedy correctness | `greedy-choice property + optimal substructure` | Usually established by an exchange argument. |
| Activity selection | `sort by finish time, take next compatible` | Θ(n log n); sorting by start time or duration fails. |
| Fractional knapsack | `sort by value/weight, split the last item` | Optimal because items are divisible. |
| Job sequencing | `sort by profit desc, place in latest free slot ≤ deadline` | Earliest free slot can block a tighter deadline. |
| Huffman | `repeatedly merge two lowest frequencies` | Θ(n log n) with a heap; ties give multiple optimal codes. |
| BFS / DFS | `both Θ(V + E)` | BFS gives shortest paths in unweighted graphs only. |
| Dijkstra | `O((V + E) log V) with a binary heap` | Requires non-negative weights. |
| Bellman-Ford | `Θ(VE), V−1 relaxation rounds` | Handles negative weights and detects negative cycles in one extra pass. |
| Floyd-Warshall | `d[i][j] = min(d[i][j], d[i][k] + d[k][j])` | Θ(V³); k must be the outermost loop. |
| MST | `Kruskal O(E log E) · Prim O(V²) dense` | MST is not unique when edge weights tie. |

**Exam traps**

- Running Dijkstra with negative edge weights.
- Putting k innermost in Floyd-Warshall produces wrong answers.
- Greedy by value density fails on 0/1 knapsack.

### Unit 5 · Backtracking & Branch and Bound

| Concept | Formula | Note |
| --- | --- | --- |
| Backtracking | `depth-first over a state-space tree, undo on failure` | One level per decision variable. |
| N-Queens | `solutions exist for all n except 2 and 3` | n = 8 has 92 solutions, 12 up to symmetry. |
| Diagonal test | `row − col and row + col identify both diagonals` | Boolean arrays give O(1) conflict checks. |
| Subset sum | `2ⁿ leaves before pruning` | Sort descending so the bound tightens sooner. |
| Graph colouring | `chromatic number = minimum colours` | Greedy colouring may exceed the chromatic number. |
| Branch and bound | `bound must never underestimate the true completion cost` | An optimistic invalid bound prunes the optimum. |
| TSP bound | `row + column reduction of the cost matrix` | Christofides gives a 1.5-approximation for metric TSP. |
| Assignment | `Hungarian algorithm Θ(n³)` | Row minima then column minima create zeros without changing the optimum. |

**Exam traps**

- Pruning only at complete leaves reduces backtracking to brute force.
- Forgetting the closing edge back to the start in Hamiltonian cycle checks.
- Branch and bound does not make TSP polynomial.

### Unit 6 · NP-Completeness & Approximation

| Concept | Formula | Note |
| --- | --- | --- |
| P | `decidable by a deterministic algorithm in polynomial time` | P ⊆ NP; equality is open. |
| NP | `yes-instances have a polynomial certificate verifiable in poly time` | NP = nondeterministic polynomial time. |
| NP-hard | `every NP problem ≤p X` | Need not be in NP or even decidable. |
| NP-complete | `X ∈ NP ∧ X is NP-hard` | Cook-Levin: SAT is NP-complete. |
| Reduction | `A ≤p B ∧ B ∈ P ⇒ A ∈ P` | Must run in polynomial time and preserve answers. |
| Vertex cover | `2-approximation by maximal matching` | Ratio measured against the optimum, not a baseline. |
| Metric TSP | `1.5-approximation (Christofides)` | General TSP has no constant-factor approximation unless P = NP. |
| Bin packing | `first-fit decreasing ≤ 11/9·OPT + 6/9` | No algorithm beats 3/2 unless P = NP. |
| Selection | `quickselect expected Θ(n) · median-of-medians Θ(n) worst` | Quickselect recurses into one side only. |
| Las Vegas vs Monte Carlo | `Las Vegas: always correct · Monte Carlo: may err` | Miller-Rabin is Monte Carlo. |

**Exam traps**

- Reducing X to a known NP-complete problem and claiming X is hard — direction reversed.
- Proving X ∈ NP without the hardness reduction only shows membership.
- Weakly NP-complete problems are tractable when numeric values are small.
