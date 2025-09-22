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
  defaultDate?: string | null;
  prefilledClient?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

const AdminNewAppointment = ({
  onCreated,
  defaultDate,
  prefilledClient,
}: AdminNewAppointmentProps) => {
  const { user } = useAuth();
  const [date, setDate] = useState(() => {
    if (!defaultDate) return '';
    // Pokud je v defaultDate čas (obsahuje T), použijeme ho, jinak přidáme T10:00
    return defaultDate.includes('T') ? defaultDate : defaultDate + 'T10:00';
  });
  const [service, setService] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [allAppointments, setAllAppointments] = useState<AnyAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState(prefilledClient?.firstName || '');
  const [lastName, setLastName] = useState(prefilledClient?.lastName || '');
  const [clientPhone, setClientPhone] = useState(prefilledClient?.phone || '');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      getServices().catch((err) => {
        console.error('Chyba při načítání služeb:', err);
        return [];
      }),
      getBlockedTimes().catch((err) => {
        console.error('Chyba při načítání blokací:', err);
        return [];
      }),
      getAllAppointments().catch((err) => {
        console.error('Chyba při načítání rezervací:', err);
        return [];
      }),
    ])
      .then(([services, blocked, appointments]) => {
        if (!isMounted) return;
        setServices(services);
        setBlockedTimes(blocked);
        setAllAppointments(appointments);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoading(false);
        console.error('Chyba při načítání dat:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const found = services.find((s) => s._id === service);
    setSelectedPrice(found ? found.price : null);
  }, [service, services]);

  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate.includes('T') ? defaultDate : defaultDate + 'T10:00');
    }
  }, [defaultDate]);

  // Aktualizace předvyplněných údajů klientky
  useEffect(() => {
    if (prefilledClient) {
      setFirstName(prefilledClient.firstName || '');
      setLastName(prefilledClient.lastName || '');
      setClientPhone(prefilledClient.phone || '');
    }
  }, [prefilledClient]);

  const isOverlapping = () => {
    if (!date || !service) return false;
    const foundService = services.find((s) => s._id === service);
    if (!foundService) return false;
    const start = new Date(date);
    const end = new Date(start.getTime() + foundService.duration * 60000);
    return allAppointments.some((appt) => {
      const apptStart = new Date(appt.date);
      const apptEnd = new Date(
        apptStart.getTime() + (appt.duration || 0) * 60000,
      );
      // Překryv: (start < apptEnd) && (end > apptStart)
      return start < apptEnd && end > apptStart;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert('Vyplňte jméno a příjmení klientky.');
      return;
    }
    if (!clientPhone.trim()) {
      alert('Vyplňte telefon klientky.');
      return;
    }
    // Základní validace českého čísla (9 číslic, může začínat +420)
    const phonePattern = /^(\+420)?\s?\d{3}\s?\d{3}\s?\d{3}$/;
    if (!phonePattern.test(clientPhone.replace(/\s+/g, ''))) {
      alert('Zadejte platné telefonní číslo (9 číslic, případně s +420).');
      return;
    }
    if (!date) {
      alert('Vyberte datum a čas.');
      return;
    }
    if (!service) {
      alert('Vyberte službu.');
      return;
    }
    if (isOverlapping()) {
      alert(
        'V tomto čase již existuje jiná rezervace. Vyberte prosím jiný čas.',
      );
      return;
    }
    try {
      // Najdi název služby podle _id
      const foundService = services.find((s) => s._id === service);
      if (!foundService) {
        alert('Vybraná služba nebyla nalezena.');
        return;
      }
      // Ensure date is sent with Czech timezone (+02:00) for consistent handling
      const dateWithTimezone = date.includes('+') || date.includes('Z') || date.includes('-') 
        ? date 
        : date + '+02:00';
        
      await createAppointmentAdmin({
        date: dateWithTimezone,
        service: foundService.name,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        clientPhone: clientPhone.trim(),
      });
      alert('Objednávka byla úspěšně vytvořena!');
      setDate('');
      setService('');
      setFirstName('');
      setLastName('');
      setClientPhone('');
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Chyba při odesílání objednávky:', err);
      alert(
        'Chyba při vytváření objednávky. Zkontrolujte připojení a zadané údaje.',
      );
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
          label="Telefon klientky"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          required
        />
        <TextField
          label="Datum a čas"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          disabled={loading}
        />
        <TextField
          label="Služba"
          select
          value={service}
          onChange={(e) => setService(e.target.value)}
          disabled={loading}
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
          disabled={isOverlapping()}
        >
          Objednat klientku
        </Button>
        {isOverlapping() && (
          <Typography color="error" sx={{ mt: 1 }}>
            V tomto čase již existuje jiná rezervace. Vyberte prosím jiný čas.
          </Typography>
        )}
      </Stack>
    </form>
  );
};

export default AdminNewAppointment;
