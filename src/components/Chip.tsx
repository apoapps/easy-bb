import type { HTMLAttributes, ReactNode } from 'react'

export type ChipTone = 'default' | 'primary' | 'good' | 'warn' | 'bad' | 'info' | 'pink'

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  tone?: ChipTone
  outline?: boolean
}

const TONES: Record<ChipTone, { bg: string; text: string; border: string }> = {
  default: { bg: 'bg-bg', text: 'text-ink', border: 'border-ink' },
  primary: { bg: 'bg-primary', text: 'text-white', border: 'border-primary-dark' },
  good: { bg: 'bg-good', text: 'text-white', border: 'border-ink' },
  warn: { bg: 'bg-warn', text: 'text-ink', border: 'border-ink' },
  bad: { bg: 'bg-bad', text: 'text-white', border: 'border-ink' },
  info: { bg: 'bg-info', text: 'text-white', border: 'border-ink' },
  pink: { bg: 'bg-pink', text: 'text-white', border: 'border-ink' },
}

export function Chip({ children, tone = 'default', outline, className = '', ...rest }: ChipProps) {
  const t = TONES[tone]
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-display uppercase tracking-wide',
        'border-2',
        outline ? `bg-transparent ${t.text} ${t.border}` : `${t.bg} ${t.text} ${t.border}`,
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </span>
  )
}
