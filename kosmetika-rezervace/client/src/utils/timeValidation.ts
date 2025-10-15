export const isWorkingHour = (date: Date): boolean => {
  const hour = date.getHours();
  return hour >= 10 && hour < 18;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const isInFuture = (date: Date, minimumHours: number = 2): boolean => {
  const now = new Date();
  const minimumTime = new Date(now.getTime() + minimumHours * 60 * 60 * 1000);
  return date >= minimumTime;
};

export const getTimeSlots = (
  selectedDate: Date,
): Array<{ time: string; available: boolean; reason?: string }> => {
  const slots = [];

  for (let hour = 10; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hour, minute, 0, 0);

      let available = true;
      let reason = '';

      if (isWeekend(slotTime)) {
        available = false;
        reason = 'Víkend';
      } else if (!isInFuture(slotTime, 2)) {
        available = false;
        reason = 'Příliš brzy';
      }

      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`,
        available,
        reason,
      });
    }
  }

  return slots;
};
