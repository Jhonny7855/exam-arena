import { motion } from 'framer-motion'
import { Check, Cpu, Network } from 'lucide-react'
import { SUBJECTS } from '../../data/subjects'
import { useActiveSubject } from '../../hooks/useSubject'
import { useArena } from '../../store/arena'
import type { SubjectId } from '../../types'

const ICONS = {
  automata: Network,
  algorithms: Cpu,
} as const

export function SubjectSwitcher({ compact = false }: { compact?: boolean }) {
  const active = useActiveSubject()
  const setSubject = useArena((s) => s.setSubject)

  if (compact) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-[var(--surface-2)] p-0.5 border border-[var(--border)]">
        {SUBJECTS.map((s) => {
          const isActive = s.id === active
          return (
            <button
              key={s.id}
              onClick={() => setSubject(s.id as SubjectId)}
              aria-pressed={isActive}
              title={s.name}
              className={`h-7 px-2 rounded-md text-[11px] font-semibold tracking-wide transition-colors ${
                isActive ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-faint)] hover:text-[var(--text)]'
              }`}
            >
              {s.code}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {SUBJECTS.map((s) => {
        const Icon = ICONS[s.icon]
        const isActive = s.id === active
        return (
          <button
            key={s.id}
            onClick={() => setSubject(s.id as SubjectId)}
            aria-pressed={isActive}
            className={`relative w-full flex items-center gap-2.5 px-2.5 h-11 rounded-lg border text-left transition-colors ${
              isActive
                ? 'border-[var(--border-strong)] bg-[var(--surface-2)]'
                : 'border-transparent hover:bg-[var(--surface-2)]'
            }`}
          >
            <span
              className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
              style={{
                background: `color-mix(in srgb, ${s.accent} 16%, transparent)`,
                color: s.accent,
              }}
            >
              <Icon size={14} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-semibold leading-tight truncate">{s.code}</span>
              <span className="block text-[10px] text-faint leading-tight truncate">{s.shortName === s.code ? s.courseCode : s.name}</span>
            </span>
            {isActive && (
              <motion.span
                layoutId="subject-active"
                className="h-4 w-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: s.accent }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <Check size={10} className="text-white" strokeWidth={3} />
              </motion.span>
            )}
          </button>
        )
      })}
    </div>
  )
}
