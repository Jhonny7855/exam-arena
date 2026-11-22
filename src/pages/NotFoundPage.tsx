import { Link, useNavigate } from 'react-router-dom'
import { Compass, Home, Swords, Layers, Search } from 'lucide-react'
import { Button, Card } from '../components/common/ui'

const LINKS = [
  { to: '/', label: 'Dashboard', icon: Home, desc: 'Overview, stats and quick actions' },
  { to: '/arena', label: 'Test Arena', icon: Swords, desc: '100 structured tests in 5 stages' },
  { to: '/practice', label: 'Unit Practice', icon: Layers, desc: 'Drill any of the 7 units' },
  { to: '/analytics', label: 'Analytics', icon: Search, desc: 'Accuracy by unit, topic and difficulty' },
]

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="relative">
          <div className="h-12 w-12 rounded-xl bg-[var(--accent-soft)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <Compass size={22} className="text-[var(--accent)]" />
          </div>
          <div className="text-[11px] font-semibold tracking-[0.18em] text-faint uppercase mb-1">Error 404</div>
          <h2 className="text-lg font-semibold tracking-tight mb-1">This state is unreachable</h2>
          <p className="text-[13px] text-muted max-w-sm mx-auto mb-5">
            The page you requested is not in the transition graph. Pick a reachable route below.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <Button variant="primary" icon={<Home size={14} />} onClick={() => navigate('/')}>
              Back to dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-start gap-2.5 rounded-lg border border-[var(--border)] p-2.5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] transition-colors group"
                >
                  <Icon size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium group-hover:text-[var(--accent)] transition-colors">{link.label}</div>
                    <div className="text-[11px] text-muted">{link.desc}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
