import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0)
  const start = useRef<number | null>(null)
  const fromRef = useRef(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    fromRef.current = value
    start.current = null
    if (raf.current !== null) cancelAnimationFrame(raf.current)

    const step = (ts: number) => {
      if (start.current === null) start.current = ts
      const elapsed = ts - start.current
      const t = Math.min(1, elapsed / durationMs)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      const next = fromRef.current + (target - fromRef.current) * eased
      setValue(next)
      if (t < 1) {
        raf.current = requestAnimationFrame(step)
      } else {
        setValue(target)
      }
    }

    raf.current = requestAnimationFrame(step)
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}
