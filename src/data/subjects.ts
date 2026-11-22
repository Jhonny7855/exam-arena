import type { SubjectId } from '../types'

export interface SubjectMeta {
  id: SubjectId
  code: string
  name: string
  shortName: string
  tagline: string
  description: string
  accent: string
  accentSecondary: string
  courseCode: string
  semester: string
  icon: 'automata' | 'algorithms'
}

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'tafl',
    code: 'TAFL',
    name: 'Theory of Automata & Formal Languages',
    shortName: 'TAFL',
    tagline: 'Think in states. Solve in logic.',
    description:
      'Seven units covering sets and proofs, regular languages, finite automata, context-free grammars, pushdown automata, Turing machines, and computability.',
    accent: '#4f7cff',
    accentSecondary: '#8b5cf6',
    courseCode: '01AI0505',
    semester: 'Semester 5 · CE-AI',
    icon: 'automata',
  },
  {
    id: 'daa',
    code: 'DAA',
    name: 'Design and Analysis of Algorithms',
    shortName: 'DAA',
    tagline: 'Measure the cost. Choose the strategy.',
    description:
      'Six units covering algorithm analysis and asymptotics, divide and conquer, dynamic programming, greedy methods and graph algorithms, backtracking and branch & bound, and NP-completeness with approximation.',
    accent: '#f59e0b',
    accentSecondary: '#ef4444',
    courseCode: 'DAA',
    semester: 'Algorithms Track',
    icon: 'algorithms',
  },
]

export const SUBJECT_BY_ID: Record<SubjectId, SubjectMeta> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s]),
) as Record<SubjectId, SubjectMeta>

export const DEFAULT_SUBJECT: SubjectId = 'tafl'

export function subjectById(id: SubjectId): SubjectMeta {
  return SUBJECT_BY_ID[id] ?? SUBJECT_BY_ID[DEFAULT_SUBJECT]
}

export const SUBJECT_IDS: SubjectId[] = SUBJECTS.map((s) => s.id)
