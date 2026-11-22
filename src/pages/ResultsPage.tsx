import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, XCircle, MinusCircle, Clock, RotateCcw, ArrowRight, ChevronDown,
  Bookmark, BookmarkCheck, Lightbulb, Target, Trophy, TrendingUp, Home, Swords, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useArena } from '../store/arena'
import { useActiveSubject } from '../hooks/useSubject'
import { QUESTION_BY_ID } from '../data/questionBank'
import { TESTS_BY_SUBJECT } from '../data/tests'
import { Button, Card, Badge, ProgressBar, Modal } from '../components/common/ui'
import { AnimatedNumber, Reveal, Stagger, StaggerItem } from '../components/common/motion'
import { classifyScore, formatDuration } from '../services/scoring'
import { computeUnitPerformance } from '../services/analytics'
import { unitsFor } from '../data/syllabus'
import type { Difficulty } from '../types'

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const data = useArena((s) => s.data)
  const activeSubject = useActiveSubject()
  const toggleSaveQuestion = useArena((s) => s.toggleSaveQuestion)
  const lastUnlock = useArena((s) => s.lastUnlock)
  const clearUnlocks = useArena((s) => s.clearUnlocks)

  const attempt = data.attempts.find((a) => a.id === attemptId)
  const subject = attempt?.subject ?? activeSubject
  const syllabus = useMemo(() => unitsFor(subject), [subject])
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct' | 'unanswered'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [unlockOpen, setUnlockOpen] = useState(false)

  const animatedScore = attempt?.score ?? 0

  useEffect(() => {
    if (lastUnlock.length > 0) setUnlockOpen(true)
  }, [lastUnlock])

  const questions = useMemo(
    () => (attempt ? attempt.questionIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean) : []),
    [attempt],
  )

  const units = useMemo(() => computeUnitPerformance(data, subject), [data, subject])

  const attemptUnitStats = useMemo(() => {
    if (!attempt) return []
    const map = new Map<number, { correct: number; total: number; answered: number }>()
    for (const a of attempt.answers) {
      const q = QUESTION_BY_ID[a.questionId]
      if (!q) continue
      const entry = map.get(q.unit) ?? { correct: 0, total: 0, answered: 0 }
      entry.total += 1
      if (a.selected !== null) {
        entry.answered += 1
        if (a.selected === q.correctAnswer) entry.correct += 1
      }
      map.set(q.unit, entry)
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([unit, v]) => {
        const meta = syllabus.find((u) => u.id === unit)
        return {
          unit,
          title: meta?.title ?? `Unit ${unit}`,
          accent: meta?.accent ?? 'var(--accent)',
          accuracy: v.answered ? (v.correct / v.answered) * 100 : 0,
          correct: v.correct,
          answered: v.answered,
          total: v.total,
        }
      })
  }, [attempt, syllabus])

  const difficultyStats = useMemo(() => {
    if (!attempt) return []
    const map: Record<Difficulty, { correct: number; answered: number; total: number }> = {
      Easy: { correct: 0, answered: 0, total: 0 },
      Medium: { correct: 0, answered: 0, total: 0 },
      Hard: { correct: 0, answered: 0, total: 0 },
    }
    for (const a of attempt.answers) {
      const q = QUESTION_BY_ID[a.questionId]
      if (!q) continue
      map[q.difficulty].total += 1
      if (a.selected !== null) {
        map[q.difficulty].answered += 1
        if (a.selected === q.correctAnswer) map[q.difficulty].correct += 1
      }
    }
    return (['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => ({
      difficulty: d,
      accuracy: map[d].answered ? (map[d].correct / map[d].answered) * 100 : 0,
      ...map[d],
    }))
  }, [attempt])

  const previousAttempts = useMemo(() => {
    if (!attempt) return []
    return data.attempts
      .filter((a) => a.testId === attempt.testId && a.id !== attempt.id)
      .sort((a, b) => a.submittedAt - b.submittedAt)
  }, [data.attempts, attempt])

  if (!attempt) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="p-6 text-center max-w-sm">
          <h2 className="text-sm font-semibold mb-1">Result not found</h2>
          <p className="text-[13px] text-muted mb-4">This attempt may have been removed or reset.</p>
          <Button variant="primary" fullWidth onClick={() => navigate('/arena')}>Back to arena</Button>
        </Card>
      </div>
    )
  }

  const band = classifyScore(attempt.score)
  const subjectTests = TESTS_BY_SUBJECT[subject]
  const attemptNumber = subjectTests.find((t) => t.id === attempt.testId)?.number ?? 0
  const nextTest = subjectTests.find((t) => t.number === attemptNumber + 1) ?? null
  const wrongIds = attempt.answers.filter((a) => a.selected !== null && QUESTION_BY_ID[a.questionId] && a.selected !== QUESTION_BY_ID[a.questionId].correctAnswer).map((a) => a.questionId)
  const bestPrevious = previousAttempts.length ? Math.max(...previousAttempts.map((a) => a.score)) : null
  const improvement = bestPrevious !== null ? attempt.score - bestPrevious : null

  const filtered = attempt.answers.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'unanswered') return a.selected === null
    const q = QUESTION_BY_ID[a.questionId]
    if (!q) return false
    if (filter === 'correct') return a.selected === q.correctAnswer
    return a.selected !== null && a.selected !== q.correctAnswer
  })

  const toneColor: Record<string, string> = {
    critical: 'var(--danger)',
    weak: 'var(--warning)',
    developing: 'var(--accent)',
    strong: 'var(--success)',
    mastered: 'var(--secondary)',
  }

  const reviewList = attempt.answers.filter((a) => a.selected !== QUESTION_BY_ID[a.questionId]?.correctAnswer)
  const currentReview = reviewList[reviewIndex]
  const currentReviewQ = currentReview ? QUESTION_BY_ID[currentReview.questionId] : null

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Reveal
        y={12}
        className="relative overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface)] hero-glow"
      >
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div className="relative p-5 lg:p-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge tone="neutral">{attempt.mode} mode</Badge>
                <Badge tone="accent">{attempt.testId}</Badge>
              </div>
              <h2 className="text-[17px] font-semibold tracking-tight mb-1">{attempt.testName}</h2>
              <div className="text-[12px] text-muted">
                {new Date(attempt.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                {' · '}
                {formatDuration(attempt.durationMs)} taken
              </div>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `color-mix(in srgb, ${toneColor[band.tone]} 12%, transparent)` }}>
                <Trophy size={14} style={{ color: toneColor[band.tone] }} />
                <span className="text-[13px] font-semibold" style={{ color: toneColor[band.tone] }}>{band.label}</span>
              </div>
            </div>

            <div className="text-center shrink-0">
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-semibold mono tracking-tight" style={{ color: toneColor[band.tone] }}>
                  <AnimatedNumber value={animatedScore} />
                </span>
                <span className="text-xl text-faint mono mb-1.5">/{attempt.total}</span>
              </div>
              <div className="text-[12px] text-muted mt-1 mono">{attempt.percentage}%</div>
            </div>
          </div>

          <p className="text-[13px] text-muted mt-4 max-w-xl">{band.message}</p>

          {improvement !== null && (
            <div className="mt-3 flex items-center gap-1.5 text-[12px]">
              <TrendingUp size={13} className={improvement >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'} />
              <span className={improvement >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>
                {improvement >= 0 ? '+' : ''}{improvement} marks vs your previous best on this test
              </span>
            </div>
          )}
        </div>
      </Reveal>


      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Correct', value: attempt.correct, icon: <CheckCircle2 size={15} />, color: 'var(--success)' },
          { label: 'Incorrect', value: attempt.incorrect, icon: <XCircle size={15} />, color: 'var(--danger)' },
          { label: 'Unanswered', value: attempt.unanswered, icon: <MinusCircle size={15} />, color: 'var(--warning)' },
          { label: 'Time taken', value: formatDuration(attempt.durationMs), icon: <Clock size={15} />, color: 'var(--text-muted)' },
        ].map((s) => (
          <StaggerItem key={s.label}>
            <Card className="p-3.5 h-full">
              <div className="flex items-center gap-1.5 mb-1.5" style={{ color: s.color }}>
                {s.icon}
                <span className="text-[11px] uppercase tracking-wider text-faint">{s.label}</span>
              </div>
              <div className="text-xl font-semibold mono">
                {typeof s.value === 'number' ? <AnimatedNumber value={s.value} /> : s.value}
              </div>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Reveal className="h-full">
        <Card className="p-4 h-full">
          <h3 className="text-[13.5px] font-semibold mb-3">Unit accuracy in this attempt</h3>
          <div className="space-y-2.5">
            {attemptUnitStats.map((u) => (
              <div key={u.unit}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="truncate">U{u.unit} · {u.title}</span>
                  <span className="mono text-faint shrink-0 ml-2">{u.correct}/{u.answered}</span>
                </div>
                <ProgressBar value={u.accuracy} height={5} tone={u.accent} />
              </div>
            ))}
          </div>
        </Card>
        </Reveal>

        <Reveal className="h-full" delay={0.06}>
        <Card className="p-4 h-full">
          <h3 className="text-[13.5px] font-semibold mb-3">Difficulty breakdown</h3>
          <div className="space-y-2.5">
            {difficultyStats.map((d) => (
              <div key={d.difficulty}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span>{d.difficulty}</span>
                  <span className="mono text-faint">{d.correct}/{d.answered} · {Math.round(d.accuracy)}%</span>
                </div>
                <ProgressBar
                  value={d.accuracy}
                  height={5}
                  tone={d.difficulty === 'Easy' ? 'var(--success)' : d.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)'}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border)] text-[11.5px] text-muted">
            Average time per question:{' '}
            <span className="mono text-[var(--text)]">
              {attempt.total - attempt.unanswered > 0
                ? `${Math.round(attempt.durationMs / 1000 / (attempt.total - attempt.unanswered))}s`
                : '—'}
            </span>
          </div>
        </Card>
        </Reveal>
      </div>

      <Reveal>
      <Card className="p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" icon={<BookOpenIcon />} onClick={() => { setReviewIndex(0); setReviewOpen(true) }} disabled={reviewList.length === 0}>
            Review wrong answers ({reviewList.length})
          </Button>
          <Button variant="outline" size="sm" icon={<RotateCcw size={13} />} onClick={() => navigate(`/exam/${attempt.testId}`)}>
            Retry test
          </Button>
          <Button variant="outline" size="sm" icon={<Target size={13} />} onClick={() => navigate('/weak')}>
            Practice weak topics
          </Button>
          {nextTest && (
            <Button variant="outline" size="sm" iconRight={<ArrowRight size={13} />} onClick={() => navigate(`/exam/${nextTest.id}`)}>
              Next test
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" icon={<Home size={13} />} onClick={() => navigate('/')}>
            Dashboard
          </Button>
        </div>
      </Card>
      </Reveal>

      <Reveal>
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h3 className="text-[13.5px] font-semibold">Full answer review</h3>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
            {([
              ['all', 'All', attempt.total],
              ['correct', 'Correct', attempt.correct],
              ['incorrect', 'Wrong', attempt.incorrect],
              ['unanswered', 'Skipped', attempt.unanswered],
            ] as const).map(([value, label, count]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-2.5 h-7 rounded-md text-[11.5px] font-medium transition-colors ${
                  filter === value ? 'bg-[var(--surface)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {label} <span className="mono text-faint">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-[12.5px] text-faint text-center py-8">Nothing in this category.</p>
          )}
          {filtered.map((a, idx) => {
            const q = QUESTION_BY_ID[a.questionId]
            if (!q) return null
            const isCorrect = a.selected === q.correctAnswer
            const isUnanswered = a.selected === null
            const open = expanded === a.questionId
            const saved = data.savedQuestions.includes(q.id)
            const originalIndex = attempt.answers.findIndex((x) => x.questionId === a.questionId)

            return (
              <div key={a.questionId} className="rounded-xl border border-[var(--border)] overflow-hidden">
                <button
                  onClick={() => setExpanded(open ? null : a.questionId)}
                  className="w-full text-left p-3 flex items-start gap-2.5 hover:bg-[var(--surface-2)]/50 transition-colors"
                >
                  <span className="mt-0.5 shrink-0">
                    {isUnanswered ? (
                      <MinusCircle size={15} className="text-[var(--warning)]" />
                    ) : isCorrect ? (
                      <CheckCircle2 size={15} className="text-[var(--success)]" />
                    ) : (
                      <XCircle size={15} className="text-[var(--danger)]" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10.5px] mono text-faint">Q{originalIndex + 1}</span>
                      <span className="text-[10px] text-faint">·</span>
                      <span className="text-[10.5px] text-faint truncate">{q.topic}</span>
                      <Badge tone={q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'} className="ml-auto shrink-0">
                        {q.difficulty}
                      </Badge>
                    </div>
                    <p className="text-[12.5px] leading-relaxed line-clamp-2">{q.question}</p>
                  </div>
                  <ChevronDown size={14} className={`shrink-0 text-[var(--text-faint)] transition-transform mt-1 ${open ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-[var(--border)]"
                    >
                      <div className="p-3.5 space-y-3 bg-[var(--bg-elevated)]">
                        <div className="space-y-1.5">
                          {q.options.map((opt, oi) => {
                            const isAnswer = oi === q.correctAnswer
                            const isPicked = a.selected === oi
                            return (
                              <div
                                key={oi}
                                className={`rounded-lg border p-2.5 text-[12.5px] ${
                                  isAnswer
                                    ? 'border-[color-mix(in_srgb,var(--success)_45%,transparent)] bg-[var(--success-soft)]'
                                    : isPicked
                                      ? 'border-[color-mix(in_srgb,var(--danger)_45%,transparent)] bg-[var(--danger-soft)]'
                                      : 'border-[var(--border)] bg-[var(--surface)]'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold mono text-[11px] shrink-0 mt-0.5">{String.fromCharCode(65 + oi)}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span>{opt}</span>
                                      {isAnswer && <Badge tone="success">Correct</Badge>}
                                      {isPicked && !isAnswer && <Badge tone="danger">Your answer</Badge>}
                                      {isPicked && isAnswer && <Badge tone="success">Your answer</Badge>}
                                    </div>
                                    <p className="text-[11.5px] text-muted mt-1 leading-relaxed">{q.optionExplanations[oi]}</p>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Lightbulb size={13} className="text-[var(--accent)]" />
                            <span className="text-[11.5px] font-semibold">Explanation</span>
                          </div>
                          <p className="text-[12.5px] text-muted leading-relaxed">{q.explanation}</p>
                        </div>

                        {q.hint && (
                          <div className="rounded-lg bg-[var(--secondary-soft)] border border-[color-mix(in_srgb,var(--secondary)_25%,transparent)] p-2.5">
                            <span className="text-[11px] font-semibold text-[var(--secondary)]">Hint · </span>
                            <span className="text-[12px] text-[var(--text-muted)]">{q.hint}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                            onClick={() => toggleSaveQuestion(q.id)}
                          >
                            {saved ? 'Saved' : 'Save for revision'}
                          </Button>
                          <Link to={`/practice/${q.unit}`} className="text-[12px] text-[var(--accent)] hover:underline">
                            Practice {q.topic}
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </Card>
      </Reveal>

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title={`Wrong answers · ${reviewList.length}`}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronLeft size={14} />}
              disabled={reviewIndex === 0}
              onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
            >
              Previous
            </Button>
            <span className="text-[12px] text-muted mono">{reviewIndex + 1} / {reviewList.length}</span>
            <Button
              variant="primary"
              size="sm"
              iconRight={<ChevronRight size={14} />}
              disabled={reviewIndex >= reviewList.length - 1}
              onClick={() => setReviewIndex((i) => Math.min(reviewList.length - 1, i + 1))}
            >
              Next wrong
            </Button>
          </div>
        }
      >
        {currentReviewQ && currentReview && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{currentReviewQ.topic}</Badge>
              <Badge tone="danger">{currentReviewQ.difficulty}</Badge>
            </div>
            <p className="text-[13.5px] leading-relaxed">{currentReviewQ.question}</p>
            <div className="space-y-1.5">
              {currentReviewQ.options.map((opt, oi) => {
                const isAnswer = oi === currentReviewQ.correctAnswer
                const isPicked = currentReview.selected === oi
                return (
                  <div
                    key={oi}
                    className={`rounded-lg border p-2.5 text-[12.5px] ${
                      isAnswer
                        ? 'border-[color-mix(in_srgb,var(--success)_45%,transparent)] bg-[var(--success-soft)]'
                        : isPicked
                          ? 'border-[color-mix(in_srgb,var(--danger)_45%,transparent)] bg-[var(--danger-soft)]'
                          : 'border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-semibold mono text-[11px] mt-0.5">{String.fromCharCode(65 + oi)}</span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{opt}</span>
                          {isAnswer && <Badge tone="success">Correct</Badge>}
                          {isPicked && !isAnswer && <Badge tone="danger">You chose this</Badge>}
                        </div>
                        <p className="text-[11.5px] text-muted mt-1">{currentReviewQ.optionExplanations[oi]}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <p className="text-[12.5px] leading-relaxed">{currentReviewQ.explanation}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={unlockOpen && lastUnlock.length > 0}
        onClose={() => { setUnlockOpen(false); clearUnlocks() }}
        title="Achievement unlocked"
        size="sm"
        footer={<Button variant="primary" fullWidth onClick={() => { setUnlockOpen(false); clearUnlocks() }}>Continue</Button>}
      >
        <div className="text-center py-2">
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="h-14 w-14 rounded-xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-soft), var(--secondary-soft))', border: '1px solid var(--border-strong)' }}
          >
            <Trophy size={26} className="text-[var(--warning)]" />
          </motion.div>
          {lastUnlock.map((name) => (
            <div key={name} className="text-[14px] font-semibold mb-1">{name}</div>
          ))}
          <p className="text-[12.5px] text-muted">+{lastUnlock.length * 50} XP awarded</p>
        </div>
      </Modal>

      {wrongIds.length > 0 && (
        <Reveal>
        <Card className="p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold">Practice what you missed</div>
              <p className="text-[12px] text-muted">{wrongIds.length} questions were answered incorrectly and added to your revision queue.</p>
            </div>
            <Button variant="primary" size="sm" icon={<Swords size={13} />} onClick={() => navigate('/revision')}>
              Open revision
            </Button>
          </div>
        </Card>
        </Reveal>
      )}
    </div>
  )
}

function BookOpenIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
