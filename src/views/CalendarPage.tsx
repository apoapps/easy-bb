import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Dashboard, Actividad } from '../types';
import { Chip } from '../components/Chip';

export function CalendarPage() {
  const navigate = useNavigate();
  const [d, setD] = useState<Dashboard | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await api.dashboard();
      if (mounted) setD(r);
    })();
    return () => { mounted = false; };
  }, []);

  const all = useMemo<Actividad[]>(() => {
    if (!d) return [];
    return d.materias.flatMap(m => m.actividades.filter(a => a.dueDate).map(a => ({ ...a, courseName: m.displayName, courseId: m.courseId })));
  }, [d]);

  const days = useMemo(() => {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7; // 0=Mon
    const monday = new Date(now);
    monday.setDate(now.getDate() - dow + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const result: Array<{ date: Date; items: Actividad[] }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().slice(0, 10);
      const items = all.filter(a => (a.dueDate || '').slice(0, 10) === dStr);
      result.push({ date: d, items });
    }
    return { days: result, monday, sunday };
  }, [all, weekOffset]);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-3xl tracking-tight">Calendario</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setWeekOffset(o => o - 1); setAnimKey(k => k + 1); }}
            className="px-3 py-2 text-sm bg-surface border-2 border-ink shadow-brutal-sm font-bold uppercase transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            ← Anterior
          </button>
          <div className="font-display text-lg px-4 py-2 bg-primary text-white border-2 border-ink shadow-brutal">
            {days.monday.getDate()}/{days.monday.getMonth() + 1} — {days.sunday.getDate()}/{days.sunday.getMonth() + 1}
          </div>
          <button
            type="button"
            onClick={() => { setWeekOffset(o => o + 1); setAnimKey(k => k + 1); }}
            className="px-3 py-2 text-sm bg-surface border-2 border-ink shadow-brutal-sm font-bold uppercase transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <div key={animKey} className="relative pl-12 animate-fade-in">
        <div className="absolute left-4 top-0 bottom-0 w-1.5 bg-ink" />
        {days.days.map((day, i) => {
          const isToday = day.date.getTime() === today.getTime();
          const isPast = day.date < today;
          const dayName = day.date.toLocaleDateString('es-MX', { weekday: 'long' });
          return (
            <div key={i} className={`relative mb-6 ${day.items.length === 0 ? 'opacity-50' : ''}`}>
              <div className={`absolute -left-12 top-0 w-8 h-8 grid place-items-center font-display text-xs border-2 border-ink ${day.items.some(a => isPast && a.score == null) ? 'bg-bad text-white animate-pulse-brutal' : 'bg-primary text-white'}`}>
                {day.date.getDate()}
              </div>
              <div className="font-display text-lg mb-2 flex items-center gap-2 capitalize">
                {dayName}
                {isToday && <Chip tone="primary">Hoy</Chip>}
              </div>
              {day.items.length === 0 ? (
                <div className="text-muted text-sm pl-1">— sin entregas —</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {day.items.map((a, idx) => {
                    const overdue = isPast && a.score == null;
                    return (
                      <button
                        key={a.columnId + idx}
                        type="button"
                        onClick={() => a.courseId && navigate(`/course/${a.courseId}`)}
                        style={{ animationDelay: `${idx * 60}ms` }}
                        className={[
                          'group flex items-center gap-3 p-3 border-2 border-ink bg-surface text-left',
                          'hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-sm',
                          'transition-all duration-100 animate-fade-in',
                          overdue ? 'bg-red-50' : '',
                        ].join(' ')}
                      >
                        <span className="text-xl">{overdue ? '🚨' : '📌'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{a.columnName}</div>
                          <div className="text-xs text-muted font-mono truncate">{a.courseName}</div>
                        </div>
                        <div className="font-mono font-bold text-right min-w-[60px]">
                          {a.score != null ? `${a.score.toFixed(0)}/${a.pointsPossible}` : '—'}
                        </div>
                        {overdue && <Chip tone="bad">Vencida</Chip>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
