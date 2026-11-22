import { useSubjectMeta } from '../../hooks/useSubject'

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  const meta = useSubjectMeta()
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="var(--surface-2)" stroke="var(--border-strong)" />
        <circle cx="9.5" cy="16" r="3" fill="none" stroke="var(--accent)" strokeWidth="1.8" />
        <circle cx="22.5" cy="9.5" r="2.4" fill="var(--secondary)" />
        <circle cx="22.5" cy="22.5" r="2.4" fill="none" stroke="var(--success)" strokeWidth="1.8" />
        <path d="M12.3 14.9 L20.3 10.6 M12.3 17.1 L20.3 21.4" stroke="var(--text-faint)" strokeWidth="1.4" />
      </svg>
      {!collapsed && (
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold tracking-tight leading-none">{meta.code} ARENA</div>
          <div className="text-[9.5px] text-faint tracking-[0.1em] uppercase mt-1 leading-none">Exam System</div>
        </div>
      )}
    </div>
  )
}
