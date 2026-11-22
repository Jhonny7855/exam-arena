import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { useArena } from '../../store/arena'

const EASE = [0.16, 1, 0.3, 1] as const

export function useMotionOK(): boolean {
  const enabled = useArena((s) => s.data.settings.animations)
  const prefersReduced = useReducedMotion()
  return enabled && !prefersReduced
}

export function Reveal({
  children,
  delay = 0,
  y = 10,
  className = '',
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  once?: boolean
}) {
  const ok = useMotionOK()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-40px 0px -40px 0px' })

  if (!ok) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.42, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({
  children,
  className = '',
  delay = 0,
  gap = 0.05,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  gap?: number
  once?: boolean
}) {
  const ok = useMotionOK()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-30px 0px' })

  const variants: Variants = useMemo(
    () => ({
      hidden: {},
      show: { transition: { staggerChildren: gap, delayChildren: delay } },
    }),
    [gap, delay],
  )

  if (!ok) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
  y = 12,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  const ok = useMotionOK()
  if (!ok) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function HoverLift({
  children,
  className = '',
  lift = 3,
}: {
  children: ReactNode
  className?: string
  lift?: number
}) {
  const ok = useMotionOK()
  if (!ok) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {children}
    </motion.div>
  )
}

export function useCountUp(target: number, duration = 900, decimals = 0): string {
  const ok = useMotionOK()
  const [value, setValue] = useState(ok ? 0 : target)

  useEffect(() => {
    if (!ok) {
      setValue(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, ok])

  return value.toFixed(decimals)
}

export function AnimatedNumber({
  value,
  duration = 900,
  decimals = 0,
  suffix = '',
  className = '',
}: {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  className?: string
}) {
  const shown = useCountUp(value, duration, decimals)
  return (
    <span className={className}>
      {Number(shown).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

export function PageTransition({ children }: { children: ReactNode }) {
  const ok = useMotionOK()
  return (
    <motion.div
      initial={ok ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export function AuroraBackground({ className = '' }: { className?: string }) {
  const ok = useMotionOK()
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className={`aurora aurora-a ${ok ? '' : 'aurora-static'}`} />
      <div className={`aurora aurora-b ${ok ? '' : 'aurora-static'}`} />
      <div className={`aurora aurora-c ${ok ? '' : 'aurora-static'}`} />
    </div>
  )
}

export function PulseRing({ className = '' }: { className?: string }) {
  const ok = useMotionOK()
  if (!ok) return null
  return <span aria-hidden="true" className={`pulse-ring ${className}`} />
}
