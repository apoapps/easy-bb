import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Dashboard } from '../types';
import { CourseCard } from '../components/CourseCard';
import { CourseGridSkeleton } from '../components/Skeleton';
import { Card } from '../components/Card';

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
    return <CourseGridSkeleton />;
  }

  const averageRank = (value: number | null) => value && value > 0 ? value : -1;
  const sortedCourses = [...d.materias].sort((a, b) => averageRank(b.promedio) - averageRank(a.promedio));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div className="min-w-0">
          <h2 className="font-display text-3xl tracking-tight">Courses</h2>
          <p className="mt-1 text-sm text-muted">
            Full course grid with averages, activity load, and Blackboard course status.
          </p>
        </div>
        <Card className="p-4">
          <div className="text-[10px] font-display uppercase tracking-widest text-muted">Term</div>
          <div className="mt-1 truncate font-mono text-sm font-bold">{d.materias[0]?.term?.name || '—'}</div>
          <div className="mt-2 text-xs text-muted">{d.materias.length} courses in grid</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedCourses.map((m, i) => (
          <CourseCard key={m.courseId} materia={m} index={i} />
        ))}
      </div>
    </div>
  );
}
