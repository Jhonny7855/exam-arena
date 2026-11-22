import type { SubjectId, UnitId } from '../../types'

export const TAFL_TEST_NAMES: Record<number, string[]> = {
  1: [
    'Foundations of Sets', 'Logic Gates of Reason', 'Relation Rules', 'Function Forms',
    'Proof First Steps', 'Induction Initiate', 'Recursion Roots', 'Alphabet Basics',
    'String Theory', 'Language Primer', 'Regex Warm-up', 'Automaton Anatomy',
    'DFA Discovery', 'NFA Notions', 'Grammar Groundwork', 'Derivation Drills',
    'Stack Signals', 'Tape Tales', 'Computability Compass', 'Foundation Finale',
  ],
  2: [
    'Concept Lattice', 'Closure Concepts', 'Equivalence Engine', 'Cardinality Craft',
    'Proof Patterns', 'Quantifier Quests', 'Language Algebra', 'Regex Reasoning',
    'Pumping Premise', 'Closure Calculus', 'DFA versus NFA', 'Epsilon Effects',
    'Subset Sketch', 'Minimisation Mindset', 'Parse Perspective', 'Ambiguity Analysis',
    'Normal Form Notions', 'PDA Principles', 'Decidability Discourse', 'Concept Capstone',
  ],
  3: [
    'Tracing Trials', 'Transition Tactics', 'Acceptance Analysis', 'Design Drills',
    'Conversion Circuit', 'Closure Combat', 'Derivation Dynamics', 'Tree Traversal Trials',
    'Stack Simulation', 'Tape Tracing', 'Halting Hunt', 'Reduction Routes',
    'Membership Mechanics', 'Pumping Practice', 'Equivalence Exercises', 'Minimise Mission',
    'Grammar Generation', 'Normalise Now', 'Transducer Tasks', 'Application Apex',
  ],
  4: [
    'Advanced Automata', 'Complex Conversions', 'Ambiguity Arena', 'Pumping Puzzles',
    'Minimisation Maze', 'Subset Storm', 'Derivation Depths', 'Stack Strategies',
    'Turing Traps', 'Computability Crucible', 'Reduction Rigour', 'Complexity Climb',
    'Formal Proof Forge', 'Counterexample Craft', 'Invariant Insight', 'Diagonal Dilemma',
    'Closure Conflicts', 'Normal Form Nexus', 'Machine Mastery', 'Advanced Ascent',
  ],
  5: [
    'Master Opener', 'Full Syllabus One', 'Syllabus Sweep', 'Hard Mode Alpha',
    'Exam Simulation A', 'Exam Simulation B', 'Mixed Mastery', 'Precision Protocol',
    'Deep Automata', 'Deep Grammar', 'Deep Computability', 'Hard Mode Beta',
    'Exam Simulation C', 'Exam Simulation D', 'Elite Eight', 'Pressure Test',
    'Comprehensive Combat', 'Exam Simulation E', 'Master Gauntlet', 'Grand Finale',
  ],
}

export const DAA_TEST_NAMES: Record<number, string[]> = {
  1: [
    'Cost of Computation', 'Order Notation Openers', 'Big-O Basics', 'Growth Rate Gauntlet',
    'Theta Tightness', 'Omega Lower Bounds', 'Recurrence Roots', 'Master Theorem Warm-up',
    'Case Analysis Craft', 'Space Time Trade-offs', 'Algorithm Anatomy', 'Specification Drills',
    'Worst Case Wisdom', 'Average Case Arena', 'Log Scale Logic', 'Polynomial Patterns',
    'Exponential Edge', 'Amortised Accounting', 'Analysis Ascent', 'Foundation Finale',
  ],
  2: [
    'Divide and Conquer Design', 'Binary Search Bounds', 'Merge Mechanics', 'Pivot Principles',
    'Partition Puzzles', 'Comparison Count', 'Decision Tree Depth', 'Lower Bound Logic',
    'Elementary Sort Study', 'Insertion Insight', 'Selection Sweep', 'Bubble Boundaries',
    'Heap Anatomy', 'Sift Strategy', 'Karatsuba Kickoff', 'Max-Min Mechanics',
    'Stability Study', 'In-Place Invariants', 'Sorting Synthesis', 'Concept Capstone',
  ],
  3: [
    'Optimal Substructure', 'Overlap Overdrive', 'Table Tactics', 'Memo vs Tabulate',
    'Change Making Mechanics', 'Coin Choice Counts', 'Assembly Line Analysis', 'Knapsack Recurrence',
    'Capacity Craft', 'Chain Multiplication', 'Parenthesisation Puzzles', 'Catalan Counting',
    'Subsequence Strategy', 'LCS Trace', 'Edit Distance Drills', 'OBST Optimisation',
    'State Design', 'Predecessor Paths', 'DP Depth', 'Application Apex',
  ],
  4: [
    'Greedy Choice Groundwork', 'Exchange Arguments', 'Activity Ordering', 'Density Decisions',
    'Deadline Discipline', 'Huffman Heights', 'Prefix Code Proofs', 'Traversal Tactics',
    'BFS Breadth', 'DFS Depth', 'Component Counting', 'Kruskal Cuts',
    'Prim Growth', 'Dijkstra Distances', 'Negative Edge Notions', 'Floyd-Warshall Fill',
    'Graph Gauntlet', 'Weighted Wisdom', 'Greedy Grandmaster', 'Advanced Ascent',
  ],
  5: [
    'State Space Search', 'Prune Protocol', 'Queen Placement', 'Diagonal Discipline',
    'Hamiltonian Hunt', 'Subset Sum Search', 'Colour Constraints', 'Chromatic Counts',
    'Bound Design', 'Incumbent Insight', 'TSP Tour Tactics', 'Reduced Cost Rules',
    'Assignment Analysis', 'Hungarian Handles', 'Branch and Bound Beta', 'Exponential Etiquette',
    'Search Tree Sweep', 'Bounding Benchmarks', 'Pruning Precision', 'Master Gauntlet',
  ],
  6: [
    'P versus NP Primer', 'Certificate Craft', 'Verifier Vault', 'Reduction Routes',
    'Cook-Levin Cornerstone', 'Three-SAT Standard', 'Clique Conversions', 'Vertex Cover Vault',
    'Weakly Hard Wisdom', 'Pseudo-Polynomial Paths', 'Ratio Reasoning', 'Approximation Axioms',
    'Bin Packing Bounds', 'First Fit Facts', 'Las Vegas Logic', 'Monte Carlo Measures',
    'Selection Statistics', 'Randomised Reasoning', 'Intractability Insight', 'Grand Finale',
  ],
}

export const TEST_NAMES_BY_SUBJECT: Record<SubjectId, Record<number, string[]>> = {
  tafl: TAFL_TEST_NAMES,
  daa: DAA_TEST_NAMES,
}

export const UNIT_PATTERNS_BY_SUBJECT: Record<SubjectId, UnitId[][]> = {
  tafl: [
    [1], [2], [3], [4], [5], [6], [7],
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
    [1, 2, 3], [3, 4, 5], [5, 6, 7], [2, 3, 4], [4, 5, 6],
    [1, 3, 5], [2, 4, 6], [1, 2, 3, 4], [4, 5, 6, 7],
    [1, 2, 3, 4, 5, 6, 7],
  ],
  daa: [
    [1], [2], [3], [4], [5], [6],
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6],
    [1, 3, 5], [2, 4, 6], [1, 2], [3, 4], [5, 6],
    [1, 2, 3, 4], [3, 4, 5, 6], [1, 2, 5, 6],
    [1, 2, 3, 4, 5, 6],
  ],
}

export const UNIT_BY_STAGE_BY_SUBJECT: Record<SubjectId, Record<number, number[]>> = {
  tafl: {
    1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    3: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    4: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    5: [19, 20, 21, 22],
  },
  daa: {
    1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    2: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    3: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    4: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    5: [18, 19, 20, 21, 22, 23],
  },
}
