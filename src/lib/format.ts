import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatClp(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortDate(value: string | Date) {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, 'd MMM', { locale: es });
}

export function formatDateRange(start: string | Date, end: string | Date | null) {
  if (!end) {
    return formatShortDate(start);
  }

  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export function formatDistance(km?: number) {
  if (km === undefined) {
    return '';
  }

  return `${km.toFixed(1).replace('.', ',')} km`;
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
