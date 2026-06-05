import { useEffect, useState } from 'react';
import { Chip } from './Chip';
import type { Actividad } from '../types';

export interface BarRowProps {
  actividad: Actividad;
  index?: number;
  onClick?: () => void;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const due = new Date(iso);
  const now = new Date();
  return Math.round((due.getTime() - now.getTime()) / 86400000);
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

const STATUS_CHIP: Record<Actividad['status'], { tone: 'good' | 'warn' | 'bad' | 'info' | 'primary'; label: string }> = {
  GRADED: { tone: 'good', label: 'Calificada' },
  NEEDS_GRADING: { tone: 'warn', label: 'Por calificar' },
  IN_PROGRESS: { tone: 'info', label: 'En curso' },
  NOT_ATTEMPTED: { tone: 'primary', label: 'No intentada' },
  OVERDUE: { tone: 'bad', label: 'Vencida' },
};

export function BarRow({ actividad, index = 0, onClick }: BarRowProps) {
  const { score, columnName, pointsPossible, status, dueDate, isOverride } = actividad;
  const isZero = score === 0 && status === 'GRADED';
  const days = daysUntil(dueDate);
  const isOverdue = days != null && days < 0 && score == null;
  const barPct = score != null ? Math.max(2, (score / pointsPossible) * 100) : 0;
  const barColor = isZero
    ? 'bg-bad'
    : score == null
      ? 'bg-primary-dim'
      : score >= 80
        ? 'bg-good'
        : score >= 60
          ? 'bg-warn'
          : 'bg-bad';

  const [shown, setShown] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 50 + index * 80);
    return () => clearTimeout(t);
  }, [index]);
  useEffect(() => {
    if (shown) {
      const t = setTimeout(() => setBarWidth(barPct), 100);
      return () => clearTimeout(t);
    }
  }, [shown, barPct]);

  const sc = STATUS_CHIP[status];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'opacity .4s cubic-bezier(.4,1.4,.6,1), transform .4s cubic-bezier(.4,1.4,.6,1)',
      }}
      className={[
        'group block w-full text-left',
        'grid grid-cols-[1fr_80px] gap-3 items-center p-3',
        'border-2 border-ink shadow-brutal-sm',
        isOverdue ? 'bg-red-50' : isZero ? 'bg-red-50 animate-shake' : 'bg-surface',
        'hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal',
        'transition-all duration-150',
      ].join(' ')}
    >
      <div className="min-w-0">
        <div className="font-display text-sm truncate">{columnName}</div>
        <div className="mt-0.5 text-xs text-muted">
          {formatDate(dueDate)}
          {days != null && days >= 0 && days <= 7 && score == null && (
            <span className="ml-2 text-bad font-bold">en {days}d</span>
          )}
          {isOverride && <span className="ml-2 text-info">✏️ override</span>}
          {pointsPossible ? ` · ${pointsPossible} pts` : ''}
        </div>
      </div>
      <div className="font-mono font-bold text-right text-lg">
        {score != null ? score.toFixed(0) : actividad.text || '—'}
      </div>
      <div className="col-span-2 mt-1">
        <div className="h-2 border-2 border-ink bg-surface-alt">
          <div
            className={`h-full ${barColor} transition-all duration-700`}
            style={{ width: barWidth + '%' }}
          />
        </div>
      </div>
      <div className="col-span-2 mt-1 flex items-center gap-2">
        <Chip tone={sc.tone}>{sc.label}</Chip>
        {status === 'NEEDS_GRADING' && score != null && (
          <Chip tone="info">Score: {score.toFixed(0)}</Chip>
        )}
      </div>
    </button>
  );
}
