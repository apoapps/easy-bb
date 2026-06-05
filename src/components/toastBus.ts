export type ToastTone = 'info' | 'good' | 'warn' | 'bad'

export interface ToastMessage {
  id: number
  text: string
  tone: ToastTone
}

let counter = 0
const listeners = new Set<(msg: ToastMessage) => void>()

export function pushToast(text: string, tone: ToastTone = 'info'): void {
  counter += 1
  const msg: ToastMessage = { id: counter, text, tone }
  listeners.forEach((listener) => listener(msg))
}

export function subscribeToToasts(listener: (msg: ToastMessage) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
