import type { ReactNode } from 'react'
import { ApoLogo, ApoappsCredit, GithubIcon } from './ApoLogo'

export type RouteKey = 'dashboard' | 'courses' | 'search' | 'calendar' | 'profile'

export interface TopBarUser {
  name: string
  email?: string
  avatar?: string
}

export interface TopBarProps {
  currentRoute: RouteKey
  onNavigate: (route: RouteKey) => void
  user: TopBarUser | null
  onLogout?: () => void
}

const TABS: Array<{ key: RouteKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'courses', label: 'Courses' },
  { key: 'search', label: 'Explore' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'profile', label: 'Profile' },
]

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function UserChip({ user }: { user: TopBarUser }): ReactNode {
  return (
    <div className="flex items-center gap-2 bg-ink-soft border-2 border-primary px-2 py-1">
      <div className="w-7 h-7 bg-primary text-white flex items-center justify-center text-xs font-bold border-2 border-ink">
        {initials(user.name) || '?'}
      </div>
      <span className="text-sm font-semibold hidden sm:inline">{user.name}</span>
    </div>
  )
}

export function TopBar({ currentRoute, onNavigate, user, onLogout }: TopBarProps) {
  return (
    <header
      className="
        sticky top-0 z-50
        flex items-center gap-4
        bg-ink text-white
        border-b-[5px] border-primary
        px-6 py-4
      "
    >
      <div className="flex shrink-0 items-center gap-2 select-none">
        <div className="grid h-10 w-10 place-items-center bg-surface text-primary border-2 border-primary shadow-brutal-sm">
          <ApoLogo className="h-7 w-7" />
        </div>
        <div className="leading-none">
          <div className="font-display text-lg tracking-tight">
            <span className="text-primary">easy</span>
            <span className="text-white">-bb</span>
          </div>
          <ApoappsCredit compact dark />
        </div>
      </div>

      <nav className="flex items-center gap-1 flex-1 overflow-x-auto" aria-label="Primary">
        {TABS.map((tab) => {
          const active = currentRoute === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onNavigate(tab.key)}
              className={
                'px-3 py-1.5 text-sm font-bold uppercase tracking-wide ' +
                'border-2 border-transparent ' +
                (active
                  ? 'bg-primary text-white border-primary'
                  : 'text-white/80 hover:text-white hover:border-white/40')
              }
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      {user ? <UserChip user={user} /> : null}

      <a
        href="https://github.com/apoapps/easy-bb"
        target="_blank"
        rel="noreferrer"
        className="grid h-9 w-9 shrink-0 place-items-center border-2 border-white/60 bg-white/10 text-white transition-colors hover:bg-white hover:text-ink"
        aria-label="Open GitHub repository"
      >
        <GithubIcon className="h-5 w-5" />
      </a>

      {onLogout ? (
        <button
          type="button"
          onClick={onLogout}
          className="
            bg-bad text-white
            border-[3px] border-white
            px-3 py-1.5
            text-xs font-bold uppercase tracking-wide
            shadow-brutal-sm
            transition-transform transition-shadow duration-75
            hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
            active:translate-x-[4px] active:translate-y-[4px]
          "
        >
          Sign out
        </button>
      ) : null}
    </header>
  )
}
