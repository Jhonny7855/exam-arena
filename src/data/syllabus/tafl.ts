import type { Difficulty, Stage, UnitId } from '../../types'
import type { TopicNote, UnitSyllabus } from './types'

export type { TopicNote, UnitSyllabus }

export const TAFL_UNITS: UnitSyllabus[] = [
  {
    id: 1,
    code: 'U1',
    title: 'Preliminaries',
    tagline: 'The mathematical language of computation',
    accent: '#4f7cff',
    overview:
      'Every automaton proof rests on discrete mathematics: sets, relations, functions, and the four standard proof techniques. This unit builds the vocabulary used by every later unit, from equivalence relations in DFA minimisation to induction proofs on string length.',
    topics: [
      {
        name: 'Set theory',
        summary:
          'A set is an unordered collection of distinct objects. Core operations are union, intersection, difference, and complement with respect to a universe. Cardinality counts elements; power set collects all subsets.',
        keyPoints: [
          'A ⊆ B means every element of A is in B; A ⊂ B additionally requires A ≠ B.',
          'The power set P(A) has 2^|A| elements — the source of the 2^n bound in subset construction.',
          'De Morgan: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ and (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ.',
        ],
        pitfall: 'The empty set is a subset of every set, but it is an element of a power set, not of the original set (unless the original set contains ∅).',
      },
      {
        name: 'Propositions',
        summary:
          'A proposition is a statement that is either true or false, never both. Connectives AND, OR, NOT, implication, and biconditional combine propositions; truth tables enumerate all valuations.',
        keyPoints: [
          'P → Q is false only when P is true and Q is false.',
          'P → Q ≡ ¬P ∨ Q ≡ ¬Q → ¬P (contrapositive).',
          'The converse Q → P and inverse ¬P → ¬Q are not equivalent to the original implication.',
        ],
        pitfall: 'Confusing the converse with the contrapositive. Only the contrapositive preserves truth value.',
      },
      {
        name: 'Predicate logic',
        summary:
          'Predicates express properties of objects; quantifiers ∀ (for all) and ∃ (there exists) bind variables. Quantifier order changes meaning, and negation flips the quantifier.',
        keyPoints: [
          '¬∀x P(x) ≡ ∃x ¬P(x) and ¬∃x P(x) ≡ ∀x ¬P(x).',
          '∀x∃y R(x,y) is weaker than ∃y∀x R(x,y).',
          'A single counterexample disproves a universal claim.',
        ],
        pitfall: 'Reversing nested quantifiers while negating. Negate inward one quantifier at a time.',
      },
      {
        name: 'Relations',
        summary:
          'A relation on a set is a subset of the Cartesian product. Key properties are reflexivity, symmetry, antisymmetry, and transitivity, which classify relations as equivalence relations or partial orders.',
        keyPoints: [
          'Equivalence: reflexive + symmetric + transitive; it partitions the set into classes.',
          'Partial order: reflexive + antisymmetric + transitive.',
          'An equivalence relation induces a partition, and every partition induces an equivalence relation.',
        ],
        pitfall: 'A relation can be both symmetric and antisymmetric only when it is a subset of the identity relation.',
      },
      {
        name: 'One-to-one, onto and bijective functions',
        summary:
          'A function maps each domain element to exactly one codomain element. Injective (one-to-one) functions never repeat outputs; surjective (onto) functions hit every codomain element; bijective functions do both and are invertible.',
        keyPoints: [
          'Injective: f(a) = f(b) implies a = b.',
          'Surjective: for every y in the codomain there is an x with f(x) = y.',
          'A bijection between finite sets of equal size is a permutation.',
        ],
        pitfall: 'Surjectivity depends on the declared codomain, not on the image actually produced.',
      },
      {
        name: 'Proof techniques',
        summary:
          'Direct proof derives the conclusion from the premises. Proof by contradiction assumes the negation and derives a falsehood. Proof by contrapositive proves ¬Q → ¬P instead of P → Q.',
        keyPoints: [
          'Contradiction proves ¬P → false, hence P; contrapositive proves ¬Q → ¬P.',
          'Classic contradiction: √2 is irrational, and there are infinitely many primes.',
          'Proof by contrapositive is usually cleaner when the negation of the conclusion is a positive statement.',
        ],
        pitfall: 'Calling a contrapositive proof a contradiction proof — they are different structures even when both start by assuming a negation.',
      },
      {
        name: 'Mathematical induction',
        summary:
          'Induction proves a statement for all natural numbers: establish the base case, assume the statement for n (or all values up to n), and derive it for n+1. Strong induction allows a stronger hypothesis.',
        keyPoints: [
          'Weak induction: P(0) and (P(n) → P(n+1)).',
          'Strong induction: P(0..n) → P(n+1).',
          'Structural induction on strings or trees mirrors grammar recursion.',
        ],
        pitfall: 'Skipping the base case, or using the claim for n+1 inside the inductive step (circular reasoning).',
      },
      {
        name: 'Recursive definition',
        summary:
          'A recursive definition gives a base case and a rule that builds new objects from old ones. Languages, grammars, and trees are all defined this way.',
        keyPoints: [
          'Base clause produces the smallest objects; the recursive clause closes the set.',
          'The extremal clause states nothing else belongs to the set.',
          'Structural induction is the natural proof method for recursively defined objects.',
        ],
        pitfall: 'Forgetting the extremal clause, which allows unintended objects into the defined set.',
      },
    ],
  },
  {
    id: 2,
    code: 'U2',
    title: 'Regular Languages',
    tagline: 'Strings, expressions and the limits of finiteness',
    accent: '#8b5cf6',
    overview:
      'Regular languages are exactly the languages described by regular expressions and accepted by finite automata. This unit covers the algebra of strings and languages, regular expression semantics, and the pumping lemma, which proves that some languages are not regular.',
    topics: [
      {
        name: 'Alphabet, strings and languages',
        summary:
          'An alphabet Σ is a finite non-empty set of symbols. A string is a finite sequence of symbols; Σ* is the set of all strings including ε, and Σ+ excludes ε. A language is any subset of Σ*.',
        keyPoints: [
          '|Σ| = k implies exactly k^n strings of length n, so Σ* is countably infinite.',
          'ε is the empty string with |ε| = 0, distinct from ∅, the empty language.',
          'A language L ⊆ Σ* may be finite or infinite.',
        ],
        pitfall: 'Writing {ε} = ∅. The first contains one string; the second contains none.',
      },
      {
        name: 'String operations',
        summary:
          'Concatenation joins strings, reversal mirrors them, and length counts symbols. A prefix, suffix, or substring of a string is any contiguous piece at the corresponding position.',
        keyPoints: [
          '|xy| = |x| + |y| and (xy)^R = y^R x^R.',
          'x is a prefix of w if w = xy for some y; proper prefix means y ≠ ε.',
          'w^i denotes i-fold concatenation with w^0 = ε.',
        ],
        pitfall: 'Assuming reversal distributes over concatenation in the same order — the order swaps.',
      },
      {
        name: 'Language operations',
        summary:
          'Languages combine by union, intersection, complement, concatenation, Kleene star, and reversal. The class of regular languages is closed under all of these.',
        keyPoints: [
          'L1L2 = {xy : x ∈ L1, y ∈ L2}.',
          'L* = ∪_{i≥0} L^i and L+ = ∪_{i≥1} L^i, so L* = {ε} ∪ L+.',
          '(L*)* = L* and (L1 ∪ L2)* need not equal L1* ∪ L2*.',
        ],
        pitfall: 'ε belongs to L* for every L, even when ε ∉ L.',
      },
      {
        name: 'Regular expressions',
        summary:
          'A regular expression is built from ∅, ε, and symbols using union, concatenation, and star. Each expression denotes a regular language, and precedence is star, then concatenation, then union.',
        keyPoints: [
          '∅* = {ε} and ε* = {ε}.',
          '(a*b*)* = (a ∪ b)*, which is all strings over {a,b}.',
          'Two expressions are equivalent when they denote the same language, not the same syntax.',
        ],
        pitfall: 'Reading a ∪ bc as (a ∪ b)c. Concatenation binds tighter than union.',
      },
      {
        name: 'Regular expression construction',
        summary:
          'Designing an expression means describing the language structurally: count-free conditions, allowed positions, and forbidden patterns translate into unions, concatenations, and stars.',
        keyPoints: [
          'Even number of a: (b*ab*ab*)*b* over {a,b}.',
          'Strings ending in ab: (a ∪ b)*ab.',
          'At most one a: b* ∪ b*ab*, equivalently b*(ε ∪ a)b*.',
        ],
        pitfall: 'Using (a ∪ b)* in the middle when the constraint is positional — anchor the pattern at the correct end.',
      },
      {
        name: 'Pumping lemma for regular languages',
        summary:
          'If L is regular with a DFA of n states, every string w ∈ L with |w| ≥ n can be written w = xyz where |xy| ≤ n, |y| ≥ 1, and xy^i z ∈ L for all i ≥ 0. It is a necessary, not sufficient, condition.',
        keyPoints: [
          'The proof uses the pigeonhole principle on the first n+1 states visited.',
          'Pumping down (i = 0) is often the fastest contradiction.',
          'Passing the pumping lemma never proves regularity.',
        ],
        pitfall: 'Choosing the decomposition yourself. In a proof you must show that for every valid decomposition the pumped string leaves L.',
      },
      {
        name: 'Closure and regularity decisions',
        summary:
          'Regular languages are closed under union, intersection, complement, concatenation, star, reversal, homomorphism, and inverse homomorphism. Emptiness, finiteness, and membership are decidable.',
        keyPoints: [
          'Closure under complement plus union gives closure under intersection.',
          'A language is regular iff some DFA, NFA, ε-NFA, or regular expression describes it.',
          'Finiteness is decided by cycle detection in the transition graph reachable from the start state.',
        ],
        pitfall: 'Assuming closure under arbitrary substitution. Homomorphism preserves regularity; general substitution does not.',
      },
    ],
  },
  {
    id: 3,
    code: 'U3',
    title: 'Finite State Machines',
    tagline: 'Determinism, nondeterminism and minimisation',
    accent: '#22d3ee',
    overview:
      'Finite automata are the operational model of regular languages. This unit covers DFA and NFA semantics, ε-closures, subset construction, the Thompson construction, minimisation via distinguishability, and the Moore and Mealy transducer models.',
    topics: [
      {
        name: 'DFA fundamentals',
        summary:
          'A DFA is a 5-tuple (Q, Σ, δ, q0, F) with exactly one transition per state-symbol pair. It accepts a string if the unique run ends in a final state.',
        keyPoints: [
          'δ: Q × Σ → Q is total; a missing transition means a rejecting sink state.',
          'A DFA with n states can distinguish strings only up to length n−1.',
          'The language of a DFA is the set of labels of paths from q0 to F.',
        ],
        pitfall: 'Forgetting the dead state when completing a partial DFA, which changes the transition count but not the language.',
      },
      {
        name: 'NFA semantics',
        summary:
          'An NFA allows zero, one, or many transitions per state-symbol pair. It accepts if some run ends in a final state, which makes it a search over configurations rather than a single path.',
        keyPoints: [
          'NFA transition relation δ ⊆ Q × (Σ ∪ {ε}) × Q.',
          'Nondeterminism is existential: one accepting path suffices.',
          'Every NFA has an equivalent DFA, possibly with exponentially more states.',
        ],
        pitfall: 'Believing NFAs are more powerful than DFAs. They are equally powerful, only more succinct.',
      },
      {
        name: 'Epsilon transitions and closure',
        summary:
          'ε-transitions move between states without consuming input. The ε-closure of a state set is everything reachable using ε-moves alone and is computed by transitive closure.',
        keyPoints: [
          'ε-closure(q) always contains q itself.',
          'Move(S, a) = ∪_{q∈S} δ(q,a), then take ε-closure of the result.',
          'ε-closures are the basis of both ε-NFA elimination and subset construction.',
        ],
        pitfall: 'Forgetting to close over ε after consuming a symbol, which drops reachable states.',
      },
      {
        name: 'Subset construction',
        summary:
          'Subset construction converts an NFA with n states into a DFA whose states are sets of NFA states. The start state is ε-closure(q0) and a set is final if it contains an NFA final state.',
        keyPoints: [
          'At most 2^n DFA states exist, and the bound is tight for some languages.',
          'Only reachable subsets need to be built, so practical results are usually far smaller.',
          'Each DFA transition corresponds to a Move-plus-closure step.',
        ],
        pitfall: 'Marking a subset final only when all its members are final. A single final member is enough.',
      },
      {
        name: 'Regular expression to NFA',
        summary:
          'Thompson construction builds an ε-NFA inductively: base automata for ∅, ε, and each symbol, then composition for union, concatenation, and star, each with a fresh start and accept state.',
        keyPoints: [
          'The result has a single start and a single final state with no incoming start edges.',
          'State count grows linearly with expression size, at most 2·|r| states.',
          'Union uses ε-branches; star uses an ε-loop back to the split point.',
        ],
        pitfall: 'Reusing the same accept state for both union branches, which accidentally allows mixing the branches.',
      },
      {
        name: 'DFA minimisation',
        summary:
          'Minimisation merges equivalent states using the partition-refinement algorithm: start with final versus non-final, then split classes whose transitions land in different classes until stable.',
        keyPoints: [
          'Two states are distinguishable if some string drives exactly one to a final state.',
          'Unreachable states are removed before refinement.',
          'The minimal DFA is unique up to isomorphism, so its state count is a language invariant.',
        ],
        pitfall: 'Refining only on final/non-final and forgetting to re-check transitions after each split.',
      },
      {
        name: 'Moore and Mealy machines',
        summary:
          'Moore machines output on states; Mealy machines output on transitions. Both are deterministic transducers and are equivalent in expressive power.',
        keyPoints: [
          'Moore output depends on the current state only; Mealy output depends on state and input.',
          'Moore needs at most one extra state when converted from Mealy.',
          'A Mealy machine can respond before reaching a new state, giving one-step-earlier output.',
        ],
        pitfall: 'Comparing output sequences without accounting for the initial Moore output produced before any input is read.',
      },
    ],
  },
  {
    id: 4,
    code: 'U4',
    title: 'Context Free Grammar',
    tagline: 'Generative structure and ambiguity',
    accent: '#34d399',
    overview:
      'Context-free grammars generate languages with nested, recursive structure such as balanced parentheses and arithmetic expressions. This unit covers derivations, parse trees, ambiguity, normal forms, and closure properties.',
    topics: [
      {
        name: 'CFG fundamentals',
        summary:
          'A CFG is (V, T, P, S) with variables, terminals, productions A → α, and a start symbol. A string is in the language if some derivation from S yields it.',
        keyPoints: [
          'Left side of every production is a single variable — that is what context-free means.',
          'Derivation replaces one variable at a time until only terminals remain.',
          'L(G) = {w ∈ T* : S ⇒* w}.',
        ],
        pitfall: 'Allowing productions like aB → c, which makes the grammar context-sensitive rather than context-free.',
      },
      {
        name: 'Derivations and parse trees',
        summary:
          'A leftmost derivation always expands the leftmost variable; a rightmost derivation expands the rightmost. Parse trees record the same information with the root S, internal nodes as variables, and leaves as terminals.',
        keyPoints: [
          'The yield of a parse tree is the derived string.',
          'Number of leaves equals number of terminals plus ε-leaves.',
          'A grammar is ambiguous iff some string has two distinct parse trees, equivalently two distinct leftmost derivations.',
        ],
        pitfall: 'Counting different derivation orders as ambiguity. Only distinct parse trees (or leftmost derivations) count.',
      },
      {
        name: 'Ambiguity',
        summary:
          'Ambiguity means a string has multiple parse trees, so its meaning is unclear. Classic cases are dangling else and unparenthesised arithmetic with more than one operator precedence level.',
        keyPoints: [
          'Fix precedence by layering nonterminals: E → E+T | T, T → T*F | F.',
          'Fix associativity by choosing left or right recursion deliberately.',
          'Some CFLs are inherently ambiguous: every grammar for them is ambiguous.',
        ],
        pitfall: 'Assuming every ambiguous grammar can be fixed by rewriting. Inherent ambiguity is a property of the language.',
      },
      {
        name: 'Chomsky Normal Form',
        summary:
          'In CNF every production is A → BC or A → a, optionally with S → ε when the language contains ε. CNF enables CYK parsing and gives a clean bound on derivation length.',
        keyPoints: [
          'Conversion steps: eliminate ε-productions, eliminate unit productions, remove useless symbols, then binarise and terminalise.',
          'A string of length n has a derivation of exactly 2n−1 steps in CNF.',
          'CNF grammars never mix terminals and variables in one production.',
        ],
        pitfall: 'Forgetting to reintroduce S → ε after eliminating ε-productions, which drops the empty string from the language.',
      },
      {
        name: 'Greibach Normal Form',
        summary:
          'In GNF every production is A → aα where a is a terminal and α is a (possibly empty) string of variables. Each derivation step consumes exactly one terminal.',
        keyPoints: [
          'GNF implies derivations are left-to-right and length equals the number of terminals consumed.',
          'Every CFL without ε has an equivalent GNF grammar.',
          'GNF is the natural normal form for PDA equivalence proofs.',
        ],
        pitfall: 'Leaving ε-productions in place; standard GNF requires removing them first.',
      },
      {
        name: 'Expression grammars',
        summary:
          'Arithmetic grammars encode precedence and associativity through grammar structure. Unambiguous versions use one nonterminal per precedence level and left recursion for left associativity.',
        keyPoints: [
          'E → E + T | T and T → T * F | F gives * higher precedence than +.',
          'Parenthesised atoms appear at the lowest level: F → (E) | id.',
          'Right recursion yields right associativity, as in exponentiation.',
        ],
        pitfall: 'Writing E → E + E | E * E | id, which is ambiguous and gives no precedence.',
      },
      {
        name: 'Closure properties of CFL',
        summary:
          'CFLs are closed under union, concatenation, Kleene star, reversal, homomorphism, and intersection with a regular language. They are not closed under intersection or complement.',
        keyPoints: [
          'L1 ∩ R is context-free whenever L1 is context-free and R is regular.',
          'a^n b^n c^n is the standard counterexample to closure under intersection.',
          'Non-closure under complement follows from De Morgan together with non-closure under intersection.',
        ],
        pitfall: 'Assuming closure under intersection because closure under union holds.',
      },
    ],
  },
  {
    id: 5,
    code: 'U5',
    title: 'Push Down Automata',
    tagline: 'Machines with a stack',
    accent: '#f59e0b',
    overview:
      'A PDA is an ε-NFA plus an unbounded stack, which is exactly enough power to recognise context-free languages. This unit covers stack semantics, acceptance modes, determinism, CFG-PDA equivalence, and the CFL pumping lemma.',
    topics: [
      {
        name: 'PDA model',
        summary:
          'A PDA is (Q, Σ, Γ, δ, q0, Z0, F) where δ maps state, input symbol (or ε), and stack top to a set of next state and stack replacement pairs.',
        keyPoints: [
          'Γ is the stack alphabet; Z0 is the initial bottom marker.',
          'Replacing top X by ε is a pop; replacing by YX is a push of Y.',
          'Input is read left to right and never re-read.',
        ],
        pitfall: 'Trying to inspect the whole stack. A PDA sees only the top symbol.',
      },
      {
        name: 'Stack operations and tracing',
        summary:
          'A configuration is (state, remaining input, stack contents). A move consumes input or not, pops the top, and pushes a replacement string whose leftmost symbol becomes the new top.',
        keyPoints: [
          'Notation (q, aw, Zα) ⊢ (p, w, γα) for a transition δ(q,a,Z) ∋ (p, γ).',
          'Push order matters: to push AB with A on top, write BA in the replacement.',
          'A string is accepted if some computation reaches an accepting configuration.',
        ],
        pitfall: 'Reversing push order, which silently breaks the language recognised.',
      },
      {
        name: 'Acceptance by final state vs empty stack',
        summary:
          'A PDA may accept by entering a final state with any stack, or by emptying its stack in any state. The two modes are inter-translatable, so they define the same class of languages.',
        keyPoints: [
          'Final-state acceptance needs the stack bottom marker to avoid accidental acceptance.',
          'Empty-stack acceptance usually uses a single state plus a bottom-marker trick.',
          'Every PDA can be converted to accept by empty stack and vice versa.',
        ],
        pitfall: 'Mixing both acceptance conditions in one machine without clearing the stack, which accepts unintended strings.',
      },
      {
        name: 'Deterministic PDA',
        summary:
          'A DPDA has at most one applicable move per configuration, and cannot both take an ε-move and a symbol-move from the same state and stack top. DPDAs accept the deterministic context-free languages, a strict subset of the CFLs.',
        keyPoints: [
          'DPDA languages are closed under complement but not under union or intersection.',
          'Every regular language is a DCL, since a DFA is a DPDA that ignores its stack.',
          'wcw^R is a DCL; ww^R is not.',
        ],
        pitfall: 'Assuming every CFL has a DPDA. Nondeterminism is essential for languages like ww^R.',
      },
      {
        name: 'CFG to PDA conversion',
        summary:
          'The standard construction uses one state, pushes the start symbol, and simulates leftmost derivations on the stack: expand a variable by pushing the reversed right-hand side, and match terminals against the input.',
        keyPoints: [
          'The stack holds the remaining sentential form.',
          'Expansion pushes the production body reversed so the leftmost symbol is on top.',
          'Terminal matching pops the symbol only when it equals the next input symbol.',
        ],
        pitfall: 'Pushing the production body in the original order, which reverses the derivation order.',
      },
      {
        name: 'Pumping lemma for CFL',
        summary:
          'For a CFL L there is a pumping length p such that every w ∈ L with |w| ≥ p splits as uvxyz with |vxy| ≤ p, |vy| ≥ 1, and uv^i xy^i z ∈ L for all i ≥ 0.',
        keyPoints: [
          'Both v and y are pumped together, the same number of times.',
          'The bound applies to the middle segment vxy, not to the whole string.',
          'Standard counterexample: {a^n b^n c^n}.',
        ],
        pitfall: 'Pumping v and y independently, which the lemma does not permit.',
      },
    ],
  },
  {
    id: 6,
    code: 'U6',
    title: 'Turing Machine and REL',
    tagline: 'The universal model of computation',
    accent: '#f472b6',
    overview:
      'A Turing machine reads and writes an unbounded tape, which gives it the power to compute anything computable. This unit covers tape mechanics, machine variants, the Church-Turing thesis, universal machines, halting versus looping, and the recursive and recursively enumerable language classes.',
    topics: [
      {
        name: 'Turing machine model',
        summary:
          'A TM is (Q, Σ, Γ, δ, q0, qaccept, qreject) with a tape infinite to the right. Each step reads a symbol, writes a symbol, moves the head L or R, and changes state.',
        keyPoints: [
          'δ: Q × Γ → Q × Γ × {L, R} for a deterministic machine.',
          'The tape is finite in content but unbounded in extent; blank B fills unused cells.',
          'Accepting and rejecting states halt immediately.',
        ],
        pitfall: 'Thinking the tape is infinite on both sides. The standard model is one-way infinite but equivalent to the two-way version.',
      },
      {
        name: 'Configurations and tracing',
        summary:
          'A configuration records the tape content, head position, and current state. A computation is a sequence of configurations; acceptance means halting in qaccept.',
        keyPoints: [
          'Write the configuration as αqβ where q marks the head position.',
          'A TM may never halt on some inputs, which is why TMs compute partial functions.',
          'The number of steps can be far larger than the input length.',
        ],
        pitfall: 'Assuming every TM halts. Non-halting is a defining feature of the model.',
      },
      {
        name: 'Turing machine variants',
        summary:
          'Multi-tape, multitrack, two-way infinite tape, and nondeterministic TMs all recognise the same class of languages as the standard model, with only polynomial or exponential simulation overhead.',
        keyPoints: [
          'A k-tape TM simulates on one tape using a delimiter and track encoding.',
          'A nondeterministic TM is simulated by breadth-first search over configurations.',
          'Variants change efficiency, not computability.',
        ],
        pitfall: 'Believing a 2-tape TM is strictly more powerful. It is not.',
      },
      {
        name: 'Church-Turing thesis',
        summary:
          'The thesis states that every effectively computable function is computable by a Turing machine. It is a thesis about the meaning of computability, supported by the equivalence of all reasonable models.',
        keyPoints: [
          'Lambda calculus, recursive functions, and register machines all match TMs.',
          'The thesis cannot be proved because "effective procedure" is informal.',
          'It licenses algorithm-level arguments in place of full TM constructions.',
        ],
        pitfall: 'Calling the thesis a theorem. It is an empirically supported identification, not a provable statement.',
      },
      {
        name: 'Universal Turing machine',
        summary:
          'A UTM takes an encoding of a machine M and an input w and simulates M on w. This single machine can compute any computable function, which underpins programmability.',
        keyPoints: [
          'The pair ⟨M, w⟩ is encoded as a string over a fixed alphabet.',
          'Simulation is step-by-step, using the tape to store M\'s description and configuration.',
          'The existence of a UTM is the key step in proving undecidability results.',
        ],
        pitfall: 'Confusing the UTM with a machine that decides halting. It simulates and may loop whenever M loops.',
      },
      {
        name: 'Recursive and recursively enumerable languages',
        summary:
          'A language is recursive (decidable) if some TM halts on every input, accepting members and rejecting non-members. It is recursively enumerable if some TM accepts exactly its members, possibly looping on others.',
        keyPoints: [
          'Recursive ⊂ RE, and the inclusion is strict.',
          'L is recursive iff both L and its complement are RE.',
          'The halting problem is RE but not recursive.',
        ],
        pitfall: 'Treating "recognisable" and "decidable" as synonyms. Recognition permits looping.',
      },
      {
        name: 'Halting and looping',
        summary:
          'The halting problem asks whether a TM halts on a given input and is undecidable. Diagonalisation shows no machine can decide it for all pairs.',
        keyPoints: [
          'Assume decider H, build D that contradicts H on ⟨D⟩.',
          'The complement of the halting problem is not RE.',
          'Rice\'s theorem generalises this to every non-trivial semantic property.',
        ],
        pitfall: 'Thinking a machine can be patched to detect its own loops. That would decide halting.',
      },
    ],
  },
  {
    id: 7,
    code: 'U7',
    title: 'Computability',
    tagline: 'Decidability, recursion theory and complexity',
    accent: '#a3e635',
    overview:
      'This unit formalises which problems can be solved at all and which can be solved efficiently. It covers partial and primitive recursive functions, undecidability, and the complexity classes P, NP, NP-hard, and NP-complete.',
    topics: [
      {
        name: 'Partial and total functions',
        summary:
          'A partial function is defined on a subset of its domain; a total function is defined everywhere. Turing machines naturally compute partial functions because they may diverge.',
        keyPoints: [
          'Domain of a partial function = inputs on which the machine halts.',
          'A total computable function corresponds to a machine that always halts.',
          'The set of total computable functions is not effectively enumerable.',
        ],
        pitfall: 'Assuming every computable function is total; divergence is allowed.',
      },
      {
        name: 'Primitive recursive functions',
        summary:
          'Primitive recursive functions are built from zero, successor, and projections using composition and primitive recursion. They always terminate but do not capture all computable functions.',
        keyPoints: [
          'Addition and multiplication are primitive recursive; so is exponentiation.',
          'Ackermann\'s function is computable but not primitive recursive.',
          'The class is closed under bounded minimisation but not unbounded minimisation.',
        ],
        pitfall: 'Equating primitive recursive with computable. Ackermann\'s function separates them.',
      },
      {
        name: 'Decidability and undecidability',
        summary:
          'A problem is decidable if a TM always halts with the correct yes/no answer. Many natural problems about programs are undecidable by Rice\'s theorem or reduction from halting.',
        keyPoints: [
          'Reduction: if A reduces to B and A is undecidable, then B is undecidable.',
          'Membership for CFGs is decidable; equivalence for CFGs is decidable; ambiguity is undecidable.',
          'Emptiness of a TM language is undecidable.',
        ],
        pitfall: 'Reversing the reduction direction when proving undecidability.',
      },
      {
        name: 'Complexity classes P and NP',
        summary:
          'P contains problems solvable in deterministic polynomial time. NP contains problems whose yes-instances have polynomial-size certificates verifiable in polynomial time.',
        keyPoints: [
          'P ⊆ NP, and whether the inclusion is strict is open.',
          'NP is closed under complement only if NP = coNP, which is believed false.',
          'Nondeterministic polynomial time equals certificate-verification time.',
        ],
        pitfall: 'Defining NP as "not polynomial" or as "exponential". NP means nondeterministic polynomial.',
      },
      {
        name: 'NP-hard and NP-complete',
        summary:
          'A problem is NP-hard if every NP problem reduces to it in polynomial time; it is NP-complete if it is also in NP. SAT, 3-SAT, clique, vertex cover, and Hamiltonian cycle are canonical examples.',
        keyPoints: [
          'Cook-Levin: SAT is NP-complete.',
          'To prove X NP-complete, show X ∈ NP and reduce a known NP-complete problem to X.',
          'NP-hard problems need not lie in NP or even be decidable.',
        ],
        pitfall: 'Reducing X to a known NP-complete problem to prove X is NP-complete. The direction must be the other way.',
      },
      {
        name: 'Reductions and structure',
        summary:
          'Polynomial-time many-one reductions order problems by difficulty and transfer hardness. Reductions also connect decidability: an undecidable source makes the target undecidable.',
        keyPoints: [
          'A ≤p B and B ∈ P implies A ∈ P.',
          'A ≤p B and A is NP-hard implies B is NP-hard.',
          'Reductions must be computable in polynomial time and answer-preserving.',
        ],
        pitfall: 'Using an exponential reduction, which does not preserve the complexity conclusions.',
      },
    ],
  },
]

export const unitById = (id: UnitId): UnitSyllabus => {
  const unit = TAFL_UNITS.find((u) => u.id === id)
  if (!unit) throw new Error(`Unknown unit ${id}`)
  return unit
}
export const TAFL_STAGES: Stage[] = [
  {
    id: 1,
    name: 'Foundation',
    range: [1, 20],
    goal: 'Build foundational understanding of definitions, notation, and core models.',
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
    goal: 'Apply theory to tracing, conversion, derivation, and machine reasoning.',
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

export const stageById = (id: number): Stage => TAFL_STAGES.find((s) => s.id === id) ?? TAFL_STAGES[0]

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']

export const ALL_TOPICS = TAFL_UNITS.flatMap((u) => u.topics.map((t) => ({ unit: u.id, topic: t.name })))
