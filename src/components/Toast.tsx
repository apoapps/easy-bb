import { useEffect, useState } from 'react'
import { subscribeToToasts, type ToastMessage, type ToastTone } from './toastBus'

export function ToastHost() {
  const [items, setItems] = useState<ToastMessage[]>([])

  useEffect(() => {
    const listener = (msg: ToastMessage) => {
      setItems((prev) => [...prev, msg])
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== msg.id))
      }, 3200)
    }
    return subscribeToToasts(listener)
  }, [])

  const toneClass: Record<ToastTone, string> = {
    info: 'bg-primary text-white',
    good: 'bg-good text-white',
    warn: 'bg-warn text-ink',
    bad: 'bg-bad text-white',
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
      {items.map((it) => (
        <div
          key={it.id}
          className={[
            'pointer-events-auto border-2 border-ink px-4 py-3 font-display uppercase tracking-wide shadow-brutal-sm',
            'animate-fade-in',
            toneClass[it.tone],
          ].join(' ')}
        >
          {it.text}
        </div>
      ))}
    </div>
  )
}
