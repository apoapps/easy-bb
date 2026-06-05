import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Dashboard } from '../types';
import { CourseCard } from '../components/CourseCard';

export function CoursesPage() {
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
      <div className="flex gap-6 overflow-x-auto pb-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton shrink-0 w-[280px] h-[340px] border-4 border-ink" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-3xl tracking-tight">Tus materias</h2>
        <span className="text-muted font-mono text-sm">{d.materias[0]?.term?.name || '—'}</span>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scroll-snap-x scrollbar-thin">
        {d.materias.map((m, i) => (
          <CourseCard key={m.courseId} materia={m} index={i} />
        ))}
      </div>

      <p className="text-center text-muted text-sm">
        Desliza → para ver más. Click en una materia para drill-down.
      </p>
    </div>
  );
}
