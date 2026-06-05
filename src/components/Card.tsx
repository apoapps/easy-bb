import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  tone?: 'default' | 'alt' | 'primary'
  hover?: boolean
}

const TONES: Record<NonNullable<CardProps['tone']>, string> = {
  default: 'bg-surface text-ink',
  alt: 'bg-surface-alt text-ink',
  primary: 'bg-primary text-white',
}

export function Card({ children, tone = 'default', hover, className = '', ...rest }: CardProps) {
  return (
    <div
      className={[
        'relative border-2 border-ink shadow-brutal',
        TONES[tone],
        hover ? 'transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}
