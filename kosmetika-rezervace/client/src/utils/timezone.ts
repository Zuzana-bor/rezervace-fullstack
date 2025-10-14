// client/src/utils/timezone.ts
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

/**
 * Převede ISO string z databáze na český Date objekt
 */
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
  const czechIsoString = dateString + '+01:00';
  console.log('🇨🇿 parseCzechInput result:', czechIsoString);
  return czechIsoString;
};
