import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Printer, AlertTriangle, BookOpen, Swords, Filter } from 'lucide-react'
import { useSubjectMeta } from '../hooks/useSubject'
import { CHEATSHEET_BY_SUBJECT } from '../data/cheatsheet'
import { unitsFor } from '../data/syllabus'
import { Button, Card, Badge, EmptyState, Segmented } from '../components/common/ui'
import { Reveal, Stagger, StaggerItem } from '../components/common/motion'

export default function CheatsheetPage() {
  const meta = useSubjectMeta()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [unitFilter, setUnitFilter] = useState<'all' | number>('all')

  const syllabus = useMemo(() => unitsFor(meta.id), [meta.id])
  const sections = useMemo(() => CHEATSHEET_BY_SUBJECT[meta.id], [meta.id])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sections
      .filter((s) => unitFilter === 'all' || s.unit === unitFilter)
      .map((s) => {
        if (!q) return s
        const formulas = s.formulas.filter(
          (f) =>
            f.label.toLowerCase().includes(q) ||
            f.formula.toLowerCase().includes(q) ||
            f.note.toLowerCase().includes(q),
        )
        const traps = s.traps.filter((t) => t.toLowerCase().includes(q))
        if (formulas.length === 0 && traps.length === 0 && !s.title.toLowerCase().includes(q)) return null
        return { ...s, formulas: formulas.length ? formulas : s.formulas, traps: traps.length ? traps : s.traps }
      })
      .filter((s): s is (typeof sections)[number] => Boolean(s))
  }, [sections, query, unitFilter])

  const totalFormulas = sections.reduce((n, s) => n + s.formulas.length, 0)
  const totalTraps = sections.reduce((n, s) => n + s.traps.length, 0)

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Cheatsheet</h2>
          <p className="text-[13px] text-muted mt-0.5">
            {meta.code} · {totalFormulas} formulas and {totalTraps} exam traps across {sections.length} units.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" icon={<Printer size={13} />} onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="outline" size="sm" icon={<Swords size={13} />} onClick={() => navigate('/arena')}>
            Test arena
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex items-center gap-2 h-9 px-3 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--border-strong)] sm:w-72">
          <Search size={14} className="text-[var(--text-faint)] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search formulas, notes or traps…"
            aria-label="Search cheatsheet"
            className="bg-transparent outline-none text-[13px] w-full placeholder:text-[var(--text-faint)]"
          />
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <Segmented
            size="sm"
            value={String(unitFilter)}
            onChange={(v) => setUnitFilter(v === 'all' ? 'all' : Number(v))}
            options={[
              { value: 'all', label: 'All units', count: sections.length },
              ...sections.map((s) => ({ value: String(s.unit), label: `U${s.unit}`, count: s.formulas.length })),
            ]}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Filter size={20} />}
            title="Nothing matches"
            description="Try a different unit or clear the search query."
            action={
              <Button size="sm" variant="outline" onClick={() => { setQuery(''); setUnitFilter('all') }}>
                Reset filters
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((section) => {
            const unit = syllabus.find((u) => u.id === section.unit)
            return (
              <Reveal key={section.unit}>
                <Card className="p-0 overflow-hidden">
                  <div
                    className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5"
                    style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${section.accent} 14%, transparent), transparent)` }}
                  >
                    <span
                      className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 mono text-[11px] font-semibold"
                      style={{ background: `color-mix(in srgb, ${section.accent} 20%, transparent)`, color: section.accent }}
                    >
                      U{section.unit}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[13.5px] font-semibold leading-tight truncate">{section.title}</h3>
                      {unit && <p className="text-[11px] text-faint leading-tight truncate">{unit.tagline}</p>}
                    </div>
                    <Badge tone="neutral" className="ml-auto shrink-0">{section.formulas.length} formulas</Badge>
                  </div>

                  <div className="p-3.5 space-y-3">
                    <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-2" gap={0.03}>
                      {section.formulas.map((f) => (
                        <StaggerItem key={f.label}>
                          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5 h-full">
                            <div className="text-[10.5px] uppercase tracking-wider text-faint mb-1">{f.label}</div>
                            <div className="mono text-[12.5px] leading-relaxed text-[var(--text)] break-words">{f.formula}</div>
                            <p className="text-[11px] text-muted leading-relaxed mt-1.5">{f.note}</p>
                          </div>
                        </StaggerItem>
                      ))}
                    </Stagger>

                    {section.traps.length > 0 && (
                      <div className="rounded-lg border border-[color-mix(in_srgb,var(--warning)_28%,transparent)] bg-[var(--warning-soft)] p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle size={12} className="text-[var(--warning)]" />
                          <span className="text-[11px] font-semibold text-[var(--warning)] uppercase tracking-wider">Exam traps</span>
                        </div>
                        <ul className="space-y-1">
                          {section.traps.map((t) => (
                            <li key={t} className="text-[11.5px] text-[var(--text-muted)] leading-relaxed flex gap-1.5">
                              <span className="text-[var(--warning)] shrink-0">·</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<BookOpen size={12} />}
                        onClick={() => navigate(`/practice/${section.unit}`)}
                      >
                        Practise this unit
                      </Button>
                    </div>
                  </div>
                </Card>
              </Reveal>
            )
          })}
        </div>
      )}

      <Card className="p-3.5">
        <p className="text-[11.5px] text-muted leading-relaxed">
          <span className="font-medium text-[var(--text)]">How to use this:</span> read a unit's formulas once, then run a
          Foundation-stage test on that unit. Every wrong answer here is cheaper than a wrong answer in the exam — the traps
          listed are the exact mistakes the question bank is built to catch.
        </p>
      </Card>
    </div>
  )
}
