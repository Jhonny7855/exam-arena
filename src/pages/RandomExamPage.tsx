import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shuffle, Calendar, Clock, Layers, Zap, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useArena, randomExamQuestions } from '../store/arena'
import { useActiveSubject } from '../hooks/useSubject'
import { todayKey } from '../services/storage'
import { Button, Card, Badge, SectionHeader } from '../components/common/ui'
import { PracticeEngine } from '../components/practice/PracticeEngine'
import { QUESTION_BY_ID } from '../data/questionBank'
import type { Question } from '../types'

type Mode = 'random' | 'daily'

export default function RandomExamPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const data = useArena((s) => s.data)
  const subject = useActiveSubject()
  const unitCount = subject === 'tafl' ? 7 : 6
  const ensureDailyChallenge = useArena((s) => s.ensureDailyChallenge)
  const [mode, setMode] = useState<Mode | null>(params.get('mode') === 'daily' ? 'daily' : null)
  const [seed, setSeed] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])

  const challengeDone = data.dailyChallenge.date === todayKey() && data.dailyChallenge.completed

  const startRandom = () => {
    setQuestions(randomExamQuestions(subject, 30))
    setMode('random')
  }

  const startDaily = () => {
    setQuestions(ensureDailyChallenge())
    setMode('daily')
  }

  const retryDaily = () => {
    const qs = data.dailyChallenge.questionIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean)
    setQuestions(qs)
    setMode('daily')
  }

  if (mode && questions.length > 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <PracticeEngine
          questions={questions}
          mode={mode === 'daily' ? 'daily' : 'random'}
          title={mode === 'daily' ? 'Daily Challenge' : 'Random Practice Set'}
          subtitle={mode === 'daily' ? '10 questions · fresh every day · +25 XP' : '30 balanced questions across all units'}
        />
        <div className="mt-3 text-center">
          <Button variant="ghost" size="sm" onClick={() => setMode(null)}>← Back to options</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Random Exam</h2>
        <p className="text-[13px] text-muted mt-0.5">
          Generated fresh from the full subject bank with balanced unit and difficulty distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4 flex flex-col">
          <div className="h-9 w-9 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center mb-3">
            <Shuffle size={17} className="text-[var(--accent)]" />
          </div>
          <h3 className="text-[14px] font-semibold mb-1">Full random exam</h3>
          <p className="text-[12px] text-muted mb-3 leading-relaxed">
            30 questions drawn across all units, no duplicates, mixed difficulty. Practice mode with instant feedback.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-faint mb-3">
            <span className="flex items-center gap-1"><Layers size={10} />30 questions</span>
            <span className="flex items-center gap-1"><Zap size={10} />all units</span>
          </div>
          <Button variant="primary" fullWidth icon={<Shuffle size={14} />} onClick={startRandom} className="mt-auto">
            Generate exam
          </Button>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="h-9 w-9 rounded-lg bg-[var(--success-soft)] flex items-center justify-center mb-3">
            <Calendar size={17} className="text-[var(--success)]" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-semibold">Daily challenge</h3>
            {challengeDone && <Badge tone="success"><CheckCircle2 size={10} />Done</Badge>}
          </div>
          <p className="text-[12px] text-muted mb-3 leading-relaxed">
            Ten questions selected for today. Same set all day, resets at midnight. Completing it extends your streak.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-faint mb-3">
            <span className="flex items-center gap-1"><Clock size={10} />10 questions</span>
            <span className="flex items-center gap-1"><Zap size={10} />+25 XP</span>
          </div>
          <div className="mt-auto flex gap-2">
            <Button variant={challengeDone ? 'outline' : 'success'} fullWidth icon={challengeDone ? <RefreshCw size={14} /> : <Calendar size={14} />} onClick={challengeDone ? retryDaily : startDaily}>
              {challengeDone ? 'Replay today' : 'Start challenge'}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <SectionHeader title="How generation works" description="Deterministic, verified, duplicate-free." icon={<Shuffle size={15} />} />
        <ul className="space-y-1.5 text-[12px] text-muted">
          <li>· Questions are partitioned by unit, then sampled proportionally so every unit appears.</li>
          <li>· Each sampled set is filtered for uniqueness before shuffling the option order.</li>
          <li>· The correct answer index is recomputed after option shuffling, so no answer leaks by position.</li>
          <li>· All answers in the bank are computed or verified programmatically — none are hand-asserted.</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-[var(--border)] text-[11.5px] text-faint">
          Daily challenge date: <span className="mono text-[var(--text-muted)]">{todayKey()}</span>
          {data.dailyChallenge.date === todayKey() && data.dailyChallenge.completed && (
            <span className="ml-2">· Completed with {data.dailyChallenge.score}/10</span>
          )}
        </div>
      </Card>

      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={() => navigate('/arena')}>Prefer a structured test? Open Test Arena →</Button>
      </div>
    </div>
  )
}
