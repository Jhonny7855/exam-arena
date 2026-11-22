import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Info, BookOpen, Cpu, Layers, Database, Shield, Sparkles, Swords, Target, Repeat,
  BarChart3, Trophy, Settings as SettingsIcon, Github, CheckCircle2, NotebookText, ListChecks,
} from 'lucide-react'
import { Card, Badge, SectionHeader, Button, ProgressBar } from '../components/common/ui'
import { unitsFor, stagesFor } from '../data/syllabus'
import { bankStats } from '../data/questionBank'
import { TESTS_BY_SUBJECT, testStats } from '../data/tests'
import { SUBJECTS } from '../data/subjects'
import { useSubjectMeta } from '../hooks/useSubject'
import { ACHIEVEMENTS, LEVELS } from '../services/gamification'

const MODULES = [
  { to: '/arena', label: 'Test Arena', desc: '100 structured tests across 5 progressive stages.', icon: Swords },
  { to: '/practice', label: 'Unit Practice', desc: 'Instant-feedback drills for every syllabus unit.', icon: Layers },
  { to: '/random', label: 'Random & Daily', desc: 'Balanced 30-question exams and a daily 10-question challenge.', icon: Sparkles },
  { to: '/weak', label: 'Weak Topics', desc: 'Rule-based weakness detection with targeted drills.', icon: Target },
  { to: '/essentials', label: '150 Essentials', desc: 'The most important questions, curated per unit, with answers.', icon: ListChecks },
  { to: '/cheatsheet', label: 'Cheatsheet', desc: 'Per-unit formulas, key notes and the traps exams target.', icon: NotebookText },
  { to: '/revision', label: 'Revision Center', desc: 'Spaced repetition over wrong answers and saved questions.', icon: Repeat },
  { to: '/analytics', label: 'Analytics', desc: 'Unit, topic and difficulty breakdowns with trend charts.', icon: BarChart3 },
  { to: '/achievements', label: 'Achievements', desc: '18 achievements, 20 levels and XP progression.', icon: Trophy },
  { to: '/settings', label: 'Settings', desc: 'Theme, exam behaviour, data export and reset.', icon: SettingsIcon },
]

const PIPELINE = [
  {
    title: 'Parametric question families',
    body: 'Each question family is a generator function that receives a seeded RNG and returns a prompt, a correct answer and three distractors with per-option explanations.',
  },
  {
    title: 'Answers computed, never asserted',
    body: 'DFA and NFA membership, subset construction, minimisation, CYK parsing, PDA and TM traces, regex equivalence and combinatorial counts are all produced by real simulation code in the app.',
  },
  {
    title: 'Deterministic seeding and dedupe',
    body: 'Every variant uses a stable seed derived from its family id and index, so the bank is identical on every load. A normalised question-plus-options signature removes duplicates.',
  },
  {
    title: 'Validation gate',
    body: 'Each draft must pass structural checks: four distinct non-empty options, an in-range answer index, a substantive explanation and non-trivial per-option explanations. Failures are recorded, not shipped.',
  },
]

export default function AboutPage() {
  const meta = useSubjectMeta()
  const syllabus = useMemo(() => unitsFor(meta.id), [meta.id])
  const stages = useMemo(() => stagesFor(meta.id), [meta.id])
  const bank = useMemo(() => bankStats(meta.id), [meta.id])
  const stats = useMemo(() => testStats(meta.id), [meta.id])
  const tests = TESTS_BY_SUBJECT[meta.id]

  const unitsCount = syllabus.length
  const topicsCount = syllabus.reduce((s, u) => s + u.topics.length, 0)
  const perUnitMax = Math.max(...bank.byUnit.map((b) => b.count))
  const totalQuestions = SUBJECTS.reduce((s, sub) => s + bankStats(sub.id).total, 0)

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">About {meta.code} Arena</h2>
        <p className="text-[13px] text-muted mt-0.5">{meta.tagline}</p>
      </div>

      <Card className="p-5 relative overflow-hidden">
        <div className="absolute inset-0 hero-glow opacity-70 pointer-events-none" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge tone="accent">{meta.courseCode}</Badge>
            <Badge tone="secondary">{meta.name}</Badge>
            <Badge tone="neutral">{meta.semester}</Badge>
          </div>
          <p className="text-[13px] text-muted leading-relaxed max-w-2xl">
            A complete, offline exam system for the {meta.code} syllabus. It pairs a 100-test structured arena with
            instant-feedback practice, spaced repetition, weakness detection and full performance analytics — all computed
            locally from your own attempt history, with no accounts and no network calls. {meta.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Link to="/arena"><Button variant="primary" size="sm" icon={<Swords size={13} />}>Open Test Arena</Button></Link>
            <Link to="/practice"><Button variant="outline" size="sm" icon={<BookOpen size={13} />}>Browse units</Button></Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Questions in bank', value: bank.total.toLocaleString() },
          { label: 'Structured tests', value: tests.length },
          { label: 'Syllabus units', value: unitsCount },
          { label: 'Topics covered', value: topicsCount },
        ].map((s) => (
          <Card key={s.label} className="p-3.5">
            <div className="text-[10.5px] uppercase tracking-wider text-faint mb-1">{s.label}</div>
            <div className="text-xl font-semibold mono">{s.value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <SectionHeader title="Question bank composition" description={`${bank.families} generator families · ${bank.issues} rejected drafts`} icon={<Database size={15} />} />
        <div className="space-y-2.5">
          {bank.byUnit.map((b) => {
            const unit = syllabus.find((u) => u.id === b.unit) ?? syllabus[0]
            return (
              <div key={b.unit} className="flex items-center gap-3">
                <div
                  className="h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-semibold mono shrink-0"
                  style={{ background: `color-mix(in srgb, ${unit.accent} 14%, transparent)`, color: unit.accent }}
                >
                  U{b.unit}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11.5px] truncate">{unit.title}</span>
                    <span className="text-[10.5px] mono text-faint shrink-0 ml-2">{b.count}</span>
                  </div>
                  <ProgressBar value={b.count} max={perUnitMax} height={3} tone={unit.accent} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-2 text-[11px]">
          {bank.byDifficulty.map((d) => (
            <Badge key={d.difficulty} tone={d.difficulty === 'Easy' ? 'success' : d.difficulty === 'Medium' ? 'warning' : 'danger'}>
              {d.difficulty} · {d.count}
            </Badge>
          ))}
          <span className="text-faint">Each test draws 30 unique questions from this pool.</span>
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeader title="How the bank is built" description="Correctness by construction, not by assertion." icon={<Cpu size={15} />} />
        <div className="space-y-2.5">
          {PIPELINE.map((step, i) => (
            <div key={step.title} className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] text-[10.5px] font-semibold mono flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <div className="text-[12.5px] font-medium mb-0.5">{step.title}</div>
                <p className="text-[11.5px] text-muted leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <SectionHeader title="Test stages" description="Difficulty ramps across five stages." icon={<Layers size={15} />} />
          <div className="space-y-2">
            {stages.map((stage) => {
              const count = stats.perStage.find((s) => s.stage === stage.id)?.count ?? 0
              return (
                <div key={stage.id} className="rounded-lg border border-[var(--border)] p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium">
                      {stage.id}. {stage.name}
                    </span>
                    <span className="text-[10.5px] mono text-faint">
                      Tests {stage.range[0]}–{stage.range[1]} · {count}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed mb-1.5">{stage.goal}</p>
                  <div className="flex items-center gap-1 text-[10px] mono">
                    <span className="text-[var(--success)]">E {Math.round(stage.mix.Easy * 100)}%</span>
                    <span className="text-[var(--warning)]">M {Math.round(stage.mix.Medium * 100)}%</span>
                    <span className="text-[var(--danger)]">H {Math.round(stage.mix.Hard * 100)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Modules" description="Everything is reachable from the sidebar." icon={<Sparkles size={15} />} />
          <div className="space-y-1.5">
            {MODULES.map((m) => {
              const Icon = m.icon
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-[var(--surface-2)] transition-colors group"
                >
                  <Icon size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium group-hover:text-[var(--accent)] transition-colors">{m.label}</div>
                    <div className="text-[11px] text-muted">{m.desc}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <SectionHeader title="Progression system" description={`${ACHIEVEMENTS.length} achievements across ${LEVELS.length} levels.`} icon={<Trophy size={15} />} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11.5px]">
          <div className="rounded-lg bg-[var(--surface-2)] p-3">
            <div className="font-medium mb-1">XP sources</div>
            <ul className="space-y-1 text-muted">
              <li>· 50 XP per completed attempt</li>
              <li>· +100 XP for a perfect score</li>
              <li>· +25 XP for the daily challenge</li>
              <li>· +20 XP for scoring 80% or above</li>
              <li>· +50 XP per achievement unlocked</li>
            </ul>
          </div>
          <div className="rounded-lg bg-[var(--surface-2)] p-3">
            <div className="font-medium mb-1">Streaks</div>
            <p className="text-muted leading-relaxed">
              Any completed session on a new day extends your streak. Consecutive days accumulate; a missed day resets the
              current streak while the best streak is preserved.
            </p>
          </div>
          <div className="rounded-lg bg-[var(--surface-2)] p-3">
            <div className="font-medium mb-1">Mastery bands</div>
            <ul className="space-y-1 text-muted">
              <li>· Below 40% — Critical</li>
              <li>· 40–59% — Weak</li>
              <li>· 60–74% — Developing</li>
              <li>· 75–89% — Strong</li>
              <li>· 90%+ — Mastered</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Privacy and storage" description="Local-first by design." icon={<Shield size={15} />} />
        <div className="flex items-start gap-2.5 mb-3">
          <CheckCircle2 size={14} className="text-[var(--success)] mt-0.5 shrink-0" />
          <p className="text-[11.5px] text-muted leading-relaxed">
            No sign-up, no analytics beacons, no external requests at runtime. All attempts, XP, revision schedules and
            settings live in this browser's local storage and can be exported as a JSON backup from Settings at any time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-faint">
          <Badge tone="neutral"><Info size={10} /> {bank.total.toLocaleString()} questions</Badge>
          <Badge tone="neutral">{tests.length} tests</Badge>
          <Badge tone="neutral">{unitsCount} units · {topicsCount} topics</Badge>
          <Badge tone="neutral">{totalQuestions.toLocaleString()} across both subjects</Badge>
          <span className="flex items-center gap-1 ml-auto"><Github size={11} /> Offline-capable static build</span>
        </div>
      </Card>
    </div>
  )
}
