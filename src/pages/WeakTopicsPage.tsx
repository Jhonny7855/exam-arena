import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, AlertTriangle, Play, TrendingDown, Clock, SkipForward, RefreshCw } from 'lucide-react'
import { useArena, weakTrainingQuestions } from '../store/arena'
import { useActiveSubject } from '../hooks/useSubject'
import { computeWeakTopics, MASTERY_TONE } from '../services/analytics'
import { unitsFor } from '../data/syllabus'
import { Button, Card, Badge, ProgressBar, EmptyState } from '../components/common/ui'
import { PracticeEngine } from '../components/practice/PracticeEngine'
import type { Question } from '../types'

export default function WeakTopicsPage() {
  const data = useArena((s) => s.data)
  const subject = useActiveSubject()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[] | null>(null)

  const weak = useMemo(() => computeWeakTopics(data, subject), [data, subject])
  const syllabus = useMemo(() => unitsFor(subject), [subject])
  const critical = weak.filter((w) => w.mastery === 'Critical' || w.mastery === 'Weak')
  const unpractised = weak.filter((w) => w.answered === 0)

  if (questions) {
    return (
      <div className="max-w-3xl mx-auto">
        <PracticeEngine
          questions={questions}
          mode="weak"
          title="Weakness Training"
          subtitle="Targeted set built from your lowest-accuracy topics"
          emptyAction={{ label: 'Go to Test Arena', to: '/arena' }}
        />
        <div className="mt-3 text-center">
          <Button variant="ghost" size="sm" onClick={() => setQuestions(null)}>← Back to weakness report</Button>
        </div>
      </div>
    )
  }

  if (data.attempts.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Weak Topics</h2>
          <p className="text-[13px] text-muted mt-0.5">Rule-based weakness detection from your real attempt history.</p>
        </div>
        <Card>
          <EmptyState
            icon={<Target size={20} />}
            title="No performance data yet"
            description="Weakness detection needs attempts. Complete an exam or a practice session and this page will identify exactly which topics to attack."
            action={<Button variant="primary" size="sm" onClick={() => navigate('/arena')}>Take your first test</Button>}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Weak Topics</h2>
          <p className="text-[13px] text-muted mt-0.5">
            {weak.length} topic{weak.length === 1 ? '' : 's'} flagged from accuracy, skipped questions and answer speed.
          </p>
        </div>
        <Button variant="primary" icon={<Play size={14} />} onClick={() => setQuestions(weakTrainingQuestions(subject))}>
          Start targeted practice
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5 text-[var(--danger)]">
            <AlertTriangle size={13} />
            <span className="text-[11px] uppercase tracking-wider text-faint">Critical + weak</span>
          </div>
          <div className="text-xl font-semibold mono">{critical.length}</div>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5 text-[var(--warning)]">
            <SkipForward size={13} />
            <span className="text-[11px] uppercase tracking-wider text-faint">Unpractised</span>
          </div>
          <div className="text-xl font-semibold mono">{unpractised.length}</div>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5 text-[var(--accent)]">
            <RefreshCw size={13} />
            <span className="text-[11px] uppercase tracking-wider text-faint">In revision queue</span>
          </div>
          <div className="text-xl font-semibold mono">{data.revision.filter((r) => !r.mastered).length}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13.5px] font-semibold">Priority ranking</h3>
          <span className="text-[11px] text-faint">Higher score = more urgent</span>
        </div>
        <div className="space-y-2">
          {weak.slice(0, 18).map((w, i) => {
            const unit = syllabus.find((u) => u.id === w.unit) ?? syllabus[0]
            return (
              <div key={w.topic} className="rounded-xl border border-[var(--border)] p-3 hover:border-[var(--border-strong)] transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-[11px] mono text-faint mt-0.5 w-4 shrink-0">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-[12.5px] font-medium">{w.topic}</span>
                      <Badge tone="neutral">U{w.unit}</Badge>
                      <span className="text-[10.5px] font-medium" style={{ color: MASTERY_TONE[w.mastery] }}>{w.mastery}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 max-w-[180px]">
                        <ProgressBar value={w.accuracy} height={3} tone={MASTERY_TONE[w.mastery]} />
                      </div>
                      <span className="text-[10.5px] mono text-faint">
                        {w.answered ? `${Math.round(w.accuracy)}% · ${w.answered} answered` : 'no attempts'}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <TrendingDown size={10} className="text-[var(--danger)] mt-0.5 shrink-0" />
                      <p className="text-[11px] text-muted leading-relaxed">{w.reason}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/practice/${w.unit}?topic=${encodeURIComponent(w.topic)}`)}
                    className="text-[11px] text-[var(--accent)] hover:underline shrink-0 mt-0.5"
                  >
                    Practise
                  </button>
                </div>
              </div>
            )
          })}
          {weak.length === 0 && (
            <div className="text-center py-8 text-[12.5px] text-faint">
              No weaknesses detected — every practised topic is above the threshold. Keep testing harder stages.
            </div>
          )}
        </div>
      </Card>

      <Card className="p-3.5">
        <div className="flex items-start gap-2.5">
          <Clock size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
          <div className="text-[11.5px] text-muted leading-relaxed">
            <span className="font-medium text-[var(--text)]">Detection rules:</span> a topic is flagged when accuracy is below 60%,
            when at least 3 questions were answered incorrectly, when 2 or more were skipped, or when the average answer time
            exceeds 90 seconds. Unpractised topics are surfaced so gaps do not stay invisible.
          </div>
        </div>
      </Card>
    </div>
  )
}
