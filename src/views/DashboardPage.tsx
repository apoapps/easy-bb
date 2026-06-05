import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Dashboard } from '../types';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { KpiCard } from '../components/KpiCard';
import { DashboardSkeleton } from '../components/Skeleton';
import { UiIcon } from '../components/UiIcon';

const COURSE_COLORS = [
  { bg: '#5B5BD6', ink: '#FFFFFF' },
  { bg: '#347B83', ink: '#FFFFFF' },
  { bg: '#C2933A', ink: '#0A0A0A' },
  { bg: '#8A5270', ink: '#FFFFFF' },
  { bg: '#2F7D62', ink: '#FFFFFF' },
  { bg: '#626A78', ink: '#FFFFFF' },
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
  const base = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  if (diff < -1) return `${base} (${Math.abs(Math.round(diff))}d ago)`;
  if (diff < 0) return `${base} (overdue)`;
  if (diff < 1) return 'today';
  if (diff < 7) return `in ${Math.round(diff)}d`;
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
    return <DashboardSkeleton />;
  }

  const k = d.kpis;
  const materiasOrdenadas = [...d.materias].sort((a, b) => (b.promedio ?? -1) - (a.promedio ?? -1));
  const materiasConRiesgo = d.materias.filter(m => (m.promedio ?? 100) < 75 || (m.urgentes?.length || 0) > 0);
  const gradedPct = k.actividadesTotales > 0 ? Math.round((k.actividadesCalificadas / k.actividadesTotales) * 100) : 0;
  const allActivities = d.materias.flatMap(m => m.actividades.map(a => ({ ...a, courseName: m.displayName, courseId: m.courseId })));
  const recientes = allActivities
    .filter(a => a.score !== null || a.dueDate)
    .sort((a, b) => new Date(b.lastOverrideDate || b.dueDate || 0).getTime() - new Date(a.lastOverrideDate || a.dueDate || 0).getTime())
    .slice(0, 6);
  const lastMateria = [...d.materias].sort((a, b) =>
    new Date(b.lastAccess || 0).getTime() - new Date(a.lastAccess || 0).getTime()
  )[0];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Overall average" value={k.promedioGeneral || 0} suffix="%" gauge tone="primary" />
        <KpiCard label="Active courses" value={k.materiasActivas} icon={<UiIcon name="book" />} />
        <KpiCard label="Needs grading" value={k.pendientesCalificar} icon={<UiIcon name="clock" />} tone="warn" />
        <KpiCard
          label="Urgent"
          value={k.urgentes}
          icon={<UiIcon name="alert" />}
          tone="bad"
          pulse={(k.urgentes || 0) > 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.85fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wide">Course overview</h2>
              <p className="mt-1 text-sm text-muted">A compact view of Blackboard averages, pending work, and progress.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="shrink-0 bg-primary text-white border-2 border-ink px-3 py-2 text-xs font-display uppercase shadow-brutal-sm transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Open grid
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <OverviewTile label="Graded" value={`${gradedPct}%`} hint={`${k.actividadesCalificadas}/${k.actividadesTotales} activities`} tone="bg-good text-white" />
            <OverviewTile label="Needs attention" value={materiasConRiesgo.length} hint="courses to watch" tone="bg-warn text-ink" />
            <OverviewTile label="Stable" value={Math.max(0, k.materiasActivas - materiasConRiesgo.length)} hint="courses without urgent work" tone="bg-info text-white" />
          </div>

          <div className="mt-5 grid gap-2">
            {materiasOrdenadas.slice(0, 5).map((m) => (
              <button
                key={m.courseId}
                type="button"
                onClick={() => navigate(`/course/${m.courseId}`)}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-2 border-ink bg-surface-alt p-3 text-left transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-bold">{m.displayName}</div>
                  <div className="mt-1 h-2 border border-ink bg-white">
                    <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, m.promedio ?? 0))}%` }} />
                  </div>
                </div>
                <div className="text-right font-mono font-bold">{(m.promedio ?? 0).toFixed(1)}%</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-display text-lg uppercase tracking-wide">Recent activity</h3>
          <div className="mt-4 grid gap-2">
            {recientes.length === 0 ? (
              <div className="border-2 border-dashed border-ink/40 p-4 text-sm text-muted">No recent activity available.</div>
            ) : recientes.map((a, i) => (
              <ListRow
                key={`${a.columnId}-${i}`}
                icon={a.score === null ? <UiIcon name="list" /> : <UiIcon name="check" />}
                name={a.columnName}
                meta={a.courseName || ''}
                chip={<Chip tone={a.score === null ? 'info' : 'good'}>{a.score === null ? formatDate(a.dueDate) : `${a.pct ?? 0}%`}</Chip>}
                onClick={() => a.courseId && navigate(`/course/${a.courseId}`)}
                delay={i * 40}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Day banner */}
      {lastMateria && (() => {
        const c = colorForCourse(lastMateria.displayName);
        return (
          <button
            type="button"
            onClick={() => navigate(`/course/${lastMateria.courseId}`)}
            className="w-full min-w-0 text-left flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 border-2 border-ink shadow-brutal text-white transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg"
            style={{ background: `linear-gradient(135deg, ${c.bg} 0%, #0A0A0A 200%)` }}
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center border-2 border-white text-white">
              <UiIcon name="book" className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-display uppercase tracking-widest opacity-80">Featured course</div>
              <div className="font-display text-xl sm:text-2xl leading-tight mt-1 break-words">{lastMateria.displayName}</div>
            </div>
            <div className="self-start sm:self-center shrink-0 font-mono text-3xl sm:text-4xl font-bold bg-white text-ink px-3 py-1 border-2 border-ink shadow-brutal-sm">
              {(lastMateria.promedio || 0).toFixed(1)}%
            </div>
          </button>
        );
      })()}

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
            <UiIcon name="alert" className="h-5 w-5" /> Urgent
          </h3>
          {d.urgentes.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center border-2 border-ink text-good">
                <UiIcon name="check" />
              </div>
              No urgent work right now
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {d.urgentes.slice(0, 8).map((u, i) => (
                <ListRow
                  key={u.columnId + i}
                  icon={<UiIcon name="alert" />}
                  name={u.columnName}
                  meta={`${u.courseName || ''} · due ${formatDate(u.dueDate)}`}
                  chip={<Chip tone="bad">Overdue</Chip>}
                  onClick={() => u.courseId && navigate(`/course/${u.courseId}`)}
                  delay={i * 60}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
            <UiIcon name="list" className="h-5 w-5" /> Pending
          </h3>
          {d.pendientes.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center border-2 border-ink text-good">
                <UiIcon name="check" />
              </div>
              All clear
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {d.pendientes.slice(0, 8).map((p, i) => (
                <ListRow
                  key={p.columnId + i}
                  icon={p.status === 'NEEDS_GRADING' ? <UiIcon name="clock" /> : <UiIcon name="list" />}
                  name={p.columnName}
                  meta={p.courseName || ''}
                  chip={
                    <Chip tone={p.status === 'NEEDS_GRADING' ? 'warn' : 'primary'}>
                      {p.status === 'NEEDS_GRADING' ? 'Needs grading' : 'Pending'}
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

function OverviewTile({ label, value, hint, tone }: { label: string; value: string | number; hint: string; tone: string }) {
  return (
    <div className={`min-w-0 border-2 border-ink p-3 shadow-brutal-sm ${tone}`}>
      <div className="font-display text-2xl leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-display uppercase tracking-widest">{label}</div>
      <div className="mt-2 truncate text-xs font-mono opacity-80">{hint}</div>
    </div>
  );
}

function ListRow({
  icon, name, meta, chip, onClick,
}: {
  icon: React.ReactNode; name: string; meta: string; chip: React.ReactNode; onClick: () => void; delay?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex min-w-0 items-center gap-3 p-3
        border-2 border-ink bg-surface
        hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-sm
        transition-all duration-100
        text-left
      "
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-ink text-primary">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{name}</div>
        <div className="text-xs text-muted font-mono truncate">{meta}</div>
      </div>
      <div className="shrink-0">{chip}</div>
    </button>
  );
}
