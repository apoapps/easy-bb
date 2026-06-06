import { useNavigate } from 'react-router-dom';
import type { Materia } from '../types';

export interface CourseCardProps {
  materia: Materia;
  index?: number;
}

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

export function CourseCard({ materia }: CourseCardProps) {
  const navigate = useNavigate();
  const c = colorForCourse(materia.displayName);
  const initials = materia.displayName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const prom = materia.promedio;

  return (
    <button
      type="button"
      onClick={() => navigate(`/course/${materia.courseId}`)}
      style={{
        background: c.bg,
        color: c.ink,
      }}
      className="
        group relative min-w-0 cursor-pointer overflow-hidden text-left
        w-full min-h-[300px] p-5
        border-4 border-ink shadow-brutal-lg
        flex flex-col justify-between
        hover:-translate-x-1 hover:-translate-y-1 hover:rotate-[-1deg] hover:shadow-[14px_14px_0_#0A0A0A]
        transition-all duration-150
      "
    >
      {/* corner ribbon */}
      <div
        className="absolute -top-8 -right-8 w-[90px] h-[90px] rotate-45"
        style={{ background: 'rgba(255,255,255,0.15)' }}
      />
      {/* stamp */}
      <div className="absolute top-3 right-3 bg-white text-ink border-2 border-ink px-2 py-0.5 text-xs font-bold rotate-[8deg]">
        {materia.actividades.length} items
      </div>

      <div>
        <div className="text-[10px] font-display uppercase tracking-widest opacity-85">
          {materia.term?.name || '2026-S1'} · {materia.ultraStatus}
        </div>
        <div className="mt-2 font-display text-xl leading-tight uppercase line-clamp-3 break-words">
          {materia.displayName}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-display uppercase tracking-widest opacity-85">Average</div>
        <div className="font-display text-6xl leading-none">
          {prom == null ? '—' : prom.toFixed(1)}{prom == null ? null : <span className="text-2xl">%</span>}
        </div>
        <div className="text-xs font-mono mt-1 opacity-90 truncate">
          {materia.totalEarned} / {materia.totalPossible} pts
        </div>
        <div className="mt-3 text-[10px] font-display uppercase tracking-widest opacity-80">
          {initials} · Open details
        </div>
      </div>
    </button>
  );
}
