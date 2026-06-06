import type { User } from '../types';

function looksLikeStudentNumber(value: string | undefined): boolean {
  return !!value && /^m\d{4,}$/i.test(value.trim());
}

function isUsefulName(value: string | undefined): boolean {
  if (!value) return false;
  if (value === 'Student') return false;
  if (looksLikeStudentNumber(value)) return false;
  if (/^[a-z]?\d{4,}$/i.test(value)) return false;
  return /[a-z]/i.test(value);
}

export function getDisplayName(user: User | null): string {
  if (!user) return 'Student';
  const fullName = [user.givenName, user.familyName].filter(Boolean).join(' ');
  if (isUsefulName(user.name)) return user.name;
  if (isUsefulName(fullName)) return fullName;
  return 'Student';
}

export function getFirstName(user: User | null): string {
  const displayName = getDisplayName(user);
  return displayName.split(/\s+/)[0] || 'Student';
}

export function getDisplaySubtitle(user: User | null): string | undefined {
  if (!user) return undefined;
  return user.studentId || (looksLikeStudentNumber(user.userName) ? user.userName : undefined) || user.email || user.userName || user.id;
}
