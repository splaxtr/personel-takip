import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

export function bugun(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatTarih(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMMM yyyy', { locale: tr });
  } catch {
    return iso;
  }
}

export function formatTarihKisa(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMM', { locale: tr });
  } catch {
    return iso;
  }
}

export function buHaftaAraligi(): { bas: string; son: string } {
  const simdi = new Date();
  return {
    bas: format(startOfWeek(simdi, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    son: format(endOfWeek(simdi, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

export function buAyAraligi(): { bas: string; son: string } {
  const simdi = new Date();
  return {
    bas: format(startOfMonth(simdi), 'yyyy-MM-dd'),
    son: format(endOfMonth(simdi), 'yyyy-MM-dd'),
  };
}

export function isoTarihten(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function tarihtenIso(iso: string): Date {
  return parseISO(iso);
}
