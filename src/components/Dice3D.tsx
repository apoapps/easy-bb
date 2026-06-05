import { useMemo, type ReactNode } from 'react'

export interface Dice3DProps {
  size?: number
  rotation?: { x: number; y: number; z: number }
  className?: string
}

function FaceIcon({ type }: { type: 'cap' | 'book' | 'chart' | 'star' | 'brain' | 'bolt' }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  const icons: Record<typeof type, ReactNode> = {
    cap: (
      <>
        <path {...common} d="m4 10 8-4 8 4-8 4-8-4Z" />
        <path {...common} d="M7 12v4c3 2 7 2 10 0v-4" />
        <path {...common} d="M20 10v5" />
      </>
    ),
    book: (
      <>
        <path {...common} d="M6 5h9a3 3 0 0 1 3 3v11H9a3 3 0 0 0-3 3V5Z" />
        <path {...common} d="M6 19a3 3 0 0 1 3-3h9" />
      </>
    ),
    chart: (
      <>
        <path {...common} d="M5 19h14" />
        <path {...common} d="M7 16v-5" />
        <path {...common} d="M12 16V7" />
        <path {...common} d="M17 16v-8" />
      </>
    ),
    star: <path {...common} d="m12 4 2.3 5 5.4.7-4 3.7 1 5.3L12 16l-4.7 2.7 1-5.3-4-3.7 5.4-.7L12 4Z" />,
    brain: (
      <>
        <path {...common} d="M9 6a3 3 0 0 0-3 3 3 3 0 0 0-1 5.7A3.5 3.5 0 0 0 9 20" />
        <path {...common} d="M15 6a3 3 0 0 1 3 3 3 3 0 0 1 1 5.7A3.5 3.5 0 0 1 15 20" />
        <path {...common} d="M9 6v14M15 6v14M9 11h6M9 15h6" />
      </>
    ),
    bolt: <path {...common} d="M13 3 5 14h6l-1 7 8-12h-6l1-6Z" />,
  }

  return (
    <svg viewBox="0 0 24 24" className="h-[42%] w-[42%] drop-shadow-none" aria-hidden="true">
      {icons[type]}
    </svg>
  )
}

export function Dice3D({ size = 96, rotation, className = '' }: Dice3DProps) {
  const faces = useMemo(
    () => [
      { icon: 'cap' as const, bg: '#5B5BD6', color: '#FFFFFF' },
      { icon: 'book' as const, bg: '#8A5270', color: '#FFFFFF' },
      { icon: 'chart' as const, bg: '#347B83', color: '#FFFFFF' },
      { icon: 'star' as const, bg: '#C2933A', color: '#0A0A0A' },
      { icon: 'brain' as const, bg: '#2F7D62', color: '#FFFFFF' },
      { icon: 'bolt' as const, bg: '#5D6472', color: '#FFFFFF' },
    ],
    [],
  )

  const half = size / 2
  const rot = rotation ?? { x: -20, y: 30, z: 0 }
  const faceClass = 'absolute flex items-center justify-center border-[3px] border-ink shadow-brutal-sm'

  return (
    <div
      className={['relative inline-block overflow-visible', className].join(' ')}
      style={{ width: size, height: size, perspective: 800 }}
    >
      <div
        className="relative h-full w-full overflow-visible"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`,
          transition: 'transform 600ms cubic-bezier(0.2, 0.9, 0.2, 1)',
        }}
      >
        {[
          `translateZ(${half}px)`,
          `rotateY(180deg) translateZ(${half}px)`,
          `rotateY(90deg) translateZ(${half}px)`,
          `rotateY(-90deg) translateZ(${half}px)`,
          `rotateX(90deg) translateZ(${half}px)`,
          `rotateX(-90deg) translateZ(${half}px)`,
        ].map((transform, index) => (
          <div
            key={faces[index].icon}
            className={faceClass}
            style={{
              width: size,
              height: size,
              background: faces[index].bg,
              color: faces[index].color,
              transform,
              backfaceVisibility: 'hidden',
            }}
          >
            <FaceIcon type={faces[index].icon} />
          </div>
        ))}
      </div>
    </div>
  )
}
