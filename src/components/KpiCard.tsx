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
        'p-4 sm:p-5 min-h-[128px]',
        pulse ? 'animate-pulse-brutal' : '',
        onClick ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0 overflow-hidden">
          <div className="text-[11px] sm:text-xs font-display uppercase tracking-wider sm:tracking-widest text-muted break-words">{label}</div>
          <div className={`mt-2 flex min-w-0 items-baseline overflow-hidden font-display text-3xl sm:text-4xl leading-none ${tone === 'primary' ? 'text-white' : 'text-ink'}`}>
            <span className="min-w-0 truncate">{display}</span>
            {suffix ? <span className="ml-1 shrink-0 text-sm sm:text-base text-muted">{suffix}</span> : null}
          </div>
        </div>
        <div className="shrink-0">
          {icon ? <div className="text-2xl leading-none">{icon}</div> : null}
          {gauge ? (
            <div className="shrink-0">
              <Gauge value={value} size={56} />
            </div>
          ) : null}
        </div>
      </div>
      <div className={`mt-4 h-1 w-12 border-2 border-ink ${toneClasses[tone].split(' ')[0]}`} />
    </Card>
  )
}
