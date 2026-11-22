import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Play, AlertTriangle, Lightbulb, BookOpen, ChevronDown } from 'lucide-react'
import { useArena, unitPracticeQuestions } from '../store/arena'
import { useActiveSubject } from '../hooks/useSubject'
import { unitsFor } from '../data/syllabus'
import { questionsOfSubject } from '../data/questionBank'
import { computeTopicPerformance, MASTERY_TONE } from '../services/analytics'
import { Button, Card, Badge, ProgressBar } from '../components/common/ui'
import { PracticeEngine } from '../components/practice/PracticeEngine'
import type { UnitId } from '../types'

export default function UnitDetailPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const data = useArena((s) => s.data)
  const subject = useActiveSubject()
  const unit = unitsFor(subject).find((u) => u.id === Number(unitId))
  const [openTopic, setOpenTopic] = useState<string | null>(null)
  const [session, setSession] = useState<{ count: number; topic?: string } | null>(null)

  const topicPerf = useMemo(() => computeTopicPerformance(data, subject), [data, subject])

  const sessionQuestions = useMemo(() => {
    if (!session || !unit) return []
    if (session.topic) {
      const pool = questionsOfSubject(subject).filter((q) => q.unit === unit.id && q.topic === session.topic)
      return pool.slice(0, session.count)
    }
    return unitPracticeQuestions(subject, unit.id, session.count)
  }, [session, unit])

  if (!unit) {
    return (
      <Card className="p-6 text-center">
        <p className="text-[13px] text-muted mb-4">Unit not found.</p>
        <Button variant="primary" onClick={() => navigate('/practice')}>Back to units</Button>
      </Card>
    )
  }

  if (session) {
    return (
      <div className="max-w-3xl mx-auto">
        <PracticeEngine
          questions={sessionQuestions}
          mode="unit"
          title={session.topic ? `${session.topic} · ${sessionQuestions.length} questions` : `${unit.title} · ${sessionQuestions.length} questions`}
          subtitle={`Unit ${unit.id} · instant feedback`}
        />
        <div className="mt-3 text-center">
          <Button variant="ghost" size="sm" onClick={() => setSession(null)}>← Back to unit overview</Button>
        </div>
      </div>
    )
  }

  const unitTopics = topicPerf.filter((t) => t.unit === unit.id)
  const answered = unitTopics.reduce((s, t) => s + t.answered, 0)
  const correct = unitTopics.reduce((s, t) => s + t.correct, 0)
  const accuracy = answered ? (correct / answered) * 100 : 0
  const totalQuestions = questionsOfSubject(subject).filter((q) => q.unit === unit.id).length

  return (
    <div className="space-y-4 max-w-4xl">
      <button onClick={() => navigate('/practice')} className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-[var(--text)]">
        <ArrowLeft size={13} /> All units
      </button>

      <div
        className="relative overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5"
        style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${unit.accent} 10%, var(--surface)), var(--surface))` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="neutral">Unit {unit.id}</Badge>
              <Badge tone="accent">{totalQuestions} questions</Badge>
            </div>
            <h2 className="text-lg font-semibold tracking-tight mb-1">{unit.title}</h2>
            <p className="text-[12.5px] text-muted max-w-xl leading-relaxed">{unit.overview}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="primary" icon={<Play size={14} />} onClick={() => setSession({ count: 10 })}>Practice</Button>
            <Button variant="outline" onClick={() => navigate('/arena')}>Unit exam</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg bg-[color-mix(in_srgb,var(--bg)_45%,transparent)] p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-faint mb-0.5">Accuracy</div>
            <div className="text-[15px] font-semibold mono">{answered ? `${Math.round(accuracy)}%` : '—'}</div>
          </div>
          <div className="rounded-lg bg-[color-mix(in_srgb,var(--bg)_45%,transparent)] p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-faint mb-0.5">Answered</div>
            <div className="text-[15px] font-semibold mono">{answered}</div>
          </div>
          <div className="rounded-lg bg-[color-mix(in_srgb,var(--bg)_45%,transparent)] p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-faint mb-0.5">Topics</div>
            <div className="text-[15px] font-semibold mono">{unit.topics.length}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {unit.topics.map((topic) => {
          const perf = unitTopics.find((t) => t.topic === topic.name)
          const open = openTopic === topic.name
          return (
            <Card key={topic.name} className="overflow-hidden">
              <button
                onClick={() => setOpenTopic(open ? null : topic.name)}
                className="w-full text-left p-3.5 flex items-center gap-3 hover:bg-[var(--surface-2)]/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[13px] font-semibold truncate">{topic.name}</h3>
                    <Badge tone={perf && perf.answered ? 'accent' : 'neutral'}>
                      {perf && perf.answered ? `${Math.round(perf.accuracy)}%` : 'Not practised'}
                    </Badge>
                  </div>
                  <p className="text-[11.5px] text-muted line-clamp-1">{topic.summary}</p>
                </div>
                <div className="hidden sm:block w-24 shrink-0">
                  <ProgressBar value={perf?.accuracy ?? 0} height={4} tone={MASTERY_TONE[perf?.mastery ?? 'Critical']} />
                </div>
                <ChevronDown size={15} className={`shrink-0 text-[var(--text-faint)] transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="px-3.5 pb-3.5 border-t border-[var(--border)] pt-3 space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BookOpen size={12} className="text-[var(--accent)]" />
                      <span className="text-[11.5px] font-semibold">Explanation</span>
                    </div>
                    <p className="text-[12.5px] text-muted leading-relaxed">{topic.summary}</p>
                  </div>

                  <div>
                    <div className="text-[11.5px] font-semibold mb-1.5">Key points</div>
                    <ul className="space-y-1">
                      {topic.keyPoints.map((point, i) => (
                        <li key={i} className="text-[12px] text-muted leading-relaxed flex gap-2">
                          <span className="text-[var(--accent)] shrink-0">·</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-[var(--warning-soft)] border border-[color-mix(in_srgb,var(--warning)_25%,transparent)] p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={12} className="text-[var(--warning)]" />
                      <span className="text-[11.5px] font-semibold text-[var(--warning)]">Common mistake</span>
                    </div>
                    <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">{topic.pitfall}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="primary" icon={<Lightbulb size={12} />} onClick={() => setSession({ count: 10, topic: topic.name })}>
                      Practise this topic
                    </Button>
                    <span className="text-[11px] text-faint">
                      {perf?.questionCount ?? 0} questions in bank · {perf?.answered ?? 0} attempted
                    </span>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[12.5px] font-medium">Ready to test this unit under exam conditions?</div>
            <p className="text-[11.5px] text-muted">30 questions, 30 minutes, scored and recorded in analytics.</p>
          </div>
          <Link to="/arena">
            <Button size="sm" variant="outline">Test Arena →</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
