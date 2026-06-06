import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Dashboard } from '../types';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { DashboardSkeleton } from '../components/Skeleton';
import { UiIcon } from '../components/UiIcon';
import { getFirstName } from '../lib/userDisplay';

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
  const averageRank = (value: number | null) => value && value > 0 ? value : -1;
  const materiasOrdenadas = [...d.materias].sort((a, b) => averageRank(b.promedio) - averageRank(a.promedio));
  const materiasConRiesgo = d.materias.filter(m =>
    (m.promedio ?? 100) < 75 ||
    m.actividades.some(a => a.status === 'OVERDUE' || a.status === 'NEEDS_GRADING')
  );
  const gradedPct = k.actividadesTotales > 0 ? Math.round((k.actividadesCalificadas / k.actividadesTotales) * 100) : 0;
  const watchlistItems = k.urgentes + k.pendientesCalificar;
  const allActivities = d.materias.flatMap(m => m.actividades.map(a => ({ ...a, courseName: m.displayName, courseId: m.courseId })));
  const recientes = allActivities
    .filter(a => a.score !== null || a.dueDate)
    .sort((a, b) => new Date(b.lastOverrideDate || b.dueDate || 0).getTime() - new Date(a.lastOverrideDate || a.dueDate || 0).getTime())
    .slice(0, 6);
  const firstName = getFirstName(d.user);
  const signal = k.urgentes > 0 ? 'Needs attention' : (k.promedioGeneral ?? 0) >= 80 ? 'On track' : 'Keep going';
  const signalTone = k.urgentes > 0 ? 'bg-warn text-ink' : (k.promedioGeneral ?? 0) >= 80 ? 'bg-good text-white' : 'bg-info text-white';

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-5 border-2 border-ink bg-surface p-5 shadow-brutal sm:p-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
        <div className="min-w-0 flex flex-col justify-between gap-5">
          <div>
            <div className="text-[10px] font-display uppercase tracking-widest text-muted">Snapshot</div>
            <h1 className="mt-2 font-display text-4xl leading-none tracking-tight sm:text-5xl">Hi, {firstName}</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Your Blackboard progress in one quick read.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StoryMetric label="Average" value={k.promedioGeneral == null ? '—' : `${k.promedioGeneral.toFixed(1)}%`} detail="across graded work" />
            <StoryMetric label="Submitted" value={k.actividadesCalificadas} detail="historical graded items" />
            <StoryMetric label="Watchlist" value={watchlistItems} detail="items to review" />
          </div>
        </div>
        <div className={`border-2 border-ink px-4 py-4 shadow-brutal-sm ${signalTone}`}>
          <div className="text-[10px] font-display uppercase tracking-widest">Status</div>
          <div className="mt-1 font-display text-2xl leading-none">{signal}</div>
          <div className="mt-3 text-xs font-mono opacity-80">{k.urgentes} urgent · {k.pendientesCalificar} needs grading</div>
        </div>
      </section>

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
                <div className="text-right font-mono font-bold">{m.promedio == null ? '—' : `${m.promedio.toFixed(1)}%`}</div>
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

function StoryMetric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="border-2 border-ink bg-surface-alt p-4 shadow-brutal-sm">
      <div className="font-display text-3xl leading-none">{value}</div>
      <div className="mt-2 text-[10px] font-display uppercase tracking-widest">{label}</div>
      <div className="mt-1 truncate text-xs font-mono text-muted">{detail}</div>
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
