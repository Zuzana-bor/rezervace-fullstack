// src/components/NewAppointment.tsx
import { Button, MenuItem, TextField, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getServices, Service } from '../api/services';
import { getBlockedTimes, BlockedTime } from '../api/blockedTimes';
import {
  getAllAppointments,
  Appointment as AnyAppointment,
} from '../api/appointmentsAll';
import { createAppointment } from '../api/appointments';

interface NewAppointmentProps {
  onCreated: () => void;
}

// Pomocné funkce pro blokování a obsazenost (přesunuto nahoru)
function isBlocked(dateStr: string, blockedTimes: BlockedTime[]) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  // Víkend
  if (d.getDay() === 0 || d.getDay() === 6) return true;
  // Blokované intervaly
  return blockedTimes.some((b) => {
    const start = new Date(b.start);
    const end = new Date(b.end);
    if (b.allDay) {
      // Blokace na celý den
      return (
        d >= new Date(start.setHours(0, 0, 0, 0)) &&
        d <= new Date(end.setHours(23, 59, 59, 999))
      );
    }
    return d >= start && d < end;
  });
}
function isOccupied(dateStr: string, allAppointments: AnyAppointment[]) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return allAppointments.some((a) => {
    const start = new Date(a.date);
    const end = new Date(start.getTime() + (a.duration || 60) * 60000);
    return d >= start && d < end;
  });
}

const NewAppointment = ({ onCreated }: NewAppointmentProps) => {
  const [date, setDate] = useState('');
  const [service, setService] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [allAppointments, setAllAppointments] = useState<AnyAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      getServices(),
      getBlockedTimes(),
      getAllAppointments().catch(() => []), // pokud selže, vrátí prázdné pole
    ])
      .then(([services, blocked, appointments]) => {
        if (!isMounted) return;
        setServices(services);
        setBlockedTimes(blocked);
        setAllAppointments(appointments);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const found = services.find((s) => s._id === service);
    setSelectedPrice(found ? found.price : null);
  }, [service, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !service) {
      setError('Prosím vyplňte všechna pole');
      return;
    }

    // Kontrola, zda je termín obsazený
    const selectedDateTime = new Date(date);
    const isTimeOccupied = allAppointments.some((apt: any) => {
      const aptDate = new Date(apt.date);
      return Math.abs(aptDate.getTime() - selectedDateTime.getTime()) < 60000; // Rozdíl menší než 1 minuta
    });

    if (isTimeOccupied) {
      setError('Tento termín je již obsazený. Prosím vyberte jiný čas.');
      return;
    }

    // Kontrola blokovaných časů
    const isTimeBlocked = blockedTimes.some((blockedTime: any) => {
      const blockedDate = new Date(blockedTime.date);
      return (
        Math.abs(blockedDate.getTime() - selectedDateTime.getTime()) < 60000
      );
    });

    if (isTimeBlocked) {
      setError('V tomto termínu nepracujem. Prosím vyberte jiný čas.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createAppointment({ date, service });
      alert('Rezervace byla úspěšně vytvořena!');
      setDate('');
      setService('');
      if (onCreated) onCreated();
    } catch (err: any) {
      console.error('Chyba při odesílání objednávky:', err);

      // Lepší error handling
      if (err?.response?.status === 409) {
        setError('Tento termín je již obsazený. Prosím vyberte jiný čas.');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Chyba při vytváření rezervace. Zkuste to prosím znovu.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} mt={2}>
        <TextField
          label="Datum a čas"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          error={
            isBlocked(date, blockedTimes) || isOccupied(date, allAppointments)
          }
          helperText={
            isBlocked(date, blockedTimes)
              ? 'Tento termín je blokovaný.'
              : isOccupied(date, allAppointments)
              ? 'Tento termín je obsazený.'
              : ''
          }
          disabled={loading || services.length === 0}
        />
        <TextField
          label="Služba"
          select
          value={service}
          onChange={(e) => setService(e.target.value)}
          disabled={services.length === 0}
        >
          {services.length === 0 ? (
            <MenuItem value="" disabled>
              Žádné služby nejsou k dispozici
            </MenuItem>
          ) : (
            services.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name} ({s.price} Kč)
              </MenuItem>
            ))
          )}
        </TextField>
        {selectedPrice !== null && (
          <Typography sx={{ color: '#2f6c3a', fontWeight: 600 }}>
            Cena: {selectedPrice} Kč
          </Typography>
        )}
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: '#2f6c3a',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#265a32',
            },
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Probíhá rezervace...' : 'Objednat se'}
        </Button>
      </Stack>
    </form>
  );
};

export default NewAppointment;
