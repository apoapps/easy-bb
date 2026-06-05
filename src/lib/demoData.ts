import type { Actividad, Dashboard, Materia } from '../types';

const acts = (prefix: string, rows: Array<[string, number | null, number, Actividad['status'], string]>): Actividad[] =>
  rows.map(([name, score, pointsPossible, status, dueDate], i) => ({
    columnId: `_demo_${prefix}_${i}`,
    columnName: name,
    score,
    pointsPossible,
    status,
    dueDate,
    isOverride: false,
    lastOverrideDate: null,
    text: null,
    pct: score != null ? (score / pointsPossible) * 100 : null,
  }));

const withCourse = (actividad: Actividad, materia: Materia): Actividad => ({
  ...actividad,
  courseId: materia.courseId,
  courseName: materia.displayName,
});

const materias: Materia[] = [
  {
    courseId: '_demo_course_analytics',
    displayName: 'COURSE A',
    ultraStatus: 'ULTRA',
    lastAccess: '2026-06-03T16:22:36.174Z',
    term: { name: '2026-S1' },
    promedio: 91.4,
    totalEarned: 914,
    totalPossible: 1000,
    actividades: acts('analytics', [
      ['Assignment 1', 95, 100, 'GRADED', '2026-02-05T07:00:00.000Z'],
      ['Assignment 2', 88, 100, 'GRADED', '2026-03-12T07:00:00.000Z'],
      ['Assignment 3', 92, 100, 'GRADED', '2026-04-23T07:00:00.000Z'],
      ['Assignment 4', null, 100, 'NEEDS_GRADING', '2026-06-02T07:00:00.000Z'],
    ]),
  },
  {
    courseId: '_demo_course_systems',
    displayName: 'COURSE B',
    ultraStatus: 'ULTRA',
    lastAccess: '2026-06-02T11:10:00.000Z',
    term: { name: '2026-S1' },
    promedio: 84.8,
    totalEarned: 678,
    totalPossible: 800,
    actividades: acts('systems', [
      ['Assignment 1', 86, 100, 'GRADED', '2026-02-20T07:00:00.000Z'],
      ['Assignment 2', 79, 100, 'GRADED', '2026-04-10T07:00:00.000Z'],
      ['Assignment 3', 90, 100, 'GRADED', '2026-05-01T07:00:00.000Z'],
      ['Assignment 4', null, 100, 'IN_PROGRESS', '2026-06-12T07:00:00.000Z'],
    ]),
  },
  {
    courseId: '_demo_course_ethics',
    displayName: 'COURSE C',
    ultraStatus: 'ULTRA',
    lastAccess: '2026-06-01T09:35:00.000Z',
    term: { name: '2026-S1' },
    promedio: 89.2,
    totalEarned: 535,
    totalPossible: 600,
    actividades: acts('communication', [
      ['Assignment 1', 100, 100, 'GRADED', '2026-02-15T07:00:00.000Z'],
      ['Assignment 2', 85, 100, 'GRADED', '2026-03-28T07:00:00.000Z'],
      ['Assignment 3', 83, 100, 'GRADED', '2026-05-14T07:00:00.000Z'],
      ['Assignment 4', null, 100, 'NOT_ATTEMPTED', '2026-06-15T07:00:00.000Z'],
    ]),
  },
];

const urgentes = [
  withCourse(materias[0].actividades[3], materias[0]),
  withCourse(materias[1].actividades[3], materias[1]),
  withCourse(materias[2].actividades[3], materias[2]),
];

const pendientes = [
  withCourse(materias[0].actividades[3], materias[0]),
  withCourse(materias[1].actividades[3], materias[1]),
];

export const DEMO_DASHBOARD: Dashboard = {
  ok: true,
  user: {
    id: '_demo_user_1',
    name: 'Demo Student',
    givenName: 'Demo',
    familyName: 'Student',
    userName: 'demo.student',
    email: 'demo.student@example.edu',
    studentId: 'DEMO-0000',
    batchUid: 'demo.student',
    avatar: '',
  },
  kpis: {
    promedioGeneral: 88.5,
    materiasActivas: materias.length,
    actividadesTotales: materias.reduce((total, materia) => total + materia.actividades.length, 0),
    actividadesCalificadas: materias.reduce(
      (total, materia) => total + materia.actividades.filter(actividad => actividad.status === 'GRADED').length,
      0,
    ),
    pendientesCalificar: pendientes.length,
    urgentes: urgentes.length,
    promedioColor: 'ok',
  },
  urgentes,
  pendientes,
  materias,
};
