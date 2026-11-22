import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy, Lock, CheckCircle2, Flame, Layers, Star, Cpu, GitBranch, Layers2, Terminal,
  Brain, CheckCheck, Check, Repeat, Zap, Crown, Sparkles, type LucideIcon,
} from 'lucide-react'
import { useArena } from '../store/arena'
import { useActiveSubject } from '../hooks/useSubject'
import { Button, Card, Badge, ProgressBar, Stat, SectionHeader, Segmented, EmptyState } from '../components/common/ui'
import { Stagger, StaggerItem, Reveal, HoverLift } from '../components/common/motion'
import { ACHIEVEMENTS, LEVELS, levelForXp, totalQuestionsAnswered } from '../services/gamification'
import { computeOverallStats } from '../services/analytics'
import { formatDuration } from '../services/scoring'

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  layers: Layers,
  crown: Crown,
  star: Star,
  cpu: Cpu,
  'git-branch': GitBranch,
  'layers-2': Layers2,
  terminal: Terminal,
  brain: Brain,
  'check-check': CheckCheck,
  check: Check,
  flame: Flame,
  repeat: Repeat,
  zap: Zap,
}

type Filter = 'all' | 'unlocked' | 'locked'

function nextAchievements(data: ReturnType<typeof useArena.getState>['data']) {
  const answered = totalQuestionsAnswered(data)
  const examCount = data.attempts.filter(
    (a) => a.mode === 'standard' || a.mode === 'random' || a.mode === 'daily',
  ).length
  const probes: { id: string; current: number; target: number }[] = [
    { id: 'first-victory', current: Math.min(1, data.attempts.length), target: 1 },
    { id: 'exams-5', current: examCount, target: 5 },
    { id: 'exams-10', current: examCount, target: 10 },
    { id: 'exams-25', current: examCount, target: 25 },
    { id: 'exams-50', current: examCount, target: 50 },
    { id: 'exams-100', current: examCount, target: 100 },
    { id: 'questions-500', current: answered, target: 500 },
    { id: 'questions-1000', current: answered, target: 1000 },
    { id: 'streak-7', current: Math.max(data.streak.current, data.streak.best), target: 7 },
    { id: 'streak-30', current: Math.max(data.streak.current, data.streak.best), target: 30 },
    { id: 'revision-master', current: data.revision.filter((r) => r.mastered).length, target: 10 },
  ]
  return probes
    .filter((p) => !data.achievements[p.id])
    .map((p) => ({ ...p, def: ACHIEVEMENTS.find((a) => a.id === p.id)! }))
    .filter((p) => Boolean(p.def))
    .sort((a, b) => b.current / b.target - a.current / a.target)
}

export default function AchievementsPage() {
  const data = useArena((s) => s.data)
  const subject = useActiveSubject()
  const [filter, setFilter] = useState<Filter>('all')

  const unlockedCount = Object.keys(data.achievements).length
  const level = levelForXp(data.xp)
  const overall = useMemo(() => computeOverallStats(data, subject), [data, subject])
  const upcoming = useMemo(() => nextAchievements(data).slice(0, 4), [data])

  const visible = ACHIEVEMENTS.filter((a) => {
    const unlocked = Boolean(data.achievements[a.id])
    if (filter === 'unlocked') return unlocked
    if (filter === 'locked') return !unlocked
    return true
  })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Achievements</h2>
        <p className="text-[13px] text-muted mt-0.5">
          {unlockedCount} of {ACHIEVEMENTS.length} unlocked · each unlock awards 50 XP.
        </p>
      </div>

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StaggerItem><Stat label="Unlocked" value={`${unlockedCount}/${ACHIEVEMENTS.length}`} icon={<Trophy size={14} />} tone="var(--warning)" /></StaggerItem>
        <StaggerItem><Stat label="Level" value={level.current.level} sub={level.next ? `${level.needed - level.intoLevel} XP to next` : 'max level'} icon={<Sparkles size={14} />} tone="var(--accent)" /></StaggerItem>
        <StaggerItem><Stat label="Total XP" value={data.xp.toLocaleString()} sub="all sources" icon={<Zap size={14} />} /></StaggerItem>
        <StaggerItem><Stat label="Study time" value={formatDuration(overall.studyTimeMs)} sub={`${overall.questionsAnswered} questions`} icon={<Flame size={14} />} tone="var(--success)" /></StaggerItem>
      </Stagger>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-[var(--warning)]" />
            <span className="text-[13px] font-semibold">Collection progress</span>
          </div>
          <span className="text-[11px] mono text-faint">{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</span>
        </div>
        <ProgressBar value={unlockedCount} max={ACHIEVEMENTS.length} tone="linear-gradient(90deg, var(--warning), var(--secondary))" />
      </Card>

      {upcoming.length > 0 && (
        <Reveal>
        <Card className="p-4">
          <SectionHeader title="Closest to unlocking" description="Ranked by completion of the underlying condition." icon={<Sparkles size={15} />} />
          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-2" gap={0.04}>
            {upcoming.map((p) => {
              const Icon = ICONS[p.def.icon] ?? Trophy
              const pct = Math.min(100, (p.current / p.target) * 100)
              return (
                <StaggerItem key={p.id}>
                <div className="rounded-lg border border-[var(--border)] p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={13} className="text-[var(--accent)] shrink-0" />
                    <span className="text-[12px] font-medium truncate">{p.def.name}</span>
                    <span className="text-[10.5px] mono text-faint ml-auto shrink-0">
                      {Math.round(p.current)}/{p.target}
                    </span>
                  </div>
                  <ProgressBar value={pct} height={3} tone="var(--accent)" />
                </div>
                </StaggerItem>
              )
            })}
          </Stagger>
        </Card>
        </Reveal>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: ACHIEVEMENTS.length },
            { value: 'unlocked', label: 'Unlocked', count: unlockedCount },
            { value: 'locked', label: 'Locked', count: ACHIEVEMENTS.length - unlockedCount },
          ]}
        />
        <Link to="/arena">
          <Button variant="outline" size="sm">Earn more XP →</Button>
        </Link>
      </div>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Lock size={20} />}
            title="Nothing here"
            description="No achievements match this filter yet. Complete exams, build streaks and clear your revision queue to unlock them."
          />
        </Card>
      ) : (
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" gap={0.03}>
          {visible.map((a) => {
            const unlockedAt = data.achievements[a.id]
            const unlocked = Boolean(unlockedAt)
            const Icon = ICONS[a.icon] ?? Trophy
            return (
              <StaggerItem key={a.id} className="h-full">
              <HoverLift className="h-full">
              <Card
                className={`p-3.5 h-full transition-colors ${unlocked ? 'border-[color-mix(in_srgb,var(--warning)_35%,transparent)]' : ''}`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: unlocked ? 'var(--warning-soft)' : 'var(--surface-2)',
                      color: unlocked ? 'var(--warning)' : 'var(--text-faint)',
                    }}
                  >
                    {unlocked ? <Icon size={17} /> : <Lock size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className={`text-[12.5px] font-semibold truncate ${unlocked ? '' : 'text-muted'}`}>{a.name}</h3>
                      {unlocked && <CheckCircle2 size={12} className="text-[var(--success)] shrink-0" />}
                    </div>
                    <p className="text-[11.5px] text-muted leading-relaxed">{a.description}</p>
                    <div className="mt-1.5 text-[10px] text-faint mono">
                      {unlocked
                        ? `Unlocked ${new Date(unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : 'Locked'}
                    </div>
                  </div>
                </div>
              </Card>
              </HoverLift>
              </StaggerItem>
            )
          })}
        </Stagger>
      )}

      <Reveal>
      <Card className="p-4">
        <SectionHeader title="Level ladder" description="XP thresholds across all 20 levels." icon={<Layers size={15} />} />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-1.5">
          {LEVELS.map((l) => {
            const reached = data.xp >= l.requiredXp
            const isCurrent = level.current.level === l.level
            return (
              <div
                key={l.level}
                className={`rounded-lg border p-2 ${
                  isCurrent
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : reached
                      ? 'border-[var(--border)] bg-[var(--surface-2)]'
                      : 'border-[var(--border)]'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[11px] font-semibold mono ${reached ? 'text-[var(--text)]' : 'text-faint'}`}>
                    Lv {l.level}
                  </span>
                  {isCurrent && <Badge tone="accent">You</Badge>}
                </div>
                <div className="text-[10px] mono text-faint">{l.requiredXp.toLocaleString()} XP</div>
              </div>
            )
          })}
        </div>
      </Card>
      </Reveal>
    </div>
  )
}
