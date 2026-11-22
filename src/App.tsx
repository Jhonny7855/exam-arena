import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { useArena } from './store/arena'
import { Skeleton } from './components/common/ui'
import { PageTransition } from './components/common/motion'
import { useSubjectMeta } from './hooks/useSubject'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TestArenaPage = lazy(() => import('./pages/TestArenaPage'))
const ExamPage = lazy(() => import('./pages/ExamPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const UnitPracticePage = lazy(() => import('./pages/UnitPracticePage'))
const RandomExamPage = lazy(() => import('./pages/RandomExamPage'))
const WeakTopicsPage = lazy(() => import('./pages/WeakTopicsPage'))
const RevisionPage = lazy(() => import('./pages/RevisionPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const UnitDetailPage = lazy(() => import('./pages/UnitDetailPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton height={28} className="w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton height={92} />
        <Skeleton height={92} />
        <Skeleton height={92} />
      </div>
      <Skeleton height={280} />
    </div>
  )
}

export default function App() {
  const hydrate = useArena((s) => s.hydrate)
  const hydrated = useArena((s) => s.hydrated)
  const settings = useArena((s) => s.data.settings)
  const meta = useSubjectMeta()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.dataset.motion = settings.animations ? 'full' : 'reduced'
  }, [settings.theme, settings.animations])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.subject = meta.id
    root.style.setProperty('--accent', meta.accent)
    root.style.setProperty('--accent-soft', `color-mix(in srgb, ${meta.accent} 13%, transparent)`)
    root.style.setProperty('--accent-glow', `color-mix(in srgb, ${meta.accent} 38%, transparent)`)
    root.style.setProperty('--secondary', meta.accentSecondary)
    root.style.setProperty('--secondary-soft', `color-mix(in srgb, ${meta.accentSecondary} 13%, transparent)`)
  }, [meta])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const isExam = location.pathname.startsWith('/exam/')

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-xs text-muted">Loading arena…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {!isExam && (
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      )}
      <div className={`transition-[padding] duration-200 ${isExam ? '' : collapsed ? 'lg:pl-[68px]' : 'lg:pl-[248px]'}`}>
        {!isExam && <Header onOpenMobile={() => setMobileOpen(true)} />}
        <main className={isExam ? '' : 'px-4 lg:px-6 py-5 lg:py-6 max-w-[1500px] mx-auto'}>
          <Suspense fallback={<PageFallback />}>
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/arena" element={<TestArenaPage />} />
                <Route path="/exam/:testId" element={<ExamPage />} />
                <Route path="/results/:attemptId" element={<ResultsPage />} />
                <Route path="/practice" element={<UnitPracticePage />} />
                <Route path="/practice/:unitId" element={<UnitDetailPage />} />
                <Route path="/random" element={<RandomExamPage />} />
                <Route path="/weak" element={<WeakTopicsPage />} />
                <Route path="/revision" element={<RevisionPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
