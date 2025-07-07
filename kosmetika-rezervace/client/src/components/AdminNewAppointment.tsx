import { Button, MenuItem, TextField, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getServices, Service } from '../api/services';
import { getBlockedTimes, BlockedTime } from '../api/blockedTimes';
import {
  getAllAppointments,
  Appointment as AnyAppointment,
} from '../api/appointmentsAll';
import { createAppointmentAdmin } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

interface AdminNewAppointmentProps {
  onCreated: () => void;
}

const AdminNewAppointment = ({ onCreated }: AdminNewAppointmentProps) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [service, setService] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [allAppointments, setAllAppointments] = useState<AnyAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      getServices(),
      getBlockedTimes(),
      getAllAppointments().catch(() => []),
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
    if (!firstName.trim() || !lastName.trim()) {
      alert('Vyplňte jméno a příjmení klientky.');
      return;
    }
    try {
      await createAppointmentAdmin({
        date,
        service,
        firstName,
        lastName,
      });
      alert('Objednávka byla úspěšně vytvořena!');
      setDate('');
      setService('');
      setFirstName('');
      setLastName('');
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Chyba při odesílání objednávky:', err);
      alert('Chyba při vytváření objednávky');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} mt={2}>
        <TextField
          label="Jméno klientky"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <TextField
          label="Příjmení klientky"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <TextField
          label="Datum a čas"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
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
        >
          Objednat klientku
        </Button>
      </Stack>
    </form>
  );
};

export default AdminNewAppointment;
