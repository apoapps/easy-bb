export type UiIconName = 'book' | 'clock' | 'alert' | 'check' | 'list' | 'search' | 'calendar' | 'pin' | 'grid' | 'logout';

export function UiIcon({ name, className = 'h-5 w-5' }: { name: UiIconName; className?: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {name === 'book' && <><path {...common} d="M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 0-3 3V4Z" /><path {...common} d="M5 19a3 3 0 0 1 3-3h11" /></>}
      {name === 'clock' && <><circle {...common} cx="12" cy="12" r="8" /><path {...common} d="M12 8v5l3 2" /></>}
      {name === 'alert' && <><path {...common} d="M12 4 3 20h18L12 4Z" /><path {...common} d="M12 9v5M12 17h.01" /></>}
      {name === 'check' && <><circle {...common} cx="12" cy="12" r="8" /><path {...common} d="m8.5 12.5 2.2 2.2 4.8-5" /></>}
      {name === 'list' && <><path {...common} d="M8 6h12M8 12h12M8 18h12" /><path {...common} d="M4 6h.01M4 12h.01M4 18h.01" /></>}
      {name === 'search' && <><circle {...common} cx="11" cy="11" r="6" /><path {...common} d="m16 16 4 4" /></>}
      {name === 'calendar' && <><path {...common} d="M6 4v3M18 4v3M4 9h16M5 6h14a1 1 0 0 1 1 1v13H4V7a1 1 0 0 1 1-1Z" /></>}
      {name === 'pin' && <><path {...common} d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" /><circle {...common} cx="12" cy="10" r="2.5" /></>}
      {name === 'grid' && <><path {...common} d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></>}
      {name === 'logout' && <><path {...common} d="M10 6H5v12h5M14 8l4 4-4 4M8 12h10" /></>}
    </svg>
  );
}
