import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Layers, Play, ArrowRight, BookOpen } from 'lucide-react'
import { useArena, unitPracticeQuestions } from '../store/arena'
import { useActiveSubject } from '../hooks/useSubject'
import { unitsFor } from '../data/syllabus'
import { questionsOfSubject } from '../data/questionBank'
import { computeUnitPerformance, MASTERY_TONE } from '../services/analytics'
import { Button, Card, Badge, ProgressBar, SectionHeader } from '../components/common/ui'
import { Stagger, StaggerItem } from '../components/common/motion'
import { PracticeEngine } from '../components/practice/PracticeEngine'
import type { UnitId } from '../types'

type Session = { unit: UnitId; count: number } | null

export default function UnitPracticePage() {
  const data = useArena((s) => s.data)
  const subject = useActiveSubject()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [session, setSession] = useState<Session>(null)

  const units = useMemo(() => computeUnitPerformance(data, subject), [data, subject])
  const bank = useMemo(() => questionsOfSubject(subject), [subject])
  const topicFilter = params.get('topic')

  const sessionQuestions = useMemo(() => {
    if (!session) return []
    return unitPracticeQuestions(subject, session.unit, session.count)
  }, [session, subject])

  if (session) {
    const unit = unitsFor(subject).find((u) => u.id === session.unit)!
    return (
      <div className="max-w-3xl mx-auto">
        <PracticeEngine
          questions={sessionQuestions}
          mode="unit"
          title={`${unit.title} · ${session.count} questions`}
          subtitle={`Unit ${session.unit} practice · instant feedback`}
          onComplete={() => undefined}
        />
        <div className="mt-3 text-center">
          <Button variant="ghost" size="sm" onClick={() => setSession(null)}>← Back to unit selection</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Unit Practice</h2>
        <p className="text-[13px] text-muted mt-0.5">
          Drill any unit with instant feedback, full explanations and no timer.
        </p>
      </div>

      {topicFilter && (
        <Card className="p-3.5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[12px] text-faint">Filtered by topic</div>
            <div className="text-[13px] font-medium">{topicFilter}</div>
          </div>
          <Link to="/practice" className="text-[12px] text-[var(--accent)] hover:underline">Clear</Link>
        </Card>
      )}

      <Stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" gap={0.04}>
        {unitsFor(subject).map((unit) => {
          const perf = units.find((u) => u.unit === unit.id)
          const topicPool = topicFilter
            ? bank.filter((q) => q.unit === unit.id && q.topic === topicFilter)
            : []
          const available = topicPool.length || perf?.available || 0

          return (
            <StaggerItem key={unit.id}>
              <Card hover className="p-4 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-semibold mono"
                      style={{ background: `color-mix(in srgb, ${unit.accent} 14%, transparent)`, color: unit.accent }}
                    >
                      U{unit.id}
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold leading-tight">{unit.title}</h3>
                      <p className="text-[10.5px] text-faint">{unit.topics.length} topics · {available} questions</p>
                    </div>
                  </div>
                  <Badge tone={perf?.answered ? 'accent' : 'neutral'}>{perf?.answered ? perf.mastery : 'New'}</Badge>
                </div>

                <p className="text-[11.5px] text-muted leading-relaxed mb-3 line-clamp-2">{unit.tagline}</p>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-[10.5px] mb-1">
                    <span className="text-faint">Accuracy</span>
                    <span className="mono" style={{ color: perf?.answered ? MASTERY_TONE[perf.mastery] : 'var(--text-faint)' }}>
                      {perf?.answered ? `${Math.round(perf.accuracy)}%` : '—'}
                    </span>
                  </div>
                  <ProgressBar value={perf?.answered ? perf.accuracy : 0} height={4} tone={unit.accent} />
                </div>

                <div className="mt-auto flex items-center gap-1.5">
                  <Button size="sm" variant="primary" icon={<Play size={12} />} onClick={() => setSession({ unit: unit.id, count: 10 })}>
                    10q
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSession({ unit: unit.id, count: 20 })}>20q</Button>
                  <Button size="sm" variant="outline" onClick={() => setSession({ unit: unit.id, count: 30 })}>30q</Button>
                  <div className="flex-1" />
                  <Link to={`/practice/${unit.id}`} className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-0.5">
                    Learn <ArrowRight size={11} />
                  </Link>
                </div>
              </Card>
            </StaggerItem>
          )
        })}
      </Stagger>

      <Card className="p-4">
        <SectionHeader
          title="Unit exam vs practice"
          description="Both use the same verified question bank."
          icon={<Layers size={15} />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]">
          <div className="rounded-lg bg-[var(--surface-2)] p-3">
            <div className="font-medium mb-1 flex items-center gap-1.5"><BookOpen size={13} /> Practice mode</div>
            <p className="text-muted leading-relaxed">Instant feedback after each answer, full option explanations, hints available, no countdown. Best for learning.</p>
          </div>
          <div className="rounded-lg bg-[var(--surface-2)] p-3">
            <div className="font-medium mb-1 flex items-center gap-1.5"><Play size={13} /> Exam mode</div>
            <p className="text-muted leading-relaxed">Timed, no feedback until submission, scored out of 30 and recorded in analytics. Best for testing recall.</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/arena')}>Open Test Arena</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
