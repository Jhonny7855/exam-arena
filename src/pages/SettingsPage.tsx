import { useRef, useState } from 'react'
import {
  Settings as SettingsIcon, User, Palette, Timer, Keyboard, Database, Download, Upload,
  Trash2, Check, AlertTriangle, Sun, Moon, Eye, Lightbulb, Volume2, Sparkles, Type,
} from 'lucide-react'
import { useArena } from '../store/arena'
import { useActiveSubject } from '../hooks/useSubject'
import { Button, Card, Badge, SectionHeader, Modal } from '../components/common/ui'
import { exportData, parseImport, downloadJSON, STORAGE_KEY, DATA_VERSION, todayKey } from '../services/storage'
import { formatDuration } from '../services/scoring'
import { computeOverallStats } from '../services/analytics'
import type { Settings } from '../types'

function Row({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--border)] last:border-0">
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium">{label}</div>
        {description && <p className="text-[11.5px] text-muted mt-0.5 leading-relaxed max-w-md">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)] border border-[var(--border-strong)]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const data = useArena((s) => s.data)
  const subject = useActiveSubject()
  const updateSettings = useArena((s) => s.updateSettings)
  const setProfileName = useArena((s) => s.setProfileName)
  const resetAll = useArena((s) => s.resetAll)
  const importData = useArena((s) => s.importData)

  const [name, setName] = useState(data.profile.name)
  const [savedName, setSavedName] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importOk, setImportOk] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const s = data.settings
  const stats = computeOverallStats(data, subject)

  const commitName = () => {
    setProfileName(name)
    setSavedName(true)
    window.setTimeout(() => setSavedName(false), 1800)
  }

  const handleExport = () => {
    downloadJSON(`tafl-arena-backup-${todayKey()}.json`, exportData(data))
  }

  const handleFile = async (file: File) => {
    setImportError(null)
    setImportOk(null)
    const text = await file.text()
    const result = parseImport(text)
    if (!result.ok) {
      setImportError(result.error)
      return
    }
    importData(result.data)
    setImportOk(`Imported ${result.data.attempts.length} attempts and ${result.data.revision.length} revision items.`)
  }

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => updateSettings({ [key]: value } as Partial<Settings>)

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
        <p className="text-[13px] text-muted mt-0.5">Preferences are stored locally in this browser. Nothing leaves your device.</p>
      </div>

      <Card className="p-4">
        <SectionHeader title="Profile" description="Shown on the dashboard and header." icon={<User size={15} />} />
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="profile-name" className="block text-[11px] text-faint mb-1">Display name</label>
            <input
              id="profile-name"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitName() }}
              className="w-full h-9 px-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[13px] outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <Button variant="primary" onClick={commitName} disabled={!name.trim() || name.trim() === data.profile.name}>
            {savedName ? <><Check size={14} /> Saved</> : 'Save'}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-faint">
          <Badge tone="neutral">Member since {new Date(data.profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</Badge>
          <Badge tone="neutral">{stats.totalAttempts} attempts</Badge>
          <Badge tone="neutral">{formatDuration(stats.studyTimeMs)} studied</Badge>
        </div>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Appearance" description="Theme and motion preferences." icon={<Palette size={15} />} />

        <Row label="Theme" description="Dark is the default exam-room palette.">
          <div className="inline-flex items-center gap-1 p-1 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)]">
            {([
              ['dark', 'Dark', Moon],
              ['light', 'Light', Sun],
            ] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                onClick={() => set('theme', value)}
                className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[12px] font-medium transition-colors ${
                  s.theme === value ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Animations" description="Disable to remove all transitions and motion for maximum focus.">
          <Toggle checked={s.animations} onChange={(v) => set('animations', v)} label="Animations" />
        </Row>

        <Row label="Sound effects" description="Play a short tone on correct and incorrect answers.">
          <Toggle checked={s.sound} onChange={(v) => set('sound', v)} label="Sound effects" />
        </Row>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Exam behaviour" description="Applies to timed tests in the Test Arena." icon={<Timer size={15} />} />

        <Row label="Exam duration" description="Countdown length for standard tests. Auto-submits when it reaches zero.">
          <div className="inline-flex items-center gap-1 p-1 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)]">
            {[15, 20, 30, 45].map((m) => (
              <button
                key={m}
                onClick={() => set('examMinutes', m)}
                className={`px-2.5 h-7 rounded-md text-[12px] font-medium mono transition-colors ${
                  s.examMinutes === m ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </Row>

        <Row label="Question text size" description="Adjust readability of question stems during exams.">
          <div className="inline-flex items-center gap-2">
            <Type size={12} className="text-faint" />
            <input
              type="range"
              min={14}
              max={20}
              step={1}
              value={s.questionFontSize}
              onChange={(e) => set('questionFontSize', Number(e.target.value))}
              aria-label="Question font size"
              className="w-28 accent-[var(--accent)]"
            />
            <span className="text-[11px] mono text-faint w-8">{s.questionFontSize}px</span>
          </div>
        </Row>

        <Row label="Timer warnings" description="Highlight the countdown in the final 5 minutes and final minute.">
          <Toggle checked={s.timerWarnings} onChange={(v) => set('timerWarnings', v)} label="Timer warnings" />
        </Row>

        <Row label="Keyboard shortcuts" description="1–4 to answer, arrow keys to navigate, R to mark for review.">
          <Toggle checked={s.keyboardShortcuts} onChange={(v) => set('keyboardShortcuts', v)} label="Keyboard shortcuts" />
        </Row>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Practice behaviour" description="Controls instant-feedback drills." icon={<Eye size={15} />} />

        <Row label="Instant feedback" description="Reveal the correct answer and explanation immediately after each practice answer.">
          <Toggle checked={s.instantFeedback} onChange={(v) => set('instantFeedback', v)} label="Instant feedback" />
        </Row>

        <Row label="Show hints" description="Allow the optional hint button before answering in practice mode.">
          <Toggle checked={s.showHints} onChange={(v) => set('showHints', v)} label="Show hints" />
        </Row>
      </Card>

      <Card className="p-4">
        <SectionHeader title="Data" description="Back up, restore, or wipe your local progress." icon={<Database size={15} />} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <Button variant="outline" icon={<Download size={14} />} onClick={handleExport}>
            Export backup (JSON)
          </Button>
          <Button variant="outline" icon={<Upload size={14} />} onClick={() => fileRef.current?.click()}>
            Import backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />
        </div>

        {importError && (
          <div className="flex items-start gap-2 rounded-lg bg-[var(--danger-soft)] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] p-2.5 mb-3">
            <AlertTriangle size={13} className="text-[var(--danger)] mt-0.5 shrink-0" />
            <p className="text-[11.5px] text-[var(--danger)]">{importError}</p>
          </div>
        )}
        {importOk && (
          <div className="flex items-start gap-2 rounded-lg bg-[var(--success-soft)] border border-[color-mix(in_srgb,var(--success)_30%,transparent)] p-2.5 mb-3">
            <Check size={13} className="text-[var(--success)] mt-0.5 shrink-0" />
            <p className="text-[11.5px] text-[var(--success)]">{importOk}</p>
          </div>
        )}

        <div className="rounded-lg bg-[var(--surface-2)] p-2.5 text-[11px] text-muted leading-relaxed mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-[var(--text)]">Local storage</span>
            <span className="mono text-faint">schema v{DATA_VERSION}</span>
          </div>
          <div className="mono text-[10.5px] text-faint break-all">{STORAGE_KEY}</div>
          <div className="mt-1.5">
            {data.attempts.length} attempts · {data.revision.length} revision items · {data.savedQuestions.length} saved · {data.xp.toLocaleString()} XP
          </div>
        </div>

        <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => setResetOpen(true)}>
          Reset all progress
        </Button>
      </Card>

      <Card className="p-3.5">
        <div className="flex items-start gap-2.5">
          <Sparkles size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
          <p className="text-[11.5px] text-muted leading-relaxed">
            TAFL Arena runs entirely offline. Your attempts, analytics, revision queue and XP are saved in this browser's
            local storage under a single key, so exporting a backup before clearing browser data is recommended.
          </p>
        </div>
      </Card>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset all progress?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                resetAll()
                setResetOpen(false)
                setImportOk(null)
                setImportError(null)
              }}
            >
              Delete everything
            </Button>
          </>
        }
      >
        <div className="space-y-2.5">
          <div className="flex items-start gap-2 rounded-lg bg-[var(--danger-soft)] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] p-2.5">
            <AlertTriangle size={14} className="text-[var(--danger)] mt-0.5 shrink-0" />
            <p className="text-[12px] text-[var(--danger)]">
              This permanently deletes all attempts, analytics, revision items, achievements, XP and active sessions.
            </p>
          </div>
          <p className="text-[12px] text-muted">
            {data.attempts.length} attempts and {data.xp.toLocaleString()} XP will be lost. Export a backup first if you want to
            keep this history.
          </p>
        </div>
      </Modal>
    </div>
  )
}
