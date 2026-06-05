import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Dashboard, Materia, Actividad } from '../types';
import { useCountUp } from '../components/useCountUp';
import { BarRow } from '../components/BarRow';
import { Modal } from '../components/Modal';

const COURSE_COLORS = [
  { bg: '#7C3AED', ink: '#FFFFFF' },
  { bg: '#06B6D4', ink: '#0A0A0A' },
  { bg: '#F59E0B', ink: '#0A0A0A' },
  { bg: '#EF4444', ink: '#FFFFFF' },
  { bg: '#10B981', ink: '#0A0A0A' },
  { bg: '#EC4899', ink: '#FFFFFF' },
  { bg: '#1F1F1F', ink: '#FFFFFF' },
];

function colorForCourse(name: string): { bg: string; ink: string } {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return COURSE_COLORS[Math.abs(h) % COURSE_COLORS.length];
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [d, setD] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Actividad | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await api.dashboard();
        if (mounted) setD(r);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const materia: Materia | null = useMemo(
    () => d?.materias.find(m => m.courseId === id) || null,
    [d, id]
  );

  const acts = useMemo(() => {
    if (!materia) return [];
    return [...materia.actividades].sort((a, b) => {
      const aZero = a.score === 0;
      const bZero = b.score === 0;
      if (aZero !== bZero) return aZero ? -1 : 1;
      return new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime();
    });
  }, [materia]);

  const animatedProm = useCountUp(materia?.promedio || 0, 1500);

  if (loading || !d) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton h-32 border-2 border-ink" />
        <div className="skeleton h-16 border-2 border-ink" />
        <div className="skeleton h-16 border-2 border-ink" />
      </div>
    );
  }

  if (!materia) {
    return (
      <div className="text-center py-12 text-muted">
        <div className="text-4xl mb-2">🔍</div>
        Materia no encontrada
        <button onClick={() => navigate('/courses')} className="block mx-auto mt-4 px-4 py-2 bg-primary text-white border-2 border-ink shadow-brutal-sm font-display uppercase">
          ← Volver a Materias
        </button>
      </div>
    );
  }

  const c = colorForCourse(materia.displayName);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate('/courses')}
        className="self-start px-3 py-1.5 text-sm bg-surface text-ink border-2 border-ink shadow-brutal-sm font-bold uppercase transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        ← Materias
      </button>

      <div
        className="p-6 border-2 border-ink shadow-brutal text-white"
        style={{ background: `linear-gradient(135deg, ${c.bg} 0%, #0A0A0A 180%)` }}
      >
        <div className="text-[10px] font-display uppercase tracking-widest opacity-80 mb-1">
          {materia.term?.name || ''} · {materia.ultraStatus}
        </div>
        <h2 className="font-display text-3xl leading-tight uppercase tracking-tight">
          {materia.displayName}
        </h2>
        <div className="flex items-baseline gap-4 mt-3">
          <div className="font-mono text-6xl font-bold">{animatedProm.toFixed(1)}%</div>
          <div className="opacity-90 font-mono text-sm">
            {materia.totalEarned} / {materia.totalPossible} puntos
          </div>
        </div>
        <div className="text-xs opacity-80 mt-2">{acts.length} actividades</div>
      </div>

      <div className="p-6 bg-surface border-2 border-ink shadow-brutal">
        <h3 className="font-display text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span> Actividades
        </h3>
        <div className="flex flex-col gap-3">
          {acts.map((a, i) => (
            <BarRow
              key={a.columnId}
              actividad={a}
              index={i}
              onClick={() => setSelected(a)}
            />
          ))}
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.columnName || ''}>
        {selected && (
          <div className="flex flex-col gap-2 text-sm">
            <div className="font-mono text-xs text-muted mb-2">{materia.displayName}</div>
            <Row label="Calificación" value={selected.score != null ? `${selected.score.toFixed(2)} / ${selected.pointsPossible}` : '—'} mono />
            <Row label="Porcentaje" value={selected.pct != null ? `${selected.pct.toFixed(1)}%` : '—'} mono />
            <Row label="Status" value={selected.status} />
            <Row label="Vence" value={formatDate(selected.dueDate)} mono />
            {selected.isOverride && selected.lastOverrideDate && (
              <Row label="Override" value={new Date(selected.lastOverrideDate).toLocaleString('es-MX')} mono />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-ink/20">
      <span className="text-muted">{label}</span>
      <span className={mono ? 'font-mono font-bold' : 'font-bold'}>{value}</span>
    </div>
  );
}
