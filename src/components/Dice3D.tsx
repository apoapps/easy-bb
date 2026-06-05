import { useMemo } from 'react'

export interface Dice3DProps {
  size?: number
  // rotation in degrees, applied on each axis
  rotation?: { x: number; y: number; z: number }
  className?: string
}

export function Dice3D({ size = 96, rotation, className = '' }: Dice3DProps) {
  const faces = useMemo(
    () => [
      { label: '🎓', bg: '#7C3AED' },
      { label: '📚', bg: '#EC4899' },
      { label: '✏️', bg: '#06B6D4' },
      { label: '⭐', bg: '#F59E0B' },
      { label: '🧠', bg: '#10B981' },
      { label: '🚀', bg: '#EF4444' },
    ],
    [],
  )

  const half = size / 2
  const rot = rotation ?? { x: -20, y: 30, z: 0 }

  return (
    <div
      className={['relative inline-block', className].join(' ')}
      style={{ width: size, height: size, perspective: 600 }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`,
          transition: 'transform 600ms cubic-bezier(0.2, 0.9, 0.2, 1)',
        }}
      >
        {/* front */}
        <div
          className="absolute flex items-center justify-center border-2 border-ink text-3xl shadow-brutal-sm"
          style={{
            width: size,
            height: size,
            background: faces[0].bg,
            transform: `translateZ(${half}px)`,
            color: 'white',
          }}
        >
          {faces[0].label}
        </div>
        {/* back */}
        <div
          className="absolute flex items-center justify-center border-2 border-ink text-3xl shadow-brutal-sm"
          style={{
            width: size,
            height: size,
            background: faces[1].bg,
            transform: `rotateY(180deg) translateZ(${half}px)`,
            color: 'white',
          }}
        >
          {faces[1].label}
        </div>
        {/* right */}
        <div
          className="absolute flex items-center justify-center border-2 border-ink text-3xl shadow-brutal-sm"
          style={{
            width: size,
            height: size,
            background: faces[2].bg,
            transform: `rotateY(90deg) translateZ(${half}px)`,
            color: 'white',
          }}
        >
          {faces[2].label}
        </div>
        {/* left */}
        <div
          className="absolute flex items-center justify-center border-2 border-ink text-3xl shadow-brutal-sm"
          style={{
            width: size,
            height: size,
            background: faces[3].bg,
            transform: `rotateY(-90deg) translateZ(${half}px)`,
            color: 'white',
          }}
        >
          {faces[3].label}
        </div>
        {/* top */}
        <div
          className="absolute flex items-center justify-center border-2 border-ink text-3xl shadow-brutal-sm"
          style={{
            width: size,
            height: size,
            background: faces[4].bg,
            transform: `rotateX(90deg) translateZ(${half}px)`,
            color: 'white',
          }}
        >
          {faces[4].label}
        </div>
        {/* bottom */}
        <div
          className="absolute flex items-center justify-center border-2 border-ink text-3xl shadow-brutal-sm"
          style={{
            width: size,
            height: size,
            background: faces[5].bg,
            transform: `rotateX(-90deg) translateZ(${half}px)`,
            color: 'white',
          }}
        >
          {faces[5].label}
        </div>
      </div>
    </div>
  )
}
