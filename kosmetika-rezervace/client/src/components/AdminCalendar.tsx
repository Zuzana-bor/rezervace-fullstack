import { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

interface AdminCalendarProps {
  onEventClick?: (event: any) => void;
}

const AdminCalendar = ({ onEventClick }: AdminCalendarProps) => {
  const [events, setEvents] = useState([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('/api/admin/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => {
        setRawEvents(r.data);
        setEvents(
          r.data.map((a: any) => ({
            id: a._id,
            title: `${a.service} – ${a.userId?.name || ''}`,
            start: a.date,
          })),
        );
      });
  }, []);

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
            const found = rawEvents.find((a) => a._id === info.event.id);
            if (found) onEventClick(found);
          }
        }}
      />
    </Paper>
  );
};

export default AdminCalendar;
