// server/src/utils/timezone.ts
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

   const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  const date = new Date(year, month - 1, day, hour, minute, 0, 0); // Lokální čas
  console.log('🇨🇿 Server parsed as local Czech time:', date.toISOString());
  return date;
};

  // Jinak přidej český timezone offset (+01:00 zimní, +02:00 letní čas)

  const czechDate = new Date(dateString + '+02:00');
  console.log('🇨🇿 Server parsed as Czech time:', czechDate.toISOString());
  return czechDate;
};

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
