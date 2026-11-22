import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Repeat, Play, Bookmark, AlertTriangle, CheckCircle2, Trash2, Clock, CalendarClock, Layers,
} from 'lucide-react'
import { useArena } from '../store/arena'
import { QUESTION_BY_ID } from '../data/questionBank'
import { Button, Card, Badge, ProgressBar, Segmented, EmptyState } from '../components/common/ui'
import { Stagger, StaggerItem, Reveal, AnimatedNumber } from '../components/common/motion'
import { PracticeEngine } from '../components/practice/PracticeEngine'
import {
  revisionBuckets, dueRevisionQuestions, markMastered, removeRevision, REVISION_INTERVALS_DAYS,
} from '../services/revision'
import { saveData } from '../services/storage'
import type { AppData, Question, RevisionItem } from '../types'

type Filter = 'due' | 'wrong' | 'saved' | 'mastered' | 'all'

const DAY_MS = 24 * 60 * 60 * 1000

function mutateRevision(mutator: (data: AppData) => void) {
  const store = useArena.getState()
  const next: AppData = {
    ...store.data,
    revision: [...store.data.revision],
    savedQuestions: [...store.data.savedQuestions],
  }
  mutator(next)
  saveData(next)
  useArena.setState({ data: next })
}

function dueLabel(item: RevisionItem): { text: string; tone: 'danger' | 'warning' | 'neutral' | 'success' } {
  if (item.mastered) return { text: 'Mastered', tone: 'success' }
  const delta = item.dueAt - Date.now()
  if (delta <= 0) {
    const overdueDays = Math.floor(-delta / DAY_MS)
    return {
      text: overdueDays >= 1 ? `Overdue by ${overdueDays}d` : 'Due now',
      tone: overdueDays >= 1 ? 'danger' : 'warning',
    }
  }
  const days = Math.ceil(delta / DAY_MS)
  return { text: `Due in ${days}d`, tone: 'neutral' }
}

export default function RevisionPage() {
  const data = useArena((s) => s.data)
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('due')
  const [questions, setQuestions] = useState<Question[] | null>(null)

  const buckets = useMemo(() => revisionBuckets(data), [data])

  const items = useMemo(() => {
    if (filter === 'due') return buckets.due
    if (filter === 'wrong') return buckets.wrong
    if (filter === 'saved') return buckets.saved
    if (filter === 'mastered') return buckets.mastered
    return buckets.all
  }, [filter, buckets])

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.mastered !== b.mastered) return a.mastered ? 1 : -1
        return a.dueAt - b.dueAt
      }),
    [items],
  )

  const masteredCount = buckets.mastered.length
  const totalTracked = buckets.all.length
  const masteryPct = totalTracked ? (masteredCount / totalTracked) * 100 : 0

  const startSession = () => {
    const due = dueRevisionQuestions(data, 25)
    const pool = due.length ? due : sorted.map((r) => QUESTION_BY_ID[r.questionId]).filter((q): q is Question => Boolean(q))
    setQuestions(pool.slice(0, 25))
  }

  if (questions) {
    return (
      <div className="max-w-3xl mx-auto">
        <PracticeEngine
          questions={questions}
          mode="revision"
          title="Revision session"
          subtitle={`${questions.length} questions · spaced repetition · no timer`}
          emptyAction={{ label: 'Open Test Arena', to: '/arena' }}
        />
        <div className="mt-3 text-center">
          <Button variant="ghost" size="sm" onClick={() => setQuestions(null)}>← Back to revision center</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Revision Center</h2>
          <p className="text-[13px] text-muted mt-0.5">
            Spaced repetition on your wrong answers and saved questions, scheduled at {REVISION_INTERVALS_DAYS.join(' / ')} day intervals.
          </p>
        </div>
        <Button variant="primary" icon={<Play size={14} />} onClick={startSession} disabled={sorted.length === 0}>
          Start revision ({Math.min(25, sorted.length)})
        </Button>
      </div>

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StaggerItem>
        <Card className="p-3.5 h-full">
          <div className="flex items-center gap-1.5 mb-1.5 text-[var(--warning)]">
            <CalendarClock size={13} />
            <span className="text-[11px] uppercase tracking-wider text-faint">Due now</span>
          </div>
          <div className="text-xl font-semibold mono"><AnimatedNumber value={buckets.due.length} /></div>
        </Card>
        </StaggerItem>
        <StaggerItem>
        <Card className="p-3.5 h-full">
          <div className="flex items-center gap-1.5 mb-1.5 text-[var(--danger)]">
            <AlertTriangle size={13} />
            <span className="text-[11px] uppercase tracking-wider text-faint">From wrong answers</span>
          </div>
          <div className="text-xl font-semibold mono"><AnimatedNumber value={buckets.wrong.length} /></div>
        </Card>
        </StaggerItem>
        <StaggerItem>
        <Card className="p-3.5 h-full">
          <div className="flex items-center gap-1.5 mb-1.5 text-[var(--accent)]">
            <Bookmark size={13} />
            <span className="text-[11px] uppercase tracking-wider text-faint">Saved</span>
          </div>
          <div className="text-xl font-semibold mono"><AnimatedNumber value={buckets.saved.length} /></div>
        </Card>
        </StaggerItem>
        <StaggerItem>
        <Card className="p-3.5 h-full">
          <div className="flex items-center gap-1.5 mb-1.5 text-[var(--success)]">
            <CheckCircle2 size={13} />
            <span className="text-[11px] uppercase tracking-wider text-faint">Mastered</span>
          </div>
          <div className="text-xl font-semibold mono"><AnimatedNumber value={masteredCount} /></div>
        </Card>
        </StaggerItem>
      </Stagger>

      {totalTracked > 0 && (
        <Reveal>
        <Card className="p-3.5">
          <div className="flex items-center justify-between text-[11.5px] mb-1.5">
            <span className="text-muted">Queue mastery</span>
            <span className="mono text-faint">{masteredCount} / {totalTracked} cleared</span>
          </div>
          <ProgressBar value={masteryPct} tone="var(--success)" height={5} />
        </Card>
        </Reveal>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'due', label: 'Due', count: buckets.due.length },
            { value: 'wrong', label: 'Wrong', count: buckets.wrong.length },
            { value: 'saved', label: 'Saved', count: buckets.saved.length },
            { value: 'mastered', label: 'Mastered', count: buckets.mastered.length },
            { value: 'all', label: 'All', count: buckets.all.length },
          ]}
        />
        <span className="text-[11px] text-faint">
          {sorted.length} item{sorted.length === 1 ? '' : 's'}
        </span>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <EmptyState
            icon={filter === 'mastered' ? <CheckCircle2 size={20} /> : <Repeat size={20} />}
            title={filter === 'mastered' ? 'Nothing mastered yet' : 'This queue is empty'}
            description={
              filter === 'mastered'
                ? 'Answer a revision item correctly enough times and it graduates to mastered here.'
                : 'Wrong answers from exams and questions you bookmark appear here automatically, sorted by urgency.'
            }
            action={
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={() => navigate('/arena')}>Take a test</Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/practice')}>Practice a unit</Button>
              </div>
            }
          />
        </Card>
      ) : (
        <Stagger className="space-y-2" gap={0.02}>
          {sorted.map((item) => {
            const q = QUESTION_BY_ID[item.questionId]
            if (!q) return null
            const due = dueLabel(item)
            const stage = Math.min(REVISION_INTERVALS_DAYS.length, item.intervalIndex + 1)
            return (
              <StaggerItem key={item.questionId} y={8}>
              <Card className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <Badge tone={item.source === 'saved' ? 'accent' : 'danger'}>
                        {item.source === 'saved' ? <Bookmark size={10} /> : <AlertTriangle size={10} />}
                        {item.source === 'saved' ? 'Saved' : 'Wrong answer'}
                      </Badge>
                      <Badge tone="neutral">U{q.unit}</Badge>
                      <span className="text-[10.5px] text-faint truncate">{q.topic}</span>
                      <Badge tone={due.tone} className="ml-auto">{due.text}</Badge>
                    </div>
                    <p className="text-[12.5px] leading-relaxed line-clamp-2 mb-1.5">{q.question}</p>
                    <div className="flex items-center gap-2.5 text-[10.5px] text-faint mono">
                      <span className="flex items-center gap-1">
                        <Layers size={10} /> stage {stage}/{REVISION_INTERVALS_DAYS.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={10} /> {item.successes} correct
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {item.lapses} lapse{item.lapses === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuestions([q])}
                    >
                      Practise
                    </Button>
                    {!item.mastered && (
                      <button
                        onClick={() => mutateRevision((d) => markMastered(d, item.questionId))}
                        className="text-[10.5px] text-[var(--success)] hover:underline"
                      >
                        Mark mastered
                      </button>
                    )}
                    <button
                      onClick={() => mutateRevision((d) => removeRevision(d, item.questionId))}
                      className="text-[10.5px] text-faint hover:text-[var(--danger)] inline-flex items-center gap-1"
                      aria-label="Remove from revision queue"
                    >
                      <Trash2 size={10} /> Remove
                    </button>
                  </div>
                </div>
              </Card>
              </StaggerItem>
            )
          })}
        </Stagger>
      )}

      <Reveal>
      <Card className="p-3.5">
        <div className="text-[11.5px] text-muted leading-relaxed">
          <span className="font-medium text-[var(--text)]">How scheduling works:</span> a wrong answer enters the queue due
          immediately. Each correct revision advances the interval (1 → 3 → 7 → 14 → 30 days); a lapse resets it. After four
          correct reviews at the longest interval the item is marked mastered and stops appearing.
        </div>
      </Card>
      </Reveal>
    </div>
  )
}
