export function ApoLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M10 41c7-18 15-28 23-29 8-1 15 8 21 29"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 37c8 4 20 5 32 1M24 30c5-2 11-2 17 0"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 15c-5 11-10 24-15 37M37 15c4 12 8 24 12 37"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".45"
      />
      <path
        d="M8 46c11 5 30 6 48-1"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".75"
      />
    </svg>
  );
}

export function ApoappsCredit({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <a
      href="https://apoapps.com"
      target="_blank"
      rel="noreferrer"
      className={[
        'inline-flex items-center gap-1.5 font-mono font-bold underline-offset-4 hover:underline',
        compact ? 'text-[10px]' : 'text-xs',
        dark ? 'text-white/75 hover:text-white' : 'text-muted hover:text-ink',
      ].join(' ')}
    >
      <span>Built by</span>
      <span className={dark ? 'text-accent' : 'text-primary'}>apoapps</span>
    </a>
  );
}

export function GithubIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.64-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.04A9.3 9.3 0 0 1 12 7c.85 0 1.7.12 2.5.34 1.9-1.32 2.74-1.04 2.74-1.04.55 1.4.2 2.44.1 2.7.64.71 1.03 1.62 1.03 2.74 0 3.93-2.35 4.8-4.58 5.05.36.32.68.95.68 1.92 0 1.38-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.13 10.13 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" clipRule="evenodd" />
    </svg>
  );
}
