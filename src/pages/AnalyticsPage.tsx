import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, TrendingUp, Target, Clock, CheckCircle2, Layers, Flame, Lightbulb,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'
import { useArena } from '../store/arena'
import { useActiveSubject } from '../hooks/useSubject'
import { Button, Card, Badge, ProgressBar, Stat, SectionHeader, Segmented, EmptyState } from '../components/common/ui'
import {
  computeOverallStats, computeUnitPerformance, computeTopicPerformance, computeDifficultyPerformance,
  scoreTrend, computeInsights, MASTERY_TONE,
} from '../services/analytics'
import { unitsFor } from '../data/syllabus'
import { TOTAL_TESTS } from '../data/tests'
import { formatDuration } from '../services/scoring'
import { levelForXp } from '../services/gamification'
import { attemptsOfSubject } from '../services/analytics'

type Tab = 'overview' | 'units' | 'topics' | 'difficulty'

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2.5 py-1.5 shadow-[var(--shadow-md)]">
      <div className="text-[10.5px] text-faint mb-0.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="text-[11.5px] mono" style={{ color: p.color ?? 'var(--text)' }}>
          {p.name}: {p.value}
          {p.dataKey === 'percentage' ? '%' : ''}
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const data = useArena((s) => s.data)
  const subject = useActiveSubject()
  const [tab, setTab] = useState<Tab>('overview')

  const overall = useMemo(() => computeOverallStats(data, subject), [data, subject])
  const units = useMemo(() => computeUnitPerformance(data, subject), [data, subject])
  const topics = useMemo(() => computeTopicPerformance(data, subject), [data, subject])
  const difficulty = useMemo(() => computeDifficultyPerformance(data, subject), [data, subject])
  const trend = useMemo(() => scoreTrend(data, subject, 24), [data, subject])
  const insights = useMemo(() => computeInsights(data, subject), [data, subject])
  const level = levelForXp(data.xp)
  const syllabus = useMemo(() => unitsFor(subject), [subject])

  const practised = units.filter((u) => u.answered > 0)
  const strongest = practised.length ? practised.reduce((a, b) => (b.accuracy > a.accuracy ? b : a)) : null
  const weakest = practised.length ? practised.reduce((a, b) => (b.accuracy < a.accuracy ? b : a)) : null

  const radarData = units.map((u) => ({
    unit: `U${u.unit}`,
    accuracy: Math.round(u.accuracy),
    fullMark: 100,
  }))

  const difficultyBars = difficulty.map((d) => ({
    name: d.difficulty,
    accuracy: Math.round(d.accuracy),
    answered: d.answered,
    color: d.difficulty === 'Easy' ? 'var(--success)' : d.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)',
  }))

  const topicGroups = useMemo(
    () =>
      syllabus.map((unit) => ({
        unit,
        topics: topics.filter((t) => t.unit === unit.id).sort((a, b) => b.accuracy - a.accuracy),
      })),
    [topics, syllabus],
  )

  if (attemptsOfSubject(data, subject).length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Analytics</h2>
          <p className="text-[13px] text-muted mt-0.5">Every metric here is computed from your real attempt history.</p>
        </div>
        <Card>
          <EmptyState
            icon={<BarChart3 size={20} />}
            title="No data to analyse yet"
            description="Complete an exam or a practice session and this page will break down accuracy by unit, topic, difficulty and time."
            action={<Link to="/arena"><Button variant="primary" size="sm">Start Test 01</Button></Link>}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Analytics</h2>
          <p className="text-[13px] text-muted mt-0.5">
            {overall.totalAttempts} attempt{overall.totalAttempts === 1 ? '' : 's'} · {overall.questionsAnswered} questions answered
          </p>
        </div>
        <Link to="/weak">
          <Button variant="outline" size="sm" icon={<Target size={13} />}>Open weak topics</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Stat label="Tests done" value={`${overall.testsCompleted}/${TOTAL_TESTS}`} icon={<Layers size={14} />} />
        <Stat label="Accuracy" value={`${Math.round(overall.accuracy)}%`} sub={`${overall.questionsAnswered} answered`} icon={<Target size={14} />} tone="var(--success)" />
        <Stat label="Avg score" value={overall.averageScore.toFixed(1)} sub="out of 30" icon={<TrendingUp size={14} />} />
        <Stat label="Best score" value={`${overall.bestScore}`} sub="out of 30" icon={<CheckCircle2 size={14} />} tone="var(--warning)" />
        <Stat label="Study time" value={formatDuration(overall.studyTimeMs)} sub="all attempts" icon={<Clock size={14} />} />
        <Stat label="Avg / question" value={formatDuration(overall.avgTimePerQuestionMs)} sub="across answers" icon={<Flame size={14} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-4">
          <SectionHeader
            title="Score progression"
            description="Percentage per attempt, oldest to newest."
            icon={<TrendingUp size={15} />}
            action={<span className="text-[11px] text-faint mono">last {trend.length}</span>}
          />
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-faint)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-faint)', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-strong)' }} />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  name="Score"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#scoreFill)"
                  dot={{ r: 2.5, fill: 'var(--accent)', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Level progress" description={`${data.xp.toLocaleString()} XP earned`} icon={<Flame size={15} />} />
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-semibold mono tracking-tight">{level.current.level}</span>
            <span className="text-[12px] text-faint mb-1.5">
              {level.next ? `→ level ${level.next.level}` : 'max level'}
            </span>
          </div>
          <ProgressBar value={level.progress * 100} tone="linear-gradient(90deg, var(--accent), var(--secondary))" />
          <div className="flex items-center justify-between text-[10.5px] text-faint mono mt-1.5 mb-4">
            <span>{level.intoLevel} XP into level</span>
            <span>{level.next ? `${level.needed} needed` : 'complete'}</span>
          </div>
          <div className="space-y-2 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">Current streak</span>
              <span className="mono font-medium">{data.streak.current}d</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">Best streak</span>
              <span className="mono font-medium">{data.streak.best}d</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">Syllabus coverage</span>
              <span className="mono font-medium">{Math.round(overall.completionRate)}%</span>
            </div>
          </div>
        </Card>
      </div>

      {insights.length > 0 && (
        <Card className="p-4">
          <SectionHeader title="Automated insights" description="Rule-based observations from your data." icon={<Lightbulb size={15} />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {insights.map((insight, i) => {
              const Icon = insight.tone === 'positive' ? ArrowUpRight : insight.tone === 'negative' ? ArrowDownRight : Minus
              const color = insight.tone === 'positive' ? 'var(--success)' : insight.tone === 'negative' ? 'var(--danger)' : 'var(--text-muted)'
              return (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-[var(--border)] p-2.5">
                  <Icon size={14} style={{ color }} className="mt-0.5 shrink-0" />
                  <p className="text-[12px] text-muted leading-relaxed">{insight.text}</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'overview', label: 'Unit overview' },
          { value: 'units', label: 'Per unit' },
          { value: 'topics', label: 'Per topic' },
          { value: 'difficulty', label: 'Difficulty' },
        ]}
      />

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <SectionHeader title="Unit accuracy" description="Percentage correct per unit." icon={<Layers size={15} />} />
            <div className="h-64 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={units.map((u) => ({ name: `U${u.unit}`, accuracy: Math.round(u.accuracy), answered: u.answered, accent: u.accent }))} margin={{ top: 6, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-faint)', fontSize: 10.5 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-faint)', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
                  <Bar dataKey="accuracy" name="Accuracy" radius={[4, 4, 0, 0]} maxBarSize={38}>
                    {units.map((u) => (
                      <Cell key={u.unit} fill={u.accent} fillOpacity={u.answered ? 0.9 : 0.28} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <SectionHeader title="Mastery shape" description="Accuracy profile across every syllabus unit." icon={<Target size={15} />} />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="unit" tick={{ fill: 'var(--text-muted)', fontSize: 10.5 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'var(--text-faint)', fontSize: 9 }} axisLine={false} tickCount={4} />
                  <Radar name="Accuracy" dataKey="accuracy" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.22} strokeWidth={2} />
                  <Tooltip content={<ChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {tab === 'units' && (
        <div className="space-y-2">
          {units.map((u) => {
            const unit = syllabus.find((x) => x.id === u.unit) ?? syllabus[0]
            return (
              <Card key={u.unit} className="p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-semibold mono shrink-0"
                    style={{ background: `color-mix(in srgb, ${unit.accent} 14%, transparent)`, color: unit.accent }}
                  >
                    U{u.unit}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Link to={`/practice/${u.unit}`} className="text-[12.5px] font-medium truncate hover:text-[var(--accent)]">
                        {u.title}
                      </Link>
                      <div className="flex items-center gap-2 shrink-0 text-[10.5px] mono text-faint">
                        <span>{u.correct}/{u.answered}</span>
                        <span style={{ color: MASTERY_TONE[u.mastery] }} className="font-medium">
                          {u.answered ? `${Math.round(u.accuracy)}%` : '—'}
                        </span>
                      </div>
                    </div>
                    <ProgressBar value={u.accuracy} height={5} tone={unit.accent} />
                    <div className="flex items-center justify-between mt-1 text-[10.5px] text-faint">
                      <span>{u.attempted} of {u.available} bank questions seen</span>
                      <span style={{ color: MASTERY_TONE[u.mastery] }}>{u.answered ? u.mastery : 'Not started'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'topics' && (
        <div className="space-y-3">
          {strongest && weakest && strongest.unit !== weakest.unit && (
            <Card className="p-3.5">
              <div className="flex flex-wrap items-center gap-3 text-[12px]">
                <Badge tone="success">Strongest · {strongest.title}</Badge>
                <Badge tone="danger">Weakest · {weakest.title}</Badge>
                <span className="text-muted">
                  {Math.round(strongest.accuracy - weakest.accuracy)} point accuracy gap.
                </span>
                <Link to="/weak" className="text-[var(--accent)] hover:underline ml-auto">Target the gaps →</Link>
              </div>
            </Card>
          )}
          {topicGroups.map(({ unit, topics: list }) => (
            <Card key={unit.id} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-semibold mono" style={{ background: `color-mix(in srgb, ${unit.accent} 14%, transparent)`, color: unit.accent }}>
                  U{unit.id}
                </span>
                <h3 className="text-[13px] font-semibold">{unit.title}</h3>
                <span className="text-[10.5px] text-faint">{list.length} topics</span>
              </div>
              <div className="space-y-2">
                {list.map((t) => (
                  <div key={t.topic} className="flex items-center gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[11.5px] truncate">{t.topic}</span>
                        <span className="text-[10.5px] mono text-faint shrink-0">
                          {t.answered ? `${t.correct}/${t.answered}` : 'not practised'}
                        </span>
                      </div>
                      <ProgressBar value={t.accuracy} height={3} tone={MASTERY_TONE[t.mastery]} />
                    </div>
                    <span className="text-[10.5px] w-16 text-right shrink-0" style={{ color: MASTERY_TONE[t.mastery] }}>
                      {t.answered ? `${Math.round(t.accuracy)}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'difficulty' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <SectionHeader title="Accuracy by difficulty" description="Where your marks are being lost." icon={<BarChart3 size={15} />} />
            <div className="h-56 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyBars} margin={{ top: 6, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-faint)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-faint)', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
                  <Bar dataKey="accuracy" name="Accuracy" radius={[4, 4, 0, 0]} maxBarSize={54}>
                    {difficultyBars.map((d) => (
                      <Cell key={d.name} fill={d.color} fillOpacity={d.answered ? 0.9 : 0.28} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-4">
            <SectionHeader title="Breakdown" description="Answered volume and accuracy." />
            <div className="space-y-3">
              {difficulty.map((d) => (
                <div key={d.difficulty}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: d.difficulty === 'Easy' ? 'var(--success)' : d.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)' }} />
                      {d.difficulty}
                    </span>
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
            <div className="mt-4 pt-3 border-t border-[var(--border)] text-[11.5px] text-muted leading-relaxed">
              Hard questions are the main differentiator in stages 4 and 5. If hard accuracy sits below 60%, drill
              Advanced Challenge tests before attempting the Master Arena.
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
