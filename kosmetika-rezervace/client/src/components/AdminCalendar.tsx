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
import { getAllAppointments } from '../api/adminAppointments';
import { deleteAppointment } from '../api/appointments';
import { formatCzechTime, formatForCalendar } from '../utils/timezone';
import AdminNewAppointment from './AdminNewAppointment';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

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

  useEffect(() => {
    getAllAppointments().then((r) => {
      console.log('📅 DEBUGGING - Raw appointments from backend:', r);

      setRawEvents(r);
      setEvents(
        r.map((a: any) => {
          const appointmentDate = new Date(a.date);
          console.log(
            `📅 CZECH TIME - ${a.service} raw: ${
              a.date
            }, formatted: ${formatCzechTime(a.date, 'dd.MM.yyyy HH:mm')}`,
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
            start: formatForCalendar(a.date), // ✅ Czech timezone
            _id: a._id,
            ...a,
          };
        }),
      );
    });
  }, [refreshKey]);

  const handleDateClick = (info: any) => {
    const clickedDate = info.dateStr;
    setDefaultDate(clickedDate);
    setShowNewAppointment(true);
  };

  const handleEventClick = (info: any) => {
    const eventData = rawEvents.find((e) => e._id === info.event.id);
    setSelectedEvent(eventData);
    setShowEventDetail(true);
  };

  const handleDeleteAppointment = async () => {
    if (!selectedEvent) return;

    if (window.confirm('Opravdu chcete smazat tuto rezervaci?')) {
      try {
        console.log('🗑️ Admin mazání rezervace:', selectedEvent._id);
        await deleteAppointment(selectedEvent._id); // ✅ Admin endpoint
        setShowEventDetail(false);

        // ✅ Refresh s admin API
        const updatedAppointments = await getAllAppointments();
        setRawEvents(updatedAppointments);

        setEvents(
          updatedAppointments.map((a: any) => ({
            id: a._id,
            title: `${a.service} – ${
              a.userId
                ? `${a.userId.firstName} ${a.userId.lastName}`
                : a.clientFirstName && a.clientLastName
                ? `${a.clientFirstName} ${a.clientLastName}`
                : 'Neznámý klient'
            }`,
            start: formatForCalendar(a.date), // ✅ Czech timezone
            _id: a._id,
            ...a,
          })),
        );

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
                  {selectedEvent.date
                    ? formatCzechTime(selectedEvent.date)
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
              upravit rezervaci
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
                // Refresh kalendáře po vytvoření
                getAllAppointments().then((r) => {
                  setRawEvents(r);
                  setEvents(
                    r.map((a: any) => {
                      const appointmentDate = new Date(a.date);
                      return {
                        id: a._id,
                        title: `${a.service} – ${
                          a.userId
                            ? `${a.userId.firstName} ${a.userId.lastName}`
                            : a.clientFirstName && a.clientLastName
                            ? `${a.clientFirstName} ${a.clientLastName}`
                            : 'Neznámý klient'
                        }`,
                        start: a.date, // ZMĚNA: Přesně to co vrací backend
                        _id: a._id,
                        ...a,
                      };
                    }),
                  );
                });
              }}
              defaultDate={defaultDate}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNewAppointment(false)}>Zrušit</Button>
          </DialogActions>
        </Dialog>

        {/* ✅ Dialog pro úpravu rezervace */}
        <Dialog
          open={showEditAppointment}
          onClose={() => setShowEditAppointment(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Upravit rezervaci</DialogTitle>
          <DialogContent>
            <AdminNewAppointment
              editMode={true} // ✅ Edit mode
              appointmentToEdit={selectedEvent} // ✅ Předvyplněná data
              onUpdated={() => {
                setShowEditAppointment(false);
                // Refresh kalendáře po úpravě
                getAllAppointments().then((r) => {
                  setRawEvents(r);
                  setEvents(
                    r.map((a: any) => ({
                      id: a._id,
                      title: `${a.service} – ${
                        a.userId
                          ? `${a.userId.firstName} ${a.userId.lastName}`
                          : a.clientFirstName && a.clientLastName
                          ? `${a.clientFirstName} ${a.clientLastName}`
                          : 'Neznámý klient'
                      }`,
                      start: formatForCalendar(a.date),
                      _id: a._id,
                      ...a,
                    })),
                  );
                });
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
