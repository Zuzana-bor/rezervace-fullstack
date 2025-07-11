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
          // Pokud je v info.date čas (např. při kliknutí v timeGrid), použijeme ho
          const dateObj = info.date;
          const iso = dateObj.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
          if (onDateClick) onDateClick(iso);
        }}
      />
    </Paper>
  );
};

export default AdminCalendar;
