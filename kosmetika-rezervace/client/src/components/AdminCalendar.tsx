import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useEffect } from 'react';
import { getAllAppointments } from '../api/adminAppointments'; // ✅ Admin API pro načítání
import { deleteAppointment } from '../api/appointments'; // ✅ User API pro mazání
import { formatForCalendar } from '../utils/timezone';
import AdminNewAppointment from './AdminNewAppointment';

interface AdminCalendarProps {
  refreshKey: number;
}

const AdminCalendar = ({ refreshKey }: AdminCalendarProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [defaultDate, setDefaultDate] = useState<string | null>(null);
  const [showEditAppointment, setShowEditAppointment] = useState(false);

  // ✅ HELPER funkce pro refresh kalendáře
  const refreshCalendar = async () => {
    const appointments = await getAllAppointments();
    console.log('📅 DEBUGGING - Raw appointments from backend:', appointments);

    setRawEvents(appointments);

    const calendarEvents = appointments.map((a: any) => {
      const calendarTime = formatForCalendar(a.date);
      console.log(
        `📅 EVENT - ${a.service} raw: ${a.date}, calendar: ${calendarTime}`,
      );

      return {
        id: a._id,
        title: `${a.service} – ${
          a.userId
            ? `${a.userId.firstName} ${a.userId.lastName}`
            : a.clientFirstName && a.clientLastName
            ? `${a.clientFirstName} ${a.clientLastName}`
            : 'Neznámý klient'
        }`,
        start: calendarTime, // ✅ KONZISTENTNÍ - vždy formatForCalendar
        _id: a._id,
        ...a,
      };
    });

    setEvents(calendarEvents);
  };

  useEffect(() => {
    refreshCalendar();
  }, [refreshKey]);

  const handleDateClick = (info: any) => {
    const clickedDate = info.dateStr;
    setDefaultDate(clickedDate);
    setShowNewAppointment(true);
  };

  // ✅ OPRAVENO - přidám debug pro time rozdíly
  const handleEventClick = (info: any) => {
    const eventData = rawEvents.find((e) => e._id === info.event.id);

    // ✅ DEBUG - co zobrazuje kalendář vs co je v DB
    console.log('🔍 EVENT CLICK DEBUG:', {
      eventId: info.event.id,
      calendarDisplayTime: info.event.start,
      rawDbDate: eventData?.date,
      formatForCalendarResult: formatForCalendar(eventData?.date || ''),
    });

    // ✅ PŘIDÁNO - uložím čas jak ho zobrazuje kalendář
    const eventWithCalendarTime = {
      ...eventData,
      displayTime: info.event.start, // ✅ Čas z kalendáře
    };

    setSelectedEvent(eventWithCalendarTime);
    setShowEventDetail(true);
  };

  const handleDeleteAppointment = async () => {
    if (!selectedEvent) return;

    if (window.confirm('Opravdu chcete smazat tuto rezervaci?')) {
      try {
        console.log('🗑️ Admin mazání rezervace:', selectedEvent._id);
        await deleteAppointment(selectedEvent._id); // call API delete function
        setShowEventDetail(false);
        await refreshCalendar(); // ✅ POUŽIJU helper funkci
        console.log('✅ Admin rezervace smazána a kalendář aktualizován');
      } catch (error) {
        console.error('❌ Chyba při mazání rezervace:', error);
        alert('Chyba při mazání rezervace');
      }
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="#2f6c3a" fontWeight="bold">
          📅 Kalendář rezervací
        </Typography>
        <Box sx={{ height: 600 }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            timeZone="Europe/Prague"
            firstDay={1}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="100%"
            locale="cs"
            buttonText={{
              today: 'Dnes',
              month: 'Měsíc',
              week: 'Týden',
              day: 'Den',
            }}
            dayHeaderFormat={{ weekday: 'short' }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
          />
        </Box>

        {/* Dialog pro detail rezervace */}
        <Dialog
          open={showEventDetail}
          onClose={() => setShowEventDetail(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Detail rezervace</DialogTitle>
          <DialogContent>
            {selectedEvent && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedEvent.service}
                </Typography>
                <Typography>
                  <strong>Datum:</strong>{' '}
                  {/* ✅ OPRAVENO - používám čas z kalendáře */}
                  {selectedEvent.displayTime
                    ? selectedEvent.displayTime.toLocaleString('cs-CZ', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : selectedEvent.date
                    ? new Date(
                        formatForCalendar(selectedEvent.date),
                      ).toLocaleString('cs-CZ', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Neplatné datum'}
                </Typography>
                <Typography>
                  <strong>Klient:</strong>{' '}
                  {selectedEvent.userId
                    ? `${selectedEvent.userId.firstName} ${selectedEvent.userId.lastName}`
                    : selectedEvent.clientFirstName &&
                      selectedEvent.clientLastName
                    ? `${selectedEvent.clientFirstName} ${selectedEvent.clientLastName}`
                    : 'Neznámý klient'}
                </Typography>
                {selectedEvent.clientPhone && (
                  <Typography>
                    <strong>Telefon:</strong> {selectedEvent.clientPhone}
                  </Typography>
                )}
                <Typography>
                  <strong>Cena:</strong> {selectedEvent.price} Kč
                </Typography>
                <Typography>
                  <strong>Délka:</strong> {selectedEvent.duration} minut
                </Typography>
                {selectedEvent.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      component="div"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                      📝 Poznámka:
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1,
                        border: '1px solid #e9ecef',
                        fontStyle: 'italic',
                        color: '#495057',
                      }}
                    >
                      <Typography variant="body2">
                        {selectedEvent.notes}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {selectedEvent.createdByAdmin && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Rezervace vytvořena administrátorem
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowEventDetail(false);
                setShowEditAppointment(true);
              }}
              color="primary"
              variant="outlined"
            >
              Upravit rezervaci
            </Button>
            <Button
              onClick={handleDeleteAppointment}
              color="error"
              variant="outlined"
            >
              Smazat rezervaci
            </Button>
            <Button onClick={() => setShowEventDetail(false)}>Zavřít</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog pro novou rezervaci */}
        <Dialog
          open={showNewAppointment}
          onClose={() => setShowNewAppointment(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Nová rezervace</DialogTitle>
          <DialogContent>
            <AdminNewAppointment
              onCreated={() => {
                setShowNewAppointment(false);
                refreshCalendar(); // ✅ POUŽIJU helper funkci
              }}
              defaultDate={defaultDate}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNewAppointment(false)}>Zrušit</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog pro úpravu rezervace */}
        <Dialog
          open={showEditAppointment}
          onClose={() => setShowEditAppointment(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Upravit rezervaci</DialogTitle>
          <DialogContent>
            <AdminNewAppointment
              editMode={true}
              appointmentToEdit={selectedEvent}
              onUpdated={() => {
                setShowEditAppointment(false);
                refreshCalendar(); // ✅ POUŽIJU helper funkci
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditAppointment(false)}>
              Zrušit
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminCalendar;
