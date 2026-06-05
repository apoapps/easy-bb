import type { ReactNode } from 'react'
import { Card } from './Card'
import { Gauge } from './Gauge'
import { useCountUp } from './useCountUp'

export interface KpiCardProps {
  label: string
  value: number
  tone?: 'primary' | 'default' | 'warn' | 'bad'
  icon?: ReactNode
  gauge?: boolean
  pulse?: boolean
  suffix?: string
  onClick?: () => void
}

export function KpiCard({ label, value, tone = 'default', icon, gauge, pulse, suffix = '', onClick }: KpiCardProps) {
  const animated = useCountUp(value, 700)
  const isFloat = !gauge
  const display = isFloat ? animated.toFixed(value % 1 === 0 ? 0 : 1) : Math.round(animated).toString()

  const toneClasses: Record<NonNullable<KpiCardProps['tone']>, string> = {
    default: 'bg-surface text-ink',
    primary: 'bg-primary text-white',
    warn: 'bg-warn text-ink',
    bad: 'bg-bad text-white',
  }

  return (
    <Card
      tone="default"
      hover={!pulse}
      onClick={onClick}
      className={[
        'p-5',
        pulse ? 'animate-pulse-brutal' : '',
        onClick ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-display uppercase tracking-widest text-muted">{label}</div>
          <div className={`mt-2 font-display text-4xl leading-none ${tone === 'primary' ? 'text-white' : 'text-ink'}`}>
            {display}
            <span className="ml-1 text-base text-muted">{suffix}</span>
          </div>
        </div>
        {icon ? <div className="text-2xl">{icon}</div> : null}
        {gauge ? (
          <div className="shrink-0">
            <Gauge value={value} size={64} />
          </div>
        ) : null}
      </div>
      <div className={`mt-3 h-1 w-12 border-2 border-ink ${toneClasses[tone].split(' ')[0]}`} />
    </Card>
  )
}
