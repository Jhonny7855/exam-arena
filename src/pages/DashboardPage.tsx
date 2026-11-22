import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, Flame, Trophy, Target, Play, Shuffle, Repeat, Calendar, ArrowRight,
  CheckCircle2, TrendingUp, Clock, BookOpen, Sparkles, Swords,
} from 'lucide-react'
import { useArena } from '../store/arena'
import { useActiveSubject, useSubjectMeta } from '../hooks/useSubject'
import { Button, Card, Badge, ProgressBar, Stat, SectionHeader, EmptyState } from '../components/common/ui'
import { Reveal, Stagger, StaggerItem, AnimatedNumber, AuroraBackground } from '../components/common/motion'
import { computeOverallStats, computeUnitPerformance, scoreTrend, MASTERY_TONE } from '../services/analytics'
import { levelForXp } from '../services/gamification'
import { unitsFor } from '../data/syllabus'
import { TESTS_BY_SUBJECT, TOTAL_TESTS } from '../data/tests'
import { formatDuration } from '../services/scoring'
import { todayKey } from '../services/storage'

export default function DashboardPage() {
  const data = useArena((s) => s.data)
  const subject = useActiveSubject()
  const meta = useSubjectMeta()
  const navigate = useNavigate()

  const stats = useMemo(() => computeOverallStats(data, subject), [data, subject])
  const units = useMemo(() => computeUnitPerformance(data, subject), [data, subject])
  const trend = useMemo(() => scoreTrend(data, subject, 12), [data, subject])
  const level = levelForXp(data.xp)

  const syllabus = useMemo(() => unitsFor(subject), [subject])
  const tests = useMemo(() => TESTS_BY_SUBJECT[subject], [subject])

  const recent = useMemo(
    () =>
      data.attempts
        .filter((a) => a.subject === subject)
        .sort((a, b) => b.submittedAt - a.submittedAt)
        .slice(0, 5),
    [data.attempts, subject],
  )

  const challengeDone = data.dailyChallenge.date === todayKey() && data.dailyChallenge.completed
  const nextTest = tests.find((t) => !data.attempts.some((a) => a.testId === t.id)) ?? tests[0]
  const activeKey = Object.keys(data.activeSessions).find((k) => data.activeSessions[k].subject === subject)

  const overallMastery = units.filter((u) => u.answered > 0).length
    ? Math.round(units.reduce((s, u) => s + u.accuracy, 0) / units.filter((u) => u.answered > 0).length)
    : 0

  const quickActions = [
    {
      title: activeKey ? 'Resume exam' : 'Continue learning',
      desc: activeKey ? 'An exam session is waiting for you.' : `Next up: ${nextTest.name}`,
      icon: activeKey ? Clock : Play,
      to: activeKey ? `/exam/${data.activeSessions[activeKey].testId}?resume=1` : `/exam/${nextTest.id}`,
      tone: 'accent',
    },
    { title: 'Start random exam', desc: '30 balanced questions, all units.', icon: Shuffle, to: '/random', tone: 'secondary' },
    { title: 'Practice weak topics', desc: 'Targeted drills from your data.', icon: Target, to: '/weak', tone: 'warning' },
    { title: 'Daily challenge', desc: challengeDone ? 'Completed today.' : '10 questions · +25 XP', icon: Calendar, to: '/random?mode=daily', tone: 'success' },
  ]

  return (
    <div className="space-y-5">
      <Reveal>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Welcome back, {data.profile.name}.</h2>
          <p className="text-[13.5px] text-muted mt-0.5">
            {meta.code} · {meta.tagline}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.04}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[16px] border border-[var(--border)] hero-glow bg-[var(--surface)]"
        >
          <AuroraBackground />
          <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
          <div className="relative p-5 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <Badge tone="accent">
                    <Sparkles size={11} /> Level {level.current.level}
                  </Badge>
                  {data.streak.current > 0 && (
                    <Badge tone="warning">
                      <Flame size={11} /> {data.streak.current} day streak
                    </Badge>
                  )}
                  <Badge tone="neutral">{meta.code}</Badge>
                </div>
                <h3 className="text-lg font-semibold tracking-tight mb-1">
                  {overallMastery >= 75 ? 'Mastery is within reach.' : overallMastery >= 45 ? 'Solid momentum. Keep pushing.' : 'Build the foundation, one unit at a time.'}
                </h3>
                <p className="text-[13px] text-muted max-w-lg mb-4">
                  {stats.testsCompleted === 0
                    ? `Start with Test 01 to calibrate your baseline in ${meta.shortName}. Every attempt feeds your analytics and weakness engine.`
                    : `You have completed ${stats.testsCompleted} of ${TOTAL_TESTS} tests with an average of ${stats.averageScore.toFixed(1)}/30.`}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Button variant="primary" icon={<Play size={15} />} onClick={() => navigate(activeKey ? `/exam/${data.activeSessions[activeKey].testId}?resume=1` : `/exam/${nextTest.id}`)}>
                    {activeKey ? 'Resume exam' : 'Continue learning'}
                  </Button>
                  <Button variant="outline" icon={<Swords size={15} />} onClick={() => navigate('/arena')}>
                    Test arena
                  </Button>
                </div>

                <div className="max-w-sm">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-muted">Level {level.current.level} → {level.next ? level.next.level : 'MAX'}</span>
                    <span className="mono text-faint">
                      {level.next ? `${data.xp} / ${level.next.requiredXp} XP` : `${data.xp} XP`}
                    </span>
                  </div>
                  <ProgressBar value={level.progress * 100} tone="linear-gradient(90deg, var(--accent), var(--secondary))" />
                </div>
              </div>

              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:w-44 shrink-0">
                <div className="rounded-xl bg-[color-mix(in_srgb,var(--surface-2)_70%,transparent)] border border-[var(--border)] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-faint mb-1">Mastery</div>
                  <div className="text-xl font-semibold mono">
                    <AnimatedNumber value={overallMastery} suffix="%" />
                  </div>
                </div>
                <div className="rounded-xl bg-[color-mix(in_srgb,var(--surface-2)_70%,transparent)] border border-[var(--border)] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-faint mb-1">XP</div>
                  <div className="text-xl font-semibold mono">
                    <AnimatedNumber value={data.xp} />
                  </div>
                </div>
                <div className="rounded-xl bg-[color-mix(in_srgb,var(--surface-2)_70%,transparent)] border border-[var(--border)] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-faint mb-1">Streak</div>
                  <div className="text-xl font-semibold mono">
                    <AnimatedNumber value={data.streak.current} suffix="d" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Reveal>

      <Stagger className="grid grid-cols-2 lg:grid-cols-6 gap-3" gap={0.04}>
        {[
          { label: 'Tests done', value: `${stats.testsCompleted}/${TOTAL_TESTS}`, icon: <BookOpen size={14} /> },
          { label: 'Avg score', value: stats.averageScore.toFixed(1), sub: 'out of 30', icon: <TrendingUp size={14} /> },
          { label: 'Best score', value: `${stats.bestScore}`, sub: 'out of 30', icon: <Trophy size={14} />, tone: 'var(--warning)' },
          { label: 'Accuracy', value: `${Math.round(stats.accuracy)}%`, sub: `${stats.questionsAnswered} answered`, icon: <Target size={14} />, tone: 'var(--success)' },
          { label: 'Questions', value: stats.questionsAnswered.toLocaleString(), sub: 'total attempted', icon: <CheckCircle2 size={14} /> },
          { label: 'Study time', value: formatDuration(stats.studyTimeMs), sub: 'across all attempts', icon: <Clock size={14} /> },
        ].map((s) => (
          <StaggerItem key={s.label}>
            <Stat label={s.label} value={s.value} sub={s.sub} icon={s.icon} tone={s.tone} />
          </StaggerItem>
        ))}
      </Stagger>

      <div>
        <SectionHeader title="Quick start" description="Jump straight into the mode that fits your goal." />
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" gap={0.05}>
          {quickActions.map((action) => {
            const Icon = action.icon
            const toneMap: Record<string, string> = {
              accent: 'var(--accent)',
              secondary: 'var(--secondary)',
              warning: 'var(--warning)',
              success: 'var(--success)',
            }
            return (
              <StaggerItem key={action.title}>
                <Link to={action.to} className="block h-full">
                  <Card hover className="p-4 h-full group">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center"
                        style={{ background: `color-mix(in srgb, ${toneMap[action.tone]} 14%, transparent)`, color: toneMap[action.tone] }}
                      >
                        <Icon size={17} />
                      </div>
                      <ArrowRight size={15} className="text-[var(--text-faint)] group-hover:text-[var(--text)] group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="text-[13.5px] font-semibold mb-0.5">{action.title}</div>
                    <div className="text-[12px] text-muted">{action.desc}</div>
                  </Card>
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-4">
          <SectionHeader
            title="Syllabus progress"
            description={`Accuracy and mastery across all ${syllabus.length} units.`}
            action={<Link to="/analytics" className="text-[12px] text-[var(--accent)] hover:underline">Analytics →</Link>}
          />
          <div className="space-y-2.5">
            {units.map((u) => {
              const unit = syllabus.find((x) => x.id === u.unit) ?? syllabus[0]
              return (
                <Link key={u.unit} to={`/practice/${u.unit}`} className="block group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0 mono" style={{ background: `color-mix(in srgb, ${unit.accent} 14%, transparent)`, color: unit.accent }}>
                      U{u.unit}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[12.5px] font-medium truncate group-hover:text-[var(--accent)] transition-colors">{u.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-faint mono">{u.answered}q</span>
                          <span className="text-[11px] font-medium mono" style={{ color: MASTERY_TONE[u.mastery] }}>
                            {u.answered ? `${Math.round(u.accuracy)}%` : '—'}
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={u.answered ? u.accuracy : 0} height={4} tone={unit.accent} />
                    </div>
                    <span className="hidden sm:block text-[10px] w-20 text-right shrink-0" style={{ color: MASTERY_TONE[u.mastery] }}>
                      {u.answered ? u.mastery : 'Not started'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionHeader title="Performance trend" description="Score history" />
            {trend.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-[12px] text-faint">No attempts yet</div>
            ) : (
              <div className="h-32 flex items-end gap-1.5">
                {trend.map((p, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-6 hidden group-hover:block text-[10px] mono bg-[var(--surface-3)] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                      {p.score}/30
                    </div>
                    <motion.div
                      className="w-full rounded-t-[3px]"
                      style={{ background: p.percentage >= 60 ? 'var(--success)' : p.percentage >= 40 ? 'var(--accent)' : 'var(--warning)' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, (p.score / 30) * 100)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.03 }}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <SectionHeader title="Daily challenge" description="Fresh set every day" />
            {challengeDone ? (
              <div className="flex items-center gap-2.5 text-[13px]">
                <CheckCircle2 size={18} className="text-[var(--success)]" />
                <div>
                  <div className="font-medium">Completed today</div>
                  <div className="text-[12px] text-muted">Scored {data.dailyChallenge.score}/10 · +25 XP</div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[12px] text-muted mb-3">
                  <span className="mono">10 questions</span>
                  <span className="text-[var(--border-strong)]">·</span>
                  <span>no timer</span>
                  <span className="text-[var(--border-strong)]">·</span>
                  <span className="text-[var(--success)]">+25 XP</span>
                </div>
                <Button variant="primary" fullWidth size="sm" icon={<Calendar size={14} />} onClick={() => navigate('/random?mode=daily')}>
                  Start challenge
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>

      <Card className="p-4">
        <SectionHeader
          title="Recent tests"
          description="Your latest attempts and results."
          action={<Link to="/arena" className="text-[12px] text-[var(--accent)] hover:underline">All tests →</Link>}
        />
        {recent.length === 0 ? (
          <EmptyState
            icon={<Swords size={20} />}
            title="No attempts yet"
            description="Your results, explanations and analytics will appear here after your first exam."
            action={<Button variant="primary" size="sm" onClick={() => navigate(`/exam/${tests[0].id}`)}>Start Test 01</Button>}
          />
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-faint border-b border-[var(--border)]">
                  <th className="pb-2 font-medium">Test</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Percentage</th>
                  <th className="pb-2 font-medium hidden md:table-cell">Duration</th>
                  <th className="pb-2 font-medium hidden lg:table-cell">Date</th>
                  <th className="pb-2 font-medium text-right">Review</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/40 transition-colors">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium truncate max-w-[220px]">{a.testName}</div>
                      <div className="text-[10.5px] text-faint capitalize">{a.mode} mode</div>
                    </td>
                    <td className="py-2.5 pr-3 mono font-semibold">{a.score}/{a.total}</td>
                    <td className="py-2.5 pr-3 hidden sm:table-cell">
                      <Badge tone={a.percentage >= 80 ? 'success' : a.percentage >= 60 ? 'accent' : a.percentage >= 40 ? 'warning' : 'danger'}>
                        {a.percentage}%
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-3 hidden md:table-cell text-muted mono">{formatDuration(a.durationMs)}</td>
                    <td className="py-2.5 pr-3 hidden lg:table-cell text-muted">
                      {new Date(a.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link to={`/results/${a.id}`} className="text-[12px] text-[var(--accent)] hover:underline">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
