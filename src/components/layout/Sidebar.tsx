import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Swords,
  Layers,
  Shuffle,
  Target,
  Repeat,
  BarChart3,
  Trophy,
  NotebookText,
  Settings as SettingsIcon,
  Info,
  ChevronLeft,
  Menu,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from './Logo'
import { SubjectSwitcher } from './SubjectSwitcher'
import { useSubjectMeta } from '../../hooks/useSubject'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Training',
    items: [
      { to: '/arena', label: 'Test Arena', icon: Swords },
      { to: '/practice', label: 'Unit Practice', icon: Layers },
      { to: '/random', label: 'Random Exam', icon: Shuffle },
      { to: '/weak', label: 'Weak Topics', icon: Target },
      { to: '/cheatsheet', label: 'Cheatsheet', icon: NotebookText },
      { to: '/revision', label: 'Revision Center', icon: Repeat },
    ],
  },
  {
    title: 'Performance',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/achievements', label: 'Achievements', icon: Trophy },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: SettingsIcon },
      { to: '/about', label: 'About', icon: Info },
    ],
  },
]

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  const meta = useSubjectMeta()
  const showLabels = !collapsed || isMobile

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    onCloseMobile()
  }, [location.pathname])

  const content = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center h-16 border-b border-[var(--border)] ${collapsed && !isMobile ? 'justify-center px-2' : 'px-4 justify-between'}`}>
        <Logo collapsed={collapsed && !isMobile} />
        {!isMobile && !collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="text-[var(--text-faint)] hover:text-[var(--text)] transition-colors h-7 w-7 rounded-md hover:bg-[var(--surface-2)] flex items-center justify-center"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {isMobile && (
          <button onClick={onCloseMobile} aria-label="Close navigation" className="text-[var(--text-muted)]">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5" aria-label="Main navigation">
        {showLabels && (
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
              Subject
            </div>
            <SubjectSwitcher />
          </div>
        )}

        {SECTIONS.map((section) => (
          <div key={section.title}>
            {(!collapsed || isMobile) && (
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed && !isMobile ? item.label : undefined}
                    className={`group flex items-center gap-2.5 h-9 rounded-lg transition-colors relative ${
                      collapsed && !isMobile ? 'justify-center px-0' : 'px-3'
                    } ${
                      active
                        ? 'bg-[var(--accent-soft)] text-[var(--text)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[var(--accent)]"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={active ? 'text-[var(--accent)]' : ''} />
                    {(!collapsed || isMobile) && <span className="text-[13.5px] font-medium truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t border-[var(--border)] p-3 ${collapsed && !isMobile ? 'text-center' : ''}`}>
        {collapsed && !isMobile ? (
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="h-9 w-full rounded-lg hover:bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-faint)]"
          >
            <Menu size={17} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${meta.accent} 16%, transparent)` }}
            >
              <Zap size={14} style={{ color: meta.accent }} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium leading-tight truncate">{meta.courseCode} · {meta.code}</div>
              <div className="text-[10px] text-faint leading-tight truncate">{meta.semester}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-[var(--bg-elevated)] border-r border-[var(--border)] transition-[width] duration-200 ${
          collapsed ? 'w-[68px]' : 'w-[248px]'
        }`}
      >
        {content}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-[268px] z-50 bg-[var(--bg-elevated)] border-r border-[var(--border)] lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
