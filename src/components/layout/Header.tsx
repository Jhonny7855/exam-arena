import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Search, Bell, Sun, Moon, Flame, Zap, Command } from 'lucide-react'
import { useArena } from '../../store/arena'
import { levelForXp } from '../../services/gamification'
import { TESTS_BY_SUBJECT } from '../../data/tests'
import { questionsOfSubject } from '../../data/questionBank'
import { useActiveSubject, useSubjectMeta } from '../../hooks/useSubject'
import { IconButton } from '../common/ui'
import { SubjectSwitcher } from './SubjectSwitcher'

const TITLES: Record<string, { title: string; crumb: string }> = {
  '/': { title: 'Dashboard', crumb: 'Overview' },
  '/arena': { title: 'Test Arena', crumb: 'Training' },
  '/practice': { title: 'Unit Practice', crumb: 'Training' },
  '/random': { title: 'Random Exam', crumb: 'Training' },
  '/weak': { title: 'Weak Topics', crumb: 'Training' },
  '/revision': { title: 'Revision Center', crumb: 'Training' },
  '/analytics': { title: 'Analytics', crumb: 'Performance' },
  '/achievements': { title: 'Achievements', crumb: 'Performance' },
  '/settings': { title: 'Settings', crumb: 'System' },
  '/about': { title: 'About', crumb: 'System' },
}

interface SearchResult {
  label: string
  sub: string
  to: string
}

export function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const data = useArena((s) => s.data)
  const updateSettings = useArena((s) => s.updateSettings)
  const navigate = useNavigate()
  const location = useLocation()
  const subject = useActiveSubject()
  const subjectMeta = useSubjectMeta()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const level = levelForXp(data.xp)
  const meta = TITLES[location.pathname] ?? { title: `${subjectMeta.code} Arena`, crumb: 'Arena' }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setFocused(true)
        const input = boxRef.current?.querySelector('input')
        input?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results: SearchResult[] = query.trim().length < 2 ? [] : (() => {
    const q = query.toLowerCase()
    const out: SearchResult[] = []
    for (const t of TESTS_BY_SUBJECT[subject]) {
      if (out.length >= 5) break
      if (t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || String(t.number) === q) {
        out.push({ label: t.name, sub: `Test ${t.number} · ${t.units.length} units`, to: `/arena?q=${encodeURIComponent(t.id)}` })
      }
    }
    for (const topic of new Set(questionsOfSubject(subject).map((x) => x.topic))) {
      if (out.length >= 9) break
      if (topic.toLowerCase().includes(q)) {
        out.push({ label: topic, sub: 'Topic', to: `/practice?topic=${encodeURIComponent(topic)}` })
      }
    }
    return out
  })()

  const isDark = data.settings.theme === 'dark'

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl">
      <div className="h-full px-4 lg:px-6 flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          aria-label="Open navigation"
          className="lg:hidden h-9 w-9 rounded-lg hover:bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 hidden sm:block">
          <div className="flex items-center gap-1.5 text-[11px] text-faint leading-none mb-1">
            <span>{meta.crumb}</span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[var(--text-muted)]">{meta.title}</span>
          </div>
          <h1 className="text-[15px] font-semibold tracking-tight leading-none truncate">{meta.title}</h1>
        </div>

        <div className="flex-1" />

        <div ref={boxRef} className="relative hidden md:block">
          <div className="flex items-center gap-2 h-9 w-56 lg:w-72 px-3 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--border-strong)] transition-colors">
            <Search size={14} className="text-[var(--text-faint)] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search tests, topics…"
              aria-label="Search tests and topics"
              className="bg-transparent outline-none text-[13px] w-full placeholder:text-[var(--text-faint)]"
            />
            <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] text-faint mono shrink-0">
              <Command size={10} />K
            </kbd>
          </div>
          {focused && results.length > 0 && (
            <div className="absolute right-0 top-11 w-80 surface-card shadow-[var(--shadow-lg)] p-1.5 z-30">
              {results.map((r) => (
                <button
                  key={r.to + r.label}
                  onClick={() => {
                    navigate(r.to)
                    setFocused(false)
                    setQuery('')
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-md hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="text-[13px] font-medium truncate">{r.label}</div>
                  <div className="text-[11px] text-faint">{r.sub}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="hidden lg:block mr-1">
            <SubjectSwitcher compact />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]" title="Current streak">
            <Flame size={13} className="text-[var(--warning)]" />
            <span className="text-[12px] font-medium mono">{data.streak.current}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]" title={`Level ${level.current.level}`}>
            <Zap size={13} className="text-[var(--accent)]" />
            <span className="text-[12px] font-medium mono">Lv {level.current.level}</span>
          </div>

          <IconButton label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>

          <div className="relative">
            <IconButton label="Notifications" onClick={() => navigate('/achievements')}>
              <Bell size={16} />
            </IconButton>
            {Object.keys(data.achievements).length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            )}
          </div>

          <button
            onClick={() => navigate('/settings')}
            aria-label="Open profile settings"
            className="ml-1 h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--secondary)] flex items-center justify-center text-white text-[12px] font-semibold shrink-0"
          >
            {data.profile.name.slice(0, 1).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  )
}
