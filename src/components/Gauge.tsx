export interface GaugeProps {
  value: number // 0..100
  size?: number
  stroke?: number
}

export function Gauge({ value, size = 72, stroke = 8 }: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c
  const color = clamped >= 80 ? '#10B981' : clamped >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0A0A0A"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.2,0.9,0.2,1)' }}
        />
      </svg>
      <span className="absolute font-display text-sm text-ink">{Math.round(clamped)}</span>
    </div>
  )
}
