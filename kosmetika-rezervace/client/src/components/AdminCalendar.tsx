import { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getAllAppointments } from '../api/appointmentsAll';

interface AdminCalendarProps {
  onEventClick?: (event: any) => void;
  onDateClick?: (dateStr: string) => void;
  refreshKey?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
}

const AdminCalendar = ({
  onEventClick,
  onDateClick,
  refreshKey,
}: AdminCalendarProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);

  useEffect(() => {
    getAllAppointments().then((r) => {
      setRawEvents(r);
      setEvents(
        r.map((a: any) => ({
          id: a._id, // FullCalendar potřebuje id
          title: `${a.service} – ${a.userId?.name || ''}`,
          start: a.date,
          _id: a._id, // přidej _id explicitně
          ...a, // předej celé appointment pro detail/mazání
        })),
      );
    });
  }, [refreshKey]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Rezervace (kalendář)
      </Typography>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        height={600}
        eventClick={(info) => {
          if (onEventClick) {
            // předávej celý event objekt včetně _id
            onEventClick(info.event.extendedProps);
          }
        }}
        dateClick={(info) => {
          // Pomocná funkce pro převod Date na yyyy-MM-ddTHH:mm v lokálním čase
          function toLocalDatetimeString(dateObj: Date) {
            const pad = (n: number) => n.toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            const month = pad(dateObj.getMonth() + 1);
            const day = pad(dateObj.getDate());
            const hours = pad(dateObj.getHours());
            const minutes = pad(dateObj.getMinutes());
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          }
          const dateObj = info.date;
          const localDatetime = toLocalDatetimeString(dateObj);
          if (onDateClick) onDateClick(localDatetime);
        }}
      />
    </Paper>
  );
};

export default AdminCalendar;
