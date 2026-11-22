import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Flag, X, Clock, CheckCircle2, Circle, MinusCircle,
  FlagTriangleRight, Send, Grid3x3, AlertTriangle, Keyboard, Info,
} from 'lucide-react'
import { useArena } from '../store/arena'
import { testById } from '../data/tests'
import { QUESTION_BY_ID } from '../data/questionBank'
import { Button, Card, Badge, Modal, ProgressBar } from '../components/common/ui'
import { formatClock } from '../services/scoring'
import type { Question } from '../types'

const WARN_5_MIN = 5 * 60 * 1000
const WARN_1_MIN = 60 * 1000

function OptionRow({
  index,
  text,
  selected,
  onClick,
  disabled,
}: {
  index: number
  text: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
      whileHover={disabled ? undefined : { x: 3 }}
      whileTap={disabled ? undefined : { scale: 0.995 }}
      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-colors duration-150 group ${
        selected
          ? 'border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_12%,transparent)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]'
      } disabled:cursor-not-allowed`}
    >
      <span
        className={`h-6 w-6 rounded-md flex items-center justify-center text-[11.5px] font-semibold shrink-0 mono transition-all duration-150 ${
          selected
            ? 'bg-[var(--accent)] text-white scale-105'
            : 'bg-[var(--surface-2)] text-[var(--text-muted)] group-hover:bg-[var(--surface-3)]'
        }`}
      >
        {String.fromCharCode(65 + index)}
      </span>
      <span className="text-[13.5px] leading-relaxed pt-0.5">{text}</span>
    </motion.button>
  )
}

export default function ExamPage() {
  const { testId } = useParams<{ testId: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const data = useArena((s) => s.data)
  const startExam = useArena((s) => s.startExam)
  const selectAnswer = useArena((s) => s.selectAnswer)
  const toggleMark = useArena((s) => s.toggleMark)
  const markVisited = useArena((s) => s.markVisited)
  const setCurrentIndex = useArena((s) => s.setCurrentIndex)
  const submitExam = useArena((s) => s.submitExam)

  const test = testId ? testById(testId) : undefined
  const questions: Question[] = useMemo(
    () => (test ? test.questionIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean) : []),
    [test],
  )

  const sessionKey = `exam:${testId}`
  const session = data.activeSessions[sessionKey]

  const [remaining, setRemaining] = useState<number>(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [warned, setWarned] = useState<{ five: boolean; one: boolean }>({ five: false, one: false })
  const submittedRef = useRef(false)
  const questionStartRef = useRef<number>(Date.now())

  const durationMs = (data.settings.examMinutes || 30) * 60 * 1000

  useEffect(() => {
    if (!test || questions.length === 0) return
    const existing = useArena.getState().data.activeSessions[sessionKey]
    if (!existing) {
      startExam({
        key: sessionKey,
        subject: test.subject,
        testId: test.id,
        testName: test.name,
        mode: 'standard',
        questions,
        durationMs,
      })
    }
  }, [test, questions, sessionKey, startExam, durationMs])

  const currentIndex = session?.currentIndex ?? 0
  const current = questions[currentIndex]

  useEffect(() => {
    if (!session) return
    markVisited(sessionKey, questions[currentIndex]?.id ?? '')
    questionStartRef.current = Date.now()
  }, [currentIndex, sessionKey, questions])

  const doSubmit = useCallback(
    (auto = false) => {
      if (submittedRef.current) return
      submittedRef.current = true
      const result = submitExam(sessionKey)
      if (result) {
        navigate(`/results/${result.attempt.id}`, { replace: true, state: { auto } })
      } else {
        navigate('/arena')
      }
    },
    [submitExam, sessionKey, navigate],
  )

  useEffect(() => {
    if (!session || session.endsAt === null) return
    const tick = () => {
      const left = session.endsAt! - Date.now()
      setRemaining(left)
      if (left <= 0) {
        doSubmit(true)
        return
      }
      if (data.settings.timerWarnings) {
        if (left <= WARN_5_MIN && !warned.five) setWarned((w) => ({ ...w, five: true }))
        if (left <= WARN_1_MIN && !warned.one) setWarned((w) => ({ ...w, one: true }))
      }
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [session, doSubmit, data.settings.timerWarnings, warned])

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) return
      setCurrentIndex(sessionKey, index)
    },
    [questions.length, sessionKey, setCurrentIndex],
  )

  const handleSelect = useCallback(
    (option: number) => {
      if (!current) return
      selectAnswer(sessionKey, current.id, option)
    },
    [current, selectAnswer, sessionKey],
  )

  useEffect(() => {
    if (!data.settings.keyboardShortcuts) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (confirmOpen || paletteOpen) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goTo(currentIndex + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(currentIndex - 1)
      } else if (e.key === 'r' || e.key === 'R') {
        if (current) toggleMark(sessionKey, current.id)
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        handleSelect(Number(e.key) - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, goTo, current, toggleMark, sessionKey, handleSelect, data.settings.keyboardShortcuts, confirmOpen, paletteOpen])

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 max-w-sm text-center">
          <AlertTriangle size={24} className="text-[var(--warning)] mx-auto mb-3" />
          <h2 className="text-sm font-semibold mb-1">Test not found</h2>
          <p className="text-[13px] text-muted mb-4">The requested test does not exist.</p>
          <Button variant="primary" fullWidth onClick={() => navigate('/arena')}>Back to arena</Button>
        </Card>
      </div>
    )
  }

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center text-[13px] text-muted">Preparing exam…</div>
  }

  const answerState = session.answers[current?.id ?? ''] ?? { selected: null, marked: false, visited: false, timeMs: 0 }
  const answeredCount = questions.filter((q) => session.answers[q.id]?.selected != null).length
  const markedCount = questions.filter((q) => session.answers[q.id]?.marked).length
  const isLowTime = remaining <= WARN_5_MIN && remaining > 0
  const isCritical = remaining <= WARN_1_MIN && remaining > 0

  const paletteState = (qid: string) => {
    const a = session.answers[qid]
    if (!a) return 'unvisited'
    if (a.marked && a.selected != null) return 'answered-marked'
    if (a.marked) return 'marked'
    if (a.selected != null) return 'answered'
    if (a.visited) return 'visited'
    return 'unvisited'
  }

  const paletteClasses: Record<string, string> = {
    unvisited: 'bg-[var(--surface-2)] text-[var(--text-faint)] border-[var(--border)]',
    visited: 'bg-[var(--surface-3)] text-[var(--text-muted)] border-[var(--border-strong)]',
    answered: 'bg-[var(--success-soft)] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_40%,transparent)]',
    marked: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[color-mix(in_srgb,var(--warning)_40%,transparent)]',
    'answered-marked': 'bg-[var(--secondary-soft)] text-[var(--secondary)] border-[color-mix(in_srgb,var(--secondary)_40%,transparent)]',
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] backdrop-blur-xl">
        <div className="px-3 lg:px-5 h-14 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[13.5px] font-semibold truncate">{test.name}</h1>
              <Badge tone="accent" className="hidden sm:inline-flex">Stage {test.stage}</Badge>
            </div>
            <div className="text-[11px] text-faint mono">
              {answeredCount}/{questions.length} answered · Q{currentIndex + 1} of {questions.length}
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border mono text-[13px] font-semibold transition-colors ${
              isCritical
                ? 'border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] animate-pulse'
                : isLowTime
                  ? 'border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning)]'
                  : 'border-[var(--border)] bg-[var(--surface)]'
            }`}
            role="timer"
            aria-live={isCritical ? 'assertive' : 'off'}
          >
            <Clock size={14} />
            {formatClock(remaining)}
          </div>

          <button
            onClick={() => setPaletteOpen(true)}
            className="lg:hidden h-9 w-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)]"
            aria-label="Open question palette"
          >
            <Grid3x3 size={15} />
          </button>

          <Button variant="primary" size="sm" icon={<Send size={13} />} onClick={() => setConfirmOpen(true)}>
            Submit
          </Button>
        </div>
        <ProgressBar value={answeredCount} max={questions.length} height={2} animated={false} />
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 min-w-0 px-3 lg:px-6 py-4 lg:py-5 max-w-3xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.16 }}
            >
              <Card className="p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[11px] font-semibold mono text-[var(--accent)]">
                    Q{String(currentIndex + 1).padStart(2, '0')}
                  </span>
                  <Badge tone="neutral">{current?.topic}</Badge>
                  <Badge tone={current?.difficulty === 'Easy' ? 'success' : current?.difficulty === 'Medium' ? 'warning' : 'danger'}>
                    {current?.difficulty}
                  </Badge>
                  <div className="flex-1" />
                  <button
                    onClick={() => current && toggleMark(sessionKey, current.id)}
                    className={`inline-flex items-center gap-1 text-[11px] px-2 h-7 rounded-md border transition-colors ${
                      answerState.marked
                        ? 'border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Flag size={11} /> {answerState.marked ? 'Marked' : 'Mark'}
                  </button>
                </div>

                <p
                  className="leading-relaxed mb-4 text-[var(--text)]"
                  style={{ fontSize: `${data.settings.questionFontSize}px` }}
                >
                  {current?.question}
                </p>

                <div className="space-y-2" role="radiogroup" aria-label="Answer options">
                  {current?.options.map((opt, i) => (
                    <OptionRow
                      key={i}
                      index={i}
                      text={opt}
                      selected={answerState.selected === i}
                      onClick={() => handleSelect(i)}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="md" icon={<ChevronLeft size={15} />} onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
              Previous
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => current && selectAnswer(sessionKey, current.id, null)}
              disabled={answerState.selected == null}
            >
              Clear
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="md"
              iconRight={<ChevronRight size={15} />}
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === questions.length - 1}
            >
              Next
            </Button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 justify-center mt-4 text-[11px] text-faint">
            <Keyboard size={12} />
            <span>1–4 select</span>
            <span>·</span>
            <span>← → navigate</span>
            <span>·</span>
            <span>R mark</span>
            <button onClick={() => setShowShortcuts(true)} className="ml-1 text-[var(--accent)] hover:underline">
              more
            </button>
          </div>
        </div>

        <aside className="hidden lg:block w-[268px] shrink-0 border-l border-[var(--border)] bg-[var(--bg-elevated)] p-4 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <PaletteContent
            questions={questions}
            currentIndex={currentIndex}
            paletteState={paletteState}
            paletteClasses={paletteClasses}
            onJump={goTo}
            answeredCount={answeredCount}
            markedCount={markedCount}
          />
        </aside>
      </div>

      <AnimatePresence>
        {paletteOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPaletteOpen(false)} />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-[300px] z-50 bg-[var(--bg-elevated)] border-l border-[var(--border)] p-4 overflow-y-auto lg:hidden"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold">Question palette</h3>
                <button onClick={() => setPaletteOpen(false)} aria-label="Close palette" className="text-[var(--text-muted)]">
                  <X size={16} />
                </button>
              </div>
              <PaletteContent
                questions={questions}
                currentIndex={currentIndex}
                paletteState={paletteState}
                paletteClasses={paletteClasses}
                onJump={(i) => {
                  goTo(i)
                  setPaletteOpen(false)
                }}
                answeredCount={answeredCount}
                markedCount={markedCount}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit exam?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Return to exam</Button>
            <Button variant="primary" onClick={() => doSubmit(false)} icon={<Send size={14} />}>Submit exam</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[13px] text-muted">
            Once submitted, your answers are scored and you will see full explanations. This cannot be undone.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <StatBox label="Total questions" value={questions.length} />
            <StatBox label="Answered" value={answeredCount} tone="var(--success)" />
            <StatBox label="Unanswered" value={questions.length - answeredCount} tone={questions.length - answeredCount > 0 ? 'var(--warning)' : undefined} />
            <StatBox label="Marked for review" value={markedCount} tone="var(--warning)" />
          </div>
          <div className="flex items-center justify-between text-[12px] px-3 py-2 rounded-lg bg-[var(--surface-2)]">
            <span className="text-muted">Time remaining</span>
            <span className={`mono font-semibold ${isLowTime ? 'text-[var(--warning)]' : ''}`}>{formatClock(remaining)}</span>
          </div>
          {questions.length - answeredCount > 0 && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--warning-soft)] border border-[color-mix(in_srgb,var(--warning)_30%,transparent)]">
              <AlertTriangle size={14} className="text-[var(--warning)] mt-0.5 shrink-0" />
              <p className="text-[12px] text-[var(--warning)]">
                You have {questions.length - answeredCount} unanswered question{questions.length - answeredCount === 1 ? '' : 's'}. There is no negative marking, so a guess is never worse than a blank.
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={showShortcuts} onClose={() => setShowShortcuts(false)} title="Keyboard shortcuts" size="sm">
        <div className="space-y-2 text-[13px]">
          {[
            ['1 – 4', 'Select answer A – D'],
            ['← / →', 'Previous / next question'],
            ['R', 'Toggle mark for review'],
            ['Cmd/Ctrl + K', 'Global search'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
              <kbd className="mono text-[11px] px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)]">{k}</kbd>
              <span className="text-muted">{v}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

function StatBox({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface-2)] p-2.5">
      <div className="text-[10.5px] uppercase tracking-wider text-faint mb-0.5">{label}</div>
      <div className="text-lg font-semibold mono" style={{ color: tone }}>{value}</div>
    </div>
  )
}

function PaletteContent({
  questions,
  currentIndex,
  paletteState,
  paletteClasses,
  onJump,
  answeredCount,
  markedCount,
}: {
  questions: Question[]
  currentIndex: number
  paletteState: (id: string) => string
  paletteClasses: Record<string, string>
  onJump: (i: number) => void
  answeredCount: number
  markedCount: number
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5 mb-3 text-[10.5px]">
        <div className="flex items-center gap-1.5 text-muted"><CheckCircle2 size={11} className="text-[var(--success)]" /> {answeredCount} answered</div>
        <div className="flex items-center gap-1.5 text-muted"><Flag size={11} className="text-[var(--warning)]" /> {markedCount} marked</div>
        <div className="flex items-center gap-1.5 text-muted"><Circle size={11} className="text-[var(--text-faint)]" /> {questions.length - answeredCount - markedCount > 0 ? questions.length - answeredCount : 0} open</div>
        <div className="flex items-center gap-1.5 text-muted"><MinusCircle size={11} className="text-[var(--text-faint)]" /> not visited</div>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, i) => {
          const state = paletteState(q.id)
          const isCurrent = i === currentIndex
          return (
            <motion.button
              key={q.id}
              onClick={() => onJump(i)}
              aria-label={`Question ${i + 1}, ${state.replace('-', ' and ')}`}
              aria-current={isCurrent ? 'true' : undefined}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, delay: Math.min(i * 0.012, 0.3) }}
              whileTap={{ scale: 0.92 }}
              className={`h-8 rounded-md border text-[11.5px] font-medium mono transition-all ${paletteClasses[state]} ${
                isCurrent ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg-elevated)]' : 'hover:brightness-125'
              }`}
            >
              {i + 1}
            </motion.button>
          )
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1.5 text-[10.5px] text-muted">
        {[
          ['bg-[var(--success-soft)] border-[color-mix(in_srgb,var(--success)_40%,transparent)]', 'Answered'],
          ['bg-[var(--warning-soft)] border-[color-mix(in_srgb,var(--warning)_40%,transparent)]', 'Marked for review'],
          ['bg-[var(--secondary-soft)] border-[color-mix(in_srgb,var(--secondary)_40%,transparent)]', 'Answered + marked'],
          ['bg-[var(--surface-3)] border-[var(--border-strong)]', 'Visited, unanswered'],
          ['bg-[var(--surface-2)] border-[var(--border)]', 'Not visited'],
        ].map(([cls, label]) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded border ${cls}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-start gap-1.5 text-[10.5px] text-faint">
        <Info size={11} className="mt-0.5 shrink-0" />
        <span>Answers save automatically. You can leave and resume this exam.</span>
      </div>
    </div>
  )
}
