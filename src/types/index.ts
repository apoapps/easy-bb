// ─── TypeScript types for BB DASH ────────────────────────────

export interface User {
  id: string;
  name: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  studentId?: string;
  batchUid?: string;
  userName?: string;
  avatar?: string;
}

export type GradeStatus = 'GRADED' | 'NEEDS_GRADING' | 'IN_PROGRESS' | 'NOT_ATTEMPTED' | 'OVERDUE';

export interface Column {
  id: string;
  columnName: string;
  dueDate: string | null;
  pointsPossible: number;
}

export interface Grade {
  columnId: string;
  courseId: string;
  userId: string;
  pointsPossible: number;
  score: number | null;
  effectiveScore: number | null;
  status: GradeStatus;
  displayGrade?: { grade?: string; score?: number; isOverride: boolean };
  manualGrade?: string | null;
  lastOverrideDate?: string | null;
  firstAttemptId?: string | null;
  lastAttemptId?: string | null;
}

export interface Actividad {
  columnId: string;
  columnName: string;
  score: number | null;
  pointsPossible: number;
  status: GradeStatus;
  dueDate: string | null;
  isOverride: boolean;
  lastOverrideDate: string | null;
  text: string | null;
  pct: number | null;
  courseName?: string;
  courseId?: string;
}

export interface Term {
  name: string;
  startDate?: string;
  endDate?: string;
  id?: string;
}

export interface Course {
  courseId: string;
  displayName: string;
  ultraStatus: 'ULTRA' | 'CLASSIC';
  term: Term;
  lastAccess: string | null;
  isCurrent?: boolean;
}

export interface Materia extends Course {
  promedio: number | null;
  totalEarned: number;
  totalPossible: number;
  actividades: Actividad[];
  urgentes?: Actividad[];
  pendientes?: Actividad[];
}

export interface KPIs {
  promedioGeneral: number | null;
  materiasActivas: number;
  actividadesTotales: number;
  actividadesCalificadas: number;
  pendientesCalificar: number;
  urgentes: number;
  promedioColor: 'good' | 'ok' | 'warn' | 'bad' | 'muted';
}

export interface Dashboard {
  ok: boolean;
  user: User;
  kpis: KPIs;
  urgentes: Actividad[];
  pendientes: Actividad[];
  materias: Materia[];
}
