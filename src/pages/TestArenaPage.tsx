import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Swords, Play, RotateCcw, CheckCircle2, Clock, Filter, ArrowUpDown, Layers } from 'lucide-react'
import { useArena } from '../store/arena'
import { TESTS_BY_SUBJECT, testsForStage } from '../data/tests'
import { useActiveSubject } from '../hooks/useSubject'
import { stagesFor, unitsFor } from '../data/syllabus'
import { Button, Card, Badge, ProgressBar, Segmented, EmptyState } from '../components/common/ui'
import { Stagger, StaggerItem, HoverLift, Reveal } from '../components/common/motion'
import type { StageId } from '../types'

type FilterKey = 'all' | 'unattempted' | 'completed' | 'inprogress' | `stage-${StageId}`
type SortKey = 'number' | 'difficulty' | 'score'

const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Mixed: 2, Hard: 3 }

export default function TestArenaPage() {
  const data = useArena((s) => s.data)
  const subject = useActiveSubject()
  const TESTS = TESTS_BY_SUBJECT[subject]
  const STAGES = stagesFor(subject)
  const unitCount = unitsFor(subject).length
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('number')
  const [query, setQuery] = useState(params.get('q') ?? '')

  const attemptByTest = useMemo(() => {
    const map = new Map<string, { count: number; best: number; latest: number }>()
    for (const a of data.attempts) {
      const existing = map.get(a.testId)
      if (!existing) map.set(a.testId, { count: 1, best: a.score, latest: a.submittedAt })
      else {
        map.set(a.testId, {
          count: existing.count + 1,
          best: Math.max(existing.best, a.score),
          latest: Math.max(existing.latest, a.submittedAt),
        })
      }
    }
    return map
  }, [data.attempts])

  const activeTests = useMemo(() => {
    const set = new Set<string>()
    for (const key of Object.keys(data.activeSessions)) {
      const s = data.activeSessions[key]
      if (s.mode === 'standard') set.add(s.testId)
    }
    return set
  }, [data.activeSessions])

  const filtered = useMemo(() => {
    let list = TESTS
    if (filter === 'unattempted') list = list.filter((t) => !attemptByTest.has(t.id))
    else if (filter === 'completed') list = list.filter((t) => attemptByTest.has(t.id))
    else if (filter === 'inprogress') list = list.filter((t) => activeTests.has(t.id))
    else if (filter.startsWith('stage-')) {
      const stage = Number(filter.split('-')[1]) as StageId
      list = testsForStage(subject, stage)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          String(t.number) === q ||
          t.units.some((u) => `unit ${u}`.includes(q) || `u${u}` === q) ||
          t.topics.some((topic) => topic.toLowerCase().includes(q)),
      )
    }

    const sorted = [...list]
    if (sort === 'number') sorted.sort((a, b) => a.number - b.number)
    else if (sort === 'difficulty')
      sorted.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] || a.number - b.number)
    else sorted.sort((a, b) => (attemptByTest.get(b.id)?.best ?? -1) - (attemptByTest.get(a.id)?.best ?? -1) || a.number - b.number)

    return sorted
  }, [filter, query, sort, attemptByTest, activeTests])

  const completedCount = useMemo(() => TESTS.filter((t) => attemptByTest.has(t.id)).length, [attemptByTest])

  const filters: { value: FilterKey; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: TESTS.length },
    { value: 'unattempted', label: 'Unattempted', count: TESTS.length - completedCount },
    { value: 'completed', label: 'Completed', count: completedCount },
    { value: 'inprogress', label: 'In progress', count: activeTests.size },
    ...STAGES.map((s) => ({ value: `stage-${s.id}` as FilterKey, label: s.name, count: testsForStage(subject, s.id).length })),
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Test Arena</h2>
          <p className="text-[13px] text-muted mt-0.5">
            100 exams across five stages. 30 questions each, 30 marks, 30 minutes.
          </p>
        </div>
        <Card className="px-3.5 py-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-faint">Progress</div>
              <div className="text-[15px] font-semibold mono">{completedCount} / 100</div>
            </div>
            <div className="w-20">
              <ProgressBar value={completedCount} max={100} height={5} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
        <div className="flex items-center gap-2 h-9 px-3 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--border-strong)] lg:w-72">
          <Search size={14} className="text-[var(--text-faint)] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by number, unit or topic…"
            aria-label="Search tests"
            className="bg-transparent outline-none text-[13px] w-full placeholder:text-[var(--text-faint)]"
          />
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <Segmented options={filters} value={filter} onChange={setFilter} size="sm" />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown size={13} className="text-[var(--text-faint)]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort tests"
            className="h-8 px-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[12px] outline-none"
          >
            <option value="number">Number</option>
            <option value="difficulty">Difficulty</option>
            <option value="score">Best score</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Filter size={20} />}
            title="No tests match"
            description="Try a different filter or clear the search query."
            action={<Button size="sm" variant="outline" onClick={() => { setFilter('all'); setQuery('') }}>Reset filters</Button>}
          />
        </Card>
      ) : (
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" gap={0.03}>
          {filtered.map((t) => {
            const attempt = attemptByTest.get(t.id)
            const inProgress = activeTests.has(t.id)
            const stage = STAGES.find((s) => s.id === t.stage)!

            return (
              <StaggerItem key={t.id} className="h-full">
                <HoverLift className="h-full">
                <Card hover className="p-3.5 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-semibold mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] shrink-0">
                        {t.id}
                      </span>
                      <Badge tone={t.difficulty === 'Hard' ? 'danger' : t.difficulty === 'Easy' ? 'success' : 'warning'}>
                        {t.difficulty}
                      </Badge>
                    </div>
                    {attempt && (
                      <div className="text-right shrink-0">
                        <div className="text-[13px] font-semibold mono">{attempt.best}/30</div>
                        <div className="text-[9.5px] text-faint uppercase tracking-wider">best</div>
                      </div>
                    )}
                  </div>

                  <h3 className="text-[13.5px] font-semibold leading-snug mb-1.5">{t.name}</h3>

                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10.5px] text-faint">{stage.name}</span>
                    <span className="text-[10px] text-[var(--border-strong)]">·</span>
                    <span className="text-[10.5px] text-faint">
                      {t.units.length === unitCount ? 'Full syllabus' : `U${t.units.join(', U')}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {t.topics.slice(0, 2).map((topic) => (
                      <span key={topic} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-faint)] truncate max-w-[140px]">
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2.5 text-[10.5px] text-faint">
                      <span className="flex items-center gap-1"><Layers size={10} />30q</span>
                      <span className="flex items-center gap-1"><Clock size={10} />30m</span>
                      {attempt && <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-[var(--success)]" />{attempt.count}×</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {attempt && (
                        <button
                          onClick={() => {
                            const latest = data.attempts
                              .filter((a) => a.testId === t.id)
                              .sort((a, b) => b.submittedAt - a.submittedAt)[0]
                            if (latest) navigate(`/results/${latest.id}`)
                          }}
                          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] px-1.5"
                        >
                          Review
                        </button>
                      )}
                      <Button
                        size="sm"
                        variant={inProgress ? 'secondary' : attempt ? 'outline' : 'primary'}
                        icon={inProgress ? <RotateCcw size={12} /> : <Play size={12} />}
                        onClick={() => navigate(`/exam/${t.id}${inProgress ? '?resume=1' : ''}`)}
                      >
                        {inProgress ? 'Resume' : attempt ? 'Retake' : 'Start'}
                      </Button>
                    </div>
                  </div>
                </Card>
                </HoverLift>
              </StaggerItem>
            )
          })}
        </Stagger>
      )}

      <Reveal>
      <Card className="p-3.5">
        <div className="flex items-start gap-2.5">
          <Swords size={15} className="text-[var(--accent)] mt-0.5 shrink-0" />
          <div className="text-[12px] text-muted leading-relaxed">
            <span className="font-medium text-[var(--text)]">Stage progression:</span>{' '}
            {STAGES.map((s, i) => (
              <span key={s.id}>
                {i > 0 && ' '}
                <span className="text-[var(--text)]">{s.name}</span> ({s.range[0]}–{s.range[1]}) — {s.goal}
              </span>
            ))}
          </div>
        </div>
      </Card>
      </Reveal>
    </div>
  )
}
