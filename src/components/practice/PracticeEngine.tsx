import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, XCircle, Lightbulb, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck,
  RotateCcw, ArrowRight, Flag, Sparkles, Target,
} from 'lucide-react'
import { useArena } from '../../store/arena'
import { Button, Card, Badge, ProgressBar } from '../common/ui'
import { addOrUpdateRevision } from '../../services/revision'
import { saveData } from '../../services/storage'
import type { ExamMode, Question } from '../../types'

export interface PracticeEngineProps {
  questions: Question[]
  mode: ExamMode
  title: string
  subtitle: string
  onComplete?: (stats: { correct: number; total: number }) => void
  emptyAction?: { label: string; to: string }
}

export function PracticeEngine({ questions, mode, title, subtitle, onComplete, emptyAction }: PracticeEngineProps) {
  const data = useArena((s) => s.data)
  const toggleSaveQuestion = useArena((s) => s.toggleSaveQuestion)
  const navigate = useNavigate()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [answered, setAnswered] = useState<Record<string, number | null>>({})
  const [finished, setFinished] = useState(false)
  const startRef = useRef(Date.now())

  const current = questions[index]
  const isSaved = current ? data.savedQuestions.includes(current.id) : false

  useEffect(() => {
    setSelected(null)
    setRevealed(false)
    setShowHint(false)
    startRef.current = Date.now()
  }, [index, current?.id])

  const reveal = useCallback(
    (option: number) => {
      if (revealed || !current) return
      setSelected(option)
      setRevealed(true)
      setAnswered((prev) => ({ ...prev, [current.id]: option }))
    },
    [revealed, current],
  )

  const advance = useCallback(() => {
    if (index >= questions.length - 1) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
  }, [index, questions.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        reveal(Number(e.key) - 1)
      } else if (e.key === 'ArrowRight' && revealed) {
        advance()
      } else if (e.key === 'ArrowLeft' && index > 0) {
        setIndex((i) => Math.max(0, i - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reveal, revealed, advance, index])

  const stats = useMemo(() => {
    const entries = Object.entries(answered)
    let correct = 0
    for (const [qid, sel] of entries) {
      const q = questions.find((x) => x.id === qid)
      if (q && sel === q.correctAnswer) correct += 1
    }
    return { correct, total: entries.length }
  }, [answered, questions])

  const persistProgress = useCallback(() => {
    if (!current) return
    const store = useArena.getState()
    const next = { ...store.data, revision: [...store.data.revision] }
    if (revealed && selected !== null) {
      const isCorrect = selected === current.correctAnswer
      addOrUpdateRevision(next, current.id, 'wrong', isCorrect)
    }
    saveData(next)
    useArena.setState({ data: next })
  }, [current, revealed, selected])

  useEffect(() => {
    if (finished) {
      persistProgress()
      onComplete?.(stats)
    }
  }, [finished])

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Target size={24} className="text-[var(--text-faint)] mx-auto mb-3" />
        <h3 className="text-sm font-semibold mb-1">Nothing to practise yet</h3>
        <p className="text-[13px] text-muted mb-4 max-w-sm mx-auto">
          Complete a few exams first so the arena can build a personalised set from your performance data.
        </p>
        <Button variant="primary" onClick={() => navigate(emptyAction?.to ?? '/arena')}>
          {emptyAction?.label ?? 'Go to Test Arena'}
        </Button>
      </Card>
    )
  }

  if (finished) {
    const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
    return (
      <Card className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="h-14 w-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: pct >= 70 ? 'var(--success-soft)' : 'var(--warning-soft)' }}
        >
          {pct >= 70 ? <CheckCircle2 size={26} className="text-[var(--success)]" /> : <Target size={26} className="text-[var(--warning)]" />}
        </motion.div>
        <h3 className="text-base font-semibold mb-1">Session complete</h3>
        <p className="text-[13px] text-muted mb-4">
          You answered {stats.correct} of {stats.total} correctly ({pct}%). Incorrect items were added to your revision queue.
        </p>
        <div className="max-w-xs mx-auto mb-5">
          <ProgressBar value={pct} tone={pct >= 70 ? 'var(--success)' : 'var(--warning)'} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="primary" icon={<RotateCcw size={14} />} onClick={() => { setFinished(false); setIndex(0); setAnswered({}) }}>
            Practise again
          </Button>
          <Button variant="outline" iconRight={<ArrowRight size={14} />} onClick={() => navigate('/revision')}>
            Revision center
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>Dashboard</Button>
        </div>
      </Card>
    )
  }

  const isCorrect = revealed && selected === current.correctAnswer
  const progressPct = ((index + (revealed ? 1 : 0)) / questions.length) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold truncate">{title}</h2>
          <p className="text-[12px] text-muted">{subtitle}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[12px] mono text-faint">{index + 1} / {questions.length}</div>
          <div className="text-[11px] mono text-[var(--success)]">{stats.correct} correct</div>
        </div>
      </div>
      <ProgressBar value={progressPct} height={3} animated={false} />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
        >
          <Card className="p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge tone="neutral">{current.topic}</Badge>
              <Badge tone={current.difficulty === 'Easy' ? 'success' : current.difficulty === 'Medium' ? 'warning' : 'danger'}>
                {current.difficulty}
              </Badge>
              <Badge tone="accent">{current.type}</Badge>
              <div className="flex-1" />
              <button
                onClick={() => toggleSaveQuestion(current.id)}
                aria-label={isSaved ? 'Remove from saved' : 'Save question'}
                className={`inline-flex items-center gap-1 text-[11px] px-2 h-7 rounded-md border transition-colors ${
                  isSaved
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {isSaved ? <BookmarkCheck size={11} /> : <Bookmark size={11} />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>

            <p className="text-[15px] leading-relaxed mb-4">{current.question}</p>

            <div className="space-y-2">
              {current.options.map((opt, i) => {
                const isAnswer = i === current.correctAnswer
                const isPicked = selected === i
                let cls = 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]'
                if (revealed) {
                  if (isAnswer) cls = 'border-[color-mix(in_srgb,var(--success)_50%,transparent)] bg-[var(--success-soft)]'
                  else if (isPicked) cls = 'border-[color-mix(in_srgb,var(--danger)_50%,transparent)] bg-[var(--danger-soft)]'
                  else cls = 'border-[var(--border)] bg-[var(--surface)] opacity-60'
                }
                return (
                  <motion.button
                    key={i}
                    onClick={() => reveal(i)}
                    disabled={revealed}
                    aria-pressed={isPicked}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={revealed ? undefined : { x: 3 }}
                    whileTap={revealed ? undefined : { scale: 0.995 }}
                    className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${cls} ${revealed ? 'cursor-default' : ''}`}
                  >
                    <span
                      className={`h-6 w-6 rounded-md flex items-center justify-center text-[11.5px] font-semibold shrink-0 mono ${
                        revealed && isAnswer
                          ? 'bg-[var(--success)] text-[#04120c]'
                          : revealed && isPicked
                            ? 'bg-[var(--danger)] text-white'
                            : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[13.5px] leading-relaxed">{opt}</span>
                      {revealed && (
                        <p className="text-[11.5px] text-muted mt-1 leading-relaxed">{current.optionExplanations[i]}</p>
                      )}
                    </div>
                    {revealed && isAnswer && <CheckCircle2 size={15} className="text-[var(--success)] shrink-0 mt-0.5" />}
                    {revealed && isPicked && !isAnswer && <XCircle size={15} className="text-[var(--danger)] shrink-0 mt-0.5" />}
                  </motion.button>
                )
              })}
            </div>

            {!revealed && current.hint && (
              <div className="mt-3">
                {showHint ? (
                  <div className="rounded-lg bg-[var(--secondary-soft)] border border-[color-mix(in_srgb,var(--secondary)_25%,transparent)] p-2.5 text-[12px]">
                    <span className="font-semibold text-[var(--secondary)]">Hint · </span>
                    <span className="text-[var(--text-muted)]">{current.hint}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--secondary)] hover:underline"
                  >
                    <Lightbulb size={12} /> Show hint
                  </button>
                )}
              </div>
            )}

            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className={`mt-3.5 rounded-xl border p-3.5 ${
                    isCorrect
                      ? 'border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[var(--success-soft)]'
                      : 'border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[var(--danger-soft)]'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {isCorrect ? (
                        <><CheckCircle2 size={14} className="text-[var(--success)]" /><span className="text-[12.5px] font-semibold text-[var(--success)]">Correct</span></>
                      ) : (
                        <><XCircle size={14} className="text-[var(--danger)]" /><span className="text-[12.5px] font-semibold text-[var(--danger)]">Incorrect</span></>
                      )}
                      <span className="text-[11px] text-muted ml-auto">Answer: {String.fromCharCode(65 + current.correctAnswer)}</span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed">{current.explanation}</p>
                    <div className="mt-2.5 pt-2.5 border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] flex items-center gap-3 text-[11px]">
                      <span className="text-muted">Key concept:</span>
                      <span className="font-medium">{current.topic}</span>
                      <span className="text-[var(--text-faint)]">·</span>
                      <span className="text-faint">{current.subtopic}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="md" icon={<ChevronLeft size={15} />} onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Previous
        </Button>
        <div className="flex-1" />
        {revealed ? (
          <Button variant="primary" size="md" iconRight={<ChevronRight size={15} />} onClick={advance}>
            {index >= questions.length - 1 ? 'Finish session' : 'Next question'}
          </Button>
        ) : (
          <span className="text-[11.5px] text-faint hidden sm:block">Select an option or press 1–4</span>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 text-[10.5px] text-faint">
        <span className="flex items-center gap-1"><Sparkles size={10} />Instant feedback</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Flag size={10} />No timer</span>
        <span>·</span>
        <span>Answers sync to revision</span>
      </div>
    </div>
  )
}
