export const parseCzechDate = (dateString: string): Date => {
  console.log('🇨🇿 Server parseCzechDate input:', dateString);

  // Pokud už má timezone, použij přímo
  if (
    dateString.includes('Z') ||
    dateString.includes('+') ||
    dateString.includes('-')
  ) {
    const date = new Date(dateString);
    console.log('🇨🇿 Server parsed with timezone:', date.toISOString());
    return date;
  }

  // ✅ OPRAVA: Parse bez timezone jako český lokální čas
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  const date = new Date(year, month - 1, day, hour, minute, 0, 0); // Lokální čas
  console.log('🇨🇿 Server parsed as local Czech time:', date.toISOString());
  return date;
}; // ✅ OPRAVA: Ukončení funkce

export const isWorkingHour = (dateString: string): boolean => {
  const date = parseCzechDate(dateString);
  const hour = date.getHours();
  return hour >= 10 && hour < 18;
};

export const isWeekend = (dateString: string): boolean => {
  const date = parseCzechDate(dateString);
  const day = date.getDay();
  return day === 0 || day === 6; // neděle nebo sobota
};

export const setDayStart = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const setDayEnd = (date: Date): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// ✅ PŘIDÁNO: Dodatečné utility funkce pro validace
export const isValidAppointmentTime = (
  date: Date,
): { valid: boolean; reason?: string } => {
  console.log('🕐 Validating appointment time:', date.toISOString());

  // Kontrola víkendu
  if (isWeekend(date.toISOString())) {
    return { valid: false, reason: 'O víkendech nepracujeme' };
  }

  // Kontrola pracovní doby
  if (!isWorkingHour(date.toISOString())) {
    return { valid: false, reason: 'Mimo pracovní dobu (10:00-18:00)' };
  }

  // Kontrola budoucnosti (min 2 hodiny dopředu)
  const now = new Date();
  const minimumTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  if (date < minimumTime) {
    return {
      valid: false,
      reason: 'Rezervace musí být minimálně 2 hodiny dopředu',
    };
  }

  return { valid: true };
};
