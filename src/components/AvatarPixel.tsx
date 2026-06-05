function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function colorFromSeed(seed: string): { bg: string; fg: string } {
  const h = hashString(seed);
  const palette = [
    { bg: '#7C3AED', fg: '#FFFFFF' },
    { bg: '#EC4899', fg: '#FFFFFF' },
    { bg: '#06B6D4', fg: '#FFFFFF' },
    { bg: '#F59E0B', fg: '#0A0A0A' },
    { bg: '#10B981', fg: '#FFFFFF' },
    { bg: '#EF4444', fg: '#FFFFFF' },
  ];
  return palette[h % palette.length];
}

export interface AvatarPixelProps {
  seed: string;
  size?: number;
  name?: string;
  showRing?: boolean;
}

export function AvatarPixel({ seed, size = 120, name, showRing = true }: AvatarPixelProps) {
  const { bg, fg } = colorFromSeed(seed);
  const initials = (name ?? seed)
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={[
        'inline-flex items-center justify-center font-display uppercase tracking-wide',
        showRing ? 'border-2 border-ink shadow-brutal' : '',
      ].join(' ')}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.36,
      }}
    >
      {initials || '?'}
    </div>
  );
}
