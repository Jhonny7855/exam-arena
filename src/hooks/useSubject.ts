import { useArena } from '../store/arena'
import type { SubjectId } from '../types'
import { DEFAULT_SUBJECT, subjectById } from '../data/subjects'

export function useActiveSubject(): SubjectId {
  return useArena((s) => s.data.settings.activeSubject ?? DEFAULT_SUBJECT)
}

export function useSubjectMeta() {
  const subject = useActiveSubject()
  return subjectById(subject)
}
