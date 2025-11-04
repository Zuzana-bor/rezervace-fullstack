// client/src/utils/timezone.ts
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

/**
 * Převede ISO string z databáze na český Date objekt
 */
// client/src/utils/timezone.ts
export const parseDbTimeAsCzech = (dateString: string): Date => {
  if (!dateString) throw new Error('Date string is required');

  console.log('🇨🇿 parseDbTimeAsCzech input:', dateString);

  // Odděl datum a čas (např. 2025-10-16T10:00:00.000Z)
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  // Odstraníme "Z" nebo offset z konce
  const cleanTime = timePart.replace('Z', '').split('+')[0].split('-')[0];
  const [hour, minute, second] = cleanTime.split(':').map(Number);

  // Vytvoříme český lokální čas bez ohledu na UTC
  const localDate = new Date(year, month - 1, day, hour, minute, second || 0);

  console.log('🇨🇿 parseDbTimeAsCzech result:', localDate);
  return localDate;
};

export const parseDbTime = (dateString: string): Date => {
  if (!dateString) throw new Error('Date string is required');

  console.log('🇨🇿 parseDbTime input:', dateString);

  // Parse ISO string - JavaScript automaticky převede na lokální čas
  const date = new Date(dateString);

  console.log('🇨🇿 parseDbTime result:', date);
  return date;
};

/**
 * Formátuje Date na český formát pro zobrazení
 */
export const formatCzechTime = (
  date: Date | string,
  formatStr: string = "dd. MMMM yyyy 'v' HH:mm",
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseDbTime(date) : date;
    return format(dateObj, formatStr, { locale: cs });
  } catch (error) {
    console.error('❌ Error formatting Czech time:', error);
    return 'Chyba formátování data';
  }
};

/**
 * Formátuje datum pro FullCalendar (ISO string)
 */
export const formatForCalendar = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
};

/**
 * Bezpečné parsování user inputu jako český čas
 */
export const parseCzechInput = (dateString: string): string => {
  console.log('🇨🇿 parseCzechInput input:', dateString);

  // Pokud už má timezone, nech to tak
  if (
    dateString.includes('Z') ||
    dateString.includes('+') ||
    dateString.includes('-')
  ) {
    return dateString;
  }

  // Přidej český timezone offset
  const czechIsoString = dateString + '+00:00';
  console.log('🇨🇿 parseCzechInput result:', czechIsoString);
  return czechIsoString;
};
