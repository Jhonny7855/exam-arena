import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:brightness-110 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_4px_14px_var(--accent-glow)]',
  secondary: 'bg-[var(--secondary)] text-white hover:brightness-110',
  ghost: 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
  outline: 'border border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--text-faint)]',
  danger: 'bg-[var(--danger)] text-white hover:brightness-110',
  success: 'bg-[var(--success)] text-[#04120c] hover:brightness-110 font-semibold',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-[10px]',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-xl',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'outline', size = 'md', icon, iconRight, fullWidth, className = '', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-[0.5px] ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
})

export function IconButton({
  label,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center h-9 w-9 rounded-[10px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({
  children,
  className = '',
  hover = false,
  ...props
}: { children: ReactNode; className?: string; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`surface-card ${hover ? 'transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'secondary' | 'success' | 'warning' | 'danger'
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)] border-transparent',
    secondary: 'bg-[var(--secondary-soft)] text-[var(--secondary)] border-transparent',
    success: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide border whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function ProgressBar({
  value,
  max = 100,
  tone = 'var(--accent)',
  height = 6,
  className = '',
  animated = true,
}: {
  value: number
  max?: number
  tone?: string
  height?: number
  className?: string
  animated?: boolean
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))
  return (
    <div
      className={`w-full rounded-full bg-[var(--surface-3)] overflow-hidden ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: tone }}
        initial={animated ? { width: 0 } : false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

export function Stat({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  tone?: string
}) {
  return (
    <Card className="p-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-faint">{label}</span>
        {icon && <span style={{ color: tone ?? 'var(--text-faint)' }}>{icon}</span>}
      </div>
      <div className="text-2xl font-semibold tracking-tight mono">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </Card>
  )
}

export function SectionHeader({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <div className="mt-0.5 text-[var(--accent)]">{icon}</div>}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          {description && <p className="text-[13px] text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="h-12 w-12 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-faint)] mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-[13px] text-muted max-w-sm mb-4">{description}</p>
      {action}
    </div>
  )
}

export function Skeleton({ className = '', height = 16 }: { className?: string; height?: number }) {
  return <div className={`shimmer rounded-md ${className}`} style={{ height }} />
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: { value: T; label: string; count?: number }[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
}) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto no-scrollbar max-w-full">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`relative px-3 ${size === 'sm' ? 'h-7 text-[12px]' : 'h-8 text-[13px]'} rounded-md font-medium whitespace-nowrap transition-colors ${
              active
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {o.label}
            {typeof o.count === 'number' && (
              <span className={`ml-1.5 text-[11px] mono ${active ? 'text-[var(--accent)]' : 'text-faint'}`}>{o.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className={`relative w-full ${widths[size]} surface-card shadow-[var(--shadow-lg)] overflow-hidden`}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[var(--text-faint)] hover:text-[var(--text)] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-[var(--border)] flex justify-end gap-2">{footer}</div>}
      </motion.div>
    </div>
  )
}
