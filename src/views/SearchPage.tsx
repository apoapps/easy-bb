import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Dashboard, Actividad } from '../types';
import { Chip, type ChipTone } from '../components/Chip';
import { ListSkeleton } from '../components/Skeleton';
import { UiIcon } from '../components/UiIcon';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'GRADED', label: 'Graded' },
  { key: 'NEEDS_GRADING', label: 'Needs grading' },
  { key: 'zero', label: 'Zero score' },
  { key: 'overdue', label: 'Overdue' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

interface HighlightPart {
  key: string;
  text: string;
  highlighted: boolean;
}

function highlightParts(text: string, q: string): HighlightPart[] {
  if (!q) return [{ key: 'all', text, highlighted: false }];
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return [{ key: 'all', text, highlighted: false }];
  return [
    { key: 'before', text: text.slice(0, i), highlighted: false },
    { key: 'match', text: text.slice(i, i + q.length), highlighted: true },
    { key: 'after', text: text.slice(i + q.length), highlighted: false },
  ].filter(part => part.text.length > 0);
}

export function SearchPage() {
  const navigate = useNavigate();
  const [d, setD] = useState<Dashboard | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await api.dashboard();
      if (mounted) setD(r);
    })();
    return () => { mounted = false; };
  }, []);

  const all: Actividad[] = useMemo(() => {
    if (!d) return [];
    return d.materias.flatMap(m => m.actividades.map(a => ({ ...a, courseName: m.displayName, courseId: m.courseId })));
  }, [d]);

  const filtered = useMemo(() => {
    let r = all;
    if (q.trim()) r = r.filter(a => (a.columnName || '').toLowerCase().includes(q.toLowerCase()));
    if (filter === 'GRADED') r = r.filter(a => a.status === 'GRADED');
    else if (filter === 'NEEDS_GRADING') r = r.filter(a => a.status === 'NEEDS_GRADING');
    else if (filter === 'zero') r = r.filter(a => a.score === 0);
    else if (filter === 'overdue') {
      const now = new Date();
      r = r.filter(a => a.dueDate && new Date(a.dueDate) < now);
    }
    return r;
  }, [all, q, filter]);

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="relative max-w-3xl mx-auto w-full z-10">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
          <UiIcon name="search" className="h-6 w-6" />
        </span>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search assignments, courses, or grading status"
          className="w-full pl-14 pr-5 py-4 text-lg border-4 border-ink bg-surface shadow-brutal-lg outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] transition-transform"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center z-10 relative">
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={[
              'px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide border-2 border-ink transition-colors',
              filter === f.key ? 'bg-primary text-white shadow-brutal-sm' : 'bg-surface text-ink hover:bg-surface-alt',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="z-10 relative">
        {!d ? (
          <div className="max-w-3xl mx-auto">
            <ListSkeleton rows={8} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center border-2 border-ink text-primary">
              <UiIcon name={q ? 'search' : 'list'} />
            </div>
            {q ? `No results for "${q}"` : 'No activities to show'}
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-w-3xl mx-auto">
            {filtered.slice(0, 80).map((a, i) => {
              const pct = a.score != null ? (a.score / a.pointsPossible) * 100 : null;
              const tone: ChipTone =
                pct === 0 ? 'bad'
                : a.status === 'GRADED' ? 'good'
                : a.status === 'NEEDS_GRADING' ? 'warn'
                : 'info';
              const label = pct !== null ? `${pct.toFixed(0)}%` : a.status;

              const parts = highlightParts(a.columnName, q);

              return (
                <button
                  key={a.columnId + i}
                  type="button"
                  onClick={() => a.courseId && navigate(`/course/${a.courseId}`)}
                  style={{ animationDelay: `${i * 20}ms` }}
                  className="animate-fade-in group flex items-center gap-3 p-3 border-2 border-ink bg-surface text-left transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-sm"
                >
                  <div className="text-[10px] font-display uppercase tracking-widest text-muted min-w-[160px]">
                    {a.courseName}
                  </div>
                  <div className="flex-1 font-semibold">
                    {parts.map(part => part.highlighted ? (
                      <mark key={part.key} className="bg-primary text-white px-0.5">{part.text}</mark>
                    ) : (
                      <span key={part.key}>{part.text}</span>
                    ))}
                  </div>
                  <Chip tone={tone}>{label}</Chip>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
