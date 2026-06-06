import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Dashboard, User } from '../types';
import { AvatarPixel } from '../components/AvatarPixel';
import { Card } from '../components/Card';

function StatTile({ value, label, onClick, color = 'bg-surface' }: { value: string | number; label: string; onClick: () => void; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 border-2 border-ink ${color} hover:bg-accent transition-colors text-left`}
    >
      <div className="font-display text-2xl leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest mt-1">{label}</div>
    </button>
  );
}

export function ProfilePage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const navigate = useNavigate();
  const [d, setD] = useState<Dashboard | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await api.dashboard();
      if (mounted) setD(r);
    })();
    return () => { mounted = false; };
  }, []);

  if (!d) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="skeleton h-72 border-2 border-ink" />
        <div className="skeleton h-72 border-2 border-ink" />
      </div>
    );
  }

  const k = d.kpis;
  const termMap = new Map<string, typeof d.materias>();
  for (const m of d.materias) {
    const t = m.term?.name || '—';
    if (!termMap.has(t)) termMap.set(t, []);
    termMap.get(t)!.push(m);
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <section className="border-2 border-ink bg-surface p-5 shadow-brutal sm:p-6">
        <div className="text-[10px] font-display uppercase tracking-widest text-muted">Profile</div>
        <h1 className="mt-2 break-words font-display text-4xl leading-none sm:text-5xl">BB Wrapped</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          {user.name || user.userName} · Blackboard account, course history, and high-level academic metrics.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
      {/* Profile card */}
      <div className="p-6 bg-primary text-white border-2 border-ink shadow-brutal text-center">
        <div className="flex justify-center mb-4">
          <AvatarPixel seed={user.name} name={user.name} size={120} />
        </div>
        <div className="font-display text-xl leading-tight">{user.name || user.userName}</div>
        <div className="text-sm opacity-90 font-mono mt-1">{user.studentId || user.id}</div>

        <div className="grid grid-cols-2 gap-2 mt-6">
          <StatTile value={`${(k.promedioGeneral || 0).toFixed(1)}%`} label="Average" onClick={() => navigate('/dashboard')} color="bg-ink-soft text-white" />
          <StatTile value={k.materiasActivas} label="Courses" onClick={() => navigate('/courses')} color="bg-ink-soft text-white" />
          <StatTile value={k.actividadesCalificadas || 0} label="Graded" onClick={() => navigate('/dashboard')} color="bg-ink-soft text-white" />
          <StatTile value={k.urgentes} label="Urgent" onClick={() => navigate('/dashboard')} color="bg-ink-soft text-white" />
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-6 w-full px-4 py-2.5 bg-bad text-white border-2 border-white shadow-brutal-sm font-display uppercase tracking-wide transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Sign out
        </button>
      </div>

      {/* Terms */}
      <div>
        <h3 className="font-display text-xl mb-4">Terms</h3>
        <div className="flex flex-col gap-4">
          {[...termMap.entries()].map(([term, ms]) => (
            <Card key={term} className="p-4">
              <h4 className="font-display text-base mb-3 flex items-center justify-between">
                <span>{term}</span>
                <span className="text-xs text-muted font-sans font-normal">{ms.length} courses</span>
              </h4>
              <ul className="divide-y divide-ink/20">
                {[...ms].sort((a, b) => {
                  const aRank = a.promedio && a.promedio > 0 ? a.promedio : -1;
                  const bRank = b.promedio && b.promedio > 0 ? b.promedio : -1;
                  return bRank - aRank;
                }).map(m => (
                  <li key={m.courseId} className="py-2 flex items-center justify-between">
                    <span className="font-semibold text-sm">{m.displayName}</span>
                    <span className="font-mono font-bold">{m.promedio == null ? '—' : `${m.promedio.toFixed(1)}%`}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
