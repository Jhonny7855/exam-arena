import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ListChecks, Search, Printer, Play, CheckCircle2, Filter, Swords, Eye, EyeOff } from 'lucide-react'
import { useSubjectMeta } from '../hooks/useSubject'
import { essentialsOf, essentialsStats } from '../data/essentials'
import { unitsFor } from '../data/syllabus'
import { Button, Card, Badge, EmptyState, Segmented } from '../components/common/ui'
import { Reveal, Stagger, StaggerItem } from '../components/common/motion'
import { PracticeEngine } from '../components/practice/PracticeEngine'
import type { Question } from '../types'

const DIFFICULTY_TONE = { Easy: 'success', Medium: 'warning', Hard: 'danger' } as const

export default function EssentialsPage() {
  const meta = useSubjectMeta()
  const subject = meta.id
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const syllabus = useMemo(() => unitsFor(subject), [subject])
  const all = useMemo(() => essentialsOf(subject), [subject])
  const stats = useMemo(() => essentialsStats(subject), [subject])

  const [query, setQuery] = useState('')
  const [unitFilter, setUnitFilter] = useState<string>(params.get('unit') ?? 'all')
  const [showAll, setShowAll] = useState(false)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [session, setSession] = useState<Question[] | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((item) => {
      if (unitFilter !== 'all' && item.unit !== Number(unitFilter)) return false
      if (!q) return true
      return (
        item.question.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.options.some((o) => o.toLowerCase().includes(q)) ||
        item.explanation.toLowerCase().includes(q)
      )
    })
  }, [all, query, unitFilter])

  const grouped = useMemo(
    () =>
      syllabus
        .map((unit) => ({ unit, questions: filtered.filter((q) => q.unit === unit.id) }))
        .filter((g) => g.questions.length > 0),
    [syllabus, filtered],
  )

  const isOpen = (id: string) => showAll || Boolean(revealed[id])

  const toggle = (id: string) =>
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }))

  if (session) {
    return (
      <div className="max-w-3xl mx-auto">
        <PracticeEngine
          questions={session}
          mode="practice"
          title={`${meta.code} essentials · ${session.length} questions`}
          subtitle="Most important questions · instant feedback"
          onComplete={() => undefined}
        />
        <div className="mt-3 text-center">
          <Button variant="ghost" size="sm" onClick={() => setSession(null)}>← Back to essentials</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">150 Essentials</h2>
          <p className="text-[13px] text-muted mt-0.5">
            {meta.code} · the {stats.total} questions most likely to decide your grade, across {stats.topics} topics.
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

      <div className="flex flex-wrap items-center gap-2">
        {stats.byDifficulty.map((d) => (
          <Badge key={d.difficulty} tone={DIFFICULTY_TONE[d.difficulty]}>
            {d.difficulty} · {d.count}
          </Badge>
        ))}
        <div className="flex-1" />
        <Button
          variant={showAll ? 'primary' : 'outline'}
          size="sm"
          icon={showAll ? <EyeOff size={13} /> : <Eye size={13} />}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? 'Hide answers' : 'Show answers'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Play size={13} />}
          disabled={filtered.length === 0}
          onClick={() => setSession(filtered)}
        >
          Practise {filtered.length}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex items-center gap-2 h-9 px-3 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--border-strong)] sm:w-72">
          <Search size={14} className="text-[var(--text-faint)] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, topics or options…"
            aria-label="Search essentials"
            className="bg-transparent outline-none text-[13px] w-full placeholder:text-[var(--text-faint)]"
          />
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <Segmented
            size="sm"
            value={unitFilter}
            onChange={setUnitFilter}
            options={[
              { value: 'all', label: 'All units', count: all.length },
              ...syllabus.map((u) => ({
                value: String(u.id),
                label: `U${u.id}`,
                count: all.filter((q) => q.unit === u.id).length,
              })),
            ]}
          />
        </div>
      </div>

      {grouped.length === 0 ? (
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
          {grouped.map(({ unit, questions }) => (
            <Reveal key={unit.id}>
              <Card className="p-0 overflow-hidden">
                <div
                  className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5"
                  style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${unit.accent} 14%, transparent), transparent)` }}
                >
                  <span
                    className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 mono text-[11px] font-semibold"
                    style={{ background: `color-mix(in srgb, ${unit.accent} 20%, transparent)`, color: unit.accent }}
                  >
                    U{unit.id}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[13.5px] font-semibold leading-tight truncate">{unit.title}</h3>
                    <p className="text-[11px] text-faint leading-tight truncate">{unit.tagline}</p>
                  </div>
                  <Badge tone="neutral" className="ml-auto shrink-0">{questions.length} questions</Badge>
                </div>

                <Stagger className="divide-y divide-[var(--border)]" gap={0.02}>
                  {questions.map((item, index) => {
                    const open = isOpen(item.id)
                    return (
                      <StaggerItem key={item.id}>
                        <div className="p-3.5">
                          <button
                            onClick={() => toggle(item.id)}
                            aria-expanded={open}
                            className="w-full text-left"
                          >
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              <span className="text-[10.5px] mono text-faint">Q{index + 1}</span>
                              <span className="text-[10px] text-[var(--border-strong)]">·</span>
                              <span className="text-[10.5px] text-faint truncate">{item.topic}</span>
                              <Badge tone={DIFFICULTY_TONE[item.difficulty]} className="ml-auto shrink-0">
                                {item.difficulty}
                              </Badge>
                            </div>
                            <p className="text-[13.5px] leading-relaxed">{item.question}</p>
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mt-2.5">
                            {item.options.map((opt, i) => {
                              const isAnswer = i === item.correctAnswer
                              const cls = open && isAnswer
                                ? 'border-[color-mix(in_srgb,var(--success)_50%,transparent)] bg-[var(--success-soft)]'
                                : 'border-[var(--border)] bg-[var(--surface)]'
                              return (
                                <div key={i} className={`flex items-start gap-2 rounded-lg border p-2 ${cls}`}>
                                  <span
                                    className={`h-5 w-5 rounded flex items-center justify-center text-[10.5px] font-semibold shrink-0 mono ${
                                      open && isAnswer
                                        ? 'bg-[var(--success)] text-[#04120c]'
                                        : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="text-[12.5px] leading-relaxed">{opt}</span>
                                    {open && (
                                      <p className="text-[11px] text-muted leading-relaxed mt-0.5">
                                        {item.optionExplanations[i]}
                                      </p>
                                    )}
                                  </div>
                                  {open && isAnswer && (
                                    <CheckCircle2 size={13} className="text-[var(--success)] shrink-0 mt-0.5 ml-auto" />
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {open && (
                            <div className="mt-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] p-2.5">
                              <div className="flex items-center gap-1.5 mb-1">
                                <CheckCircle2 size={12} className="text-[var(--success)]" />
                                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--success)]">
                                  Why
                                </span>
                                <span className="text-[10.5px] text-faint ml-auto mono">
                                  Answer {String.fromCharCode(65 + item.correctAnswer)}
                                </span>
                              </div>
                              <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">{item.explanation}</p>
                            </div>
                          )}
                        </div>
                      </StaggerItem>
                    )
                  })}
                </Stagger>
              </Card>
            </Reveal>
          ))}
        </div>
      )}

      <Card className="p-3.5">
        <div className="flex items-start gap-2.5">
          <ListChecks size={15} className="text-[var(--accent)] mt-0.5 shrink-0" />
          <p className="text-[11.5px] text-muted leading-relaxed">
            <span className="font-medium text-[var(--text)]">How to use this:</span> cover the answers, attempt every
            question once, then reveal and read the reasoning for anything you missed. These questions are drawn from the
            same syllabus as the 100-test arena but are kept separate so the verified test composition never changes.
          </p>
        </div>
      </Card>
    </div>
  )
}
