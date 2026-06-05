import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Dashboard } from '../types';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { KpiCard } from '../components/KpiCard';

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
  const d = new Date(iso);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / 86400000;
  const base = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  if (diff < -1) return `${base} (hace ${Math.abs(Math.round(diff))}d)`;
  if (diff < 0) return `${base} (vencida)`;
  if (diff < 1) return 'hoy';
  if (diff < 7) return `en ${Math.round(diff)}d`;
  return base;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [d, setD] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !d) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-32 border-2 border-ink" />
        ))}
      </div>
    );
  }

  const k = d.kpis;
  const lastMateria = [...d.materias].sort((a, b) =>
    new Date(b.lastAccess || 0).getTime() - new Date(a.lastAccess || 0).getTime()
  )[0];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Promedio general" value={k.promedioGeneral || 0} suffix="%" gauge tone="primary" />
        <KpiCard label="Materias activas" value={k.materiasActivas} icon="📚" />
        <KpiCard label="Por calificar" value={k.pendientesCalificar} icon="⏳" tone="warn" />
        <KpiCard
          label="Urgentes"
          value={k.urgentes}
          icon="⚠️"
          tone="bad"
          pulse={(k.urgentes || 0) > 0}
        />
      </div>

      {/* Day banner */}
      {lastMateria && (() => {
        const c = colorForCourse(lastMateria.displayName);
        return (
          <button
            type="button"
            onClick={() => navigate(`/course/${lastMateria.courseId}`)}
            className="w-full text-left flex items-center gap-6 p-6 border-2 border-ink shadow-brutal text-white transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg"
            style={{ background: `linear-gradient(135deg, ${c.bg} 0%, #0A0A0A 200%)` }}
          >
            <div className="text-5xl">🎓</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-display uppercase tracking-widest opacity-80">▶ Curso del día</div>
              <div className="font-display text-2xl leading-tight mt-1">{lastMateria.displayName}</div>
            </div>
            <div className="font-mono text-4xl font-bold bg-white text-ink px-3 py-1 border-2 border-ink shadow-brutal-sm">
              {(lastMateria.promedio || 0).toFixed(1)}%
            </div>
          </button>
        );
      })()}

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span> Urgentes
          </h3>
          {d.urgentes.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <div className="text-4xl mb-2">✅</div>
              Sin urgentes por ahora
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {d.urgentes.slice(0, 8).map((u, i) => (
                <ListRow
                  key={u.columnId + i}
                  icon="🚨"
                  name={u.columnName}
                  meta={`${u.courseName || ''} · vence ${formatDate(u.dueDate)}`}
                  chip={<Chip tone="bad">Vencida</Chip>}
                  onClick={() => u.courseId && navigate(`/course/${u.courseId}`)}
                  delay={i * 60}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span> Pendientes
          </h3>
          {d.pendientes.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <div className="text-4xl mb-2">🎉</div>
              ¡Todo al día!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {d.pendientes.slice(0, 8).map((p, i) => (
                <ListRow
                  key={p.columnId + i}
                  icon={p.status === 'NEEDS_GRADING' ? '⏳' : '📝'}
                  name={p.columnName}
                  meta={p.courseName || ''}
                  chip={
                    <Chip tone={p.status === 'NEEDS_GRADING' ? 'warn' : 'primary'}>
                      {p.status === 'NEEDS_GRADING' ? 'Por calificar' : 'Pendiente'}
                    </Chip>
                  }
                  onClick={() => p.courseId && navigate(`/course/${p.courseId}`)}
                  delay={i * 60}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ListRow({
  icon, name, meta, chip, onClick, delay = 0,
}: {
  icon: string; name: string; meta: string; chip: React.ReactNode; onClick: () => void; delay?: number;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 100 + delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'all 0.35s',
      }}
      className="
        group flex items-center gap-3 p-3
        border-2 border-ink bg-surface
        hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-sm
        transition-all duration-100
        text-left
      "
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{name}</div>
        <div className="text-xs text-muted font-mono truncate">{meta}</div>
      </div>
      {chip}
    </button>
  );
}
