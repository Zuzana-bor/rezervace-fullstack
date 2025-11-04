import { Button, MenuItem, TextField, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getServices, Service } from '../api/services';
import { getBlockedTimes, BlockedTime } from '../api/blockedTimes';
import {
  getAllAppointments,
  AdminAppointment as AnyAppointment,
  createAppointmentAdmin,
  updateAppointmentAdmin,
} from '../api/adminAppointments';

import { useAuth } from '../context/AuthContext';
import {
  formatCzechTime,
  parseCzechInput,
  parseDbTimeAsCzech,
} from '../utils/timezone';

interface AdminNewAppointmentProps {
  onCreated?: () => void;
  defaultDate?: string | null;
  prefilledClient?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  // ✅ NOVÉ props pro edit:
  editMode?: boolean;
  appointmentToEdit?: any;
  onUpdated?: () => void;
}

const AdminNewAppointment = ({
  onCreated,
  defaultDate,
  prefilledClient,
  editMode = false, // ✅ NOVÉ
  appointmentToEdit, // ✅ NOVÉ
  onUpdated, // ✅ NOVÉ
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
  const [notes, setNotes] = useState('');

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

  // ✅ PŘIDEJTE useEffect pro naplnění edit formuláře:
  useEffect(() => {
    if (editMode && appointmentToEdit) {
      console.log('📝 Edit mode - naplňuji formulář:', appointmentToEdit);

      // Převeď datum na local datetime string
      const appointmentDate = new Date(appointmentToEdit.date);
      const dateTimeLocal = appointmentDate.toISOString().slice(0, 16);

      setDate(dateTimeLocal);
      setFirstName(appointmentToEdit.clientFirstName || '');
      setLastName(appointmentToEdit.clientLastName || '');
      setClientPhone(appointmentToEdit.clientPhone || '');
      setNotes(appointmentToEdit.notes || '');

      // Najdi službu podle názvu
      const foundService = services.find(
        (s) => s.name === appointmentToEdit.service,
      );
      if (foundService) {
        setService(foundService._id);
        console.log('📝 Nalezena služba pro edit:', foundService.name);
      }
    }
  }, [editMode, appointmentToEdit, services]);

  const isOverlapping = () => {
    if (!date || !service) return false;

    const foundService = services.find((s) => s._id === service);
    if (!foundService) return false;

    // timezone parsing
    const parsedDate = parseCzechInput(date);
    const appointmentStart = new Date(date);
    const appointmentEnd = new Date(
      appointmentStart.getTime() + foundService.duration * 60000,
    );

    console.log('🔍 Admin overlap check (Czech time):');
    console.log(
      '📅 New appointment:',
      formatCzechTime(appointmentStart),
      '-',
      formatCzechTime(appointmentEnd),
    );
    console.log(
      '📅 Local time:',
      formatCzechTime(appointmentStart),
      '-',
      formatCzechTime(appointmentEnd),
    );
    console.log('📅 Duration:', foundService.duration, 'minutes');

    // kolize logika
    const conflict = allAppointments.find((existing) => {
      const existingStart = parseDbTimeAsCzech(existing.date);
      const existingEnd = new Date(
        existingStart.getTime() + (existing.duration || 0) * 60000,
      );

      // Podmínka 1: Nová začíná během existující
      const condition1 =
        existingStart <= appointmentStart && existingEnd > appointmentStart;

      // Podmínka 2: Nová končí během existující
      const condition2 =
        existingStart < appointmentEnd && existingEnd >= appointmentEnd;

      // Podmínka 3: Existující je uvnitř nové
      const condition3 =
        existingStart >= appointmentStart && existingStart < appointmentEnd;

      const hasConflict = condition1 || condition2 || condition3;

      if (hasConflict) {
        console.log('❌ Conflict detected (Czech fixed time):');
        console.log(
          '📅 Existing:',
          formatCzechTime(existingStart),
          '-',
          formatCzechTime(existingEnd),
        );
      }

      return hasConflict;
    });
    return !!conflict;
  };

  // ✅ UPRAVTE handleSubmit pro edit mode:
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
      const foundService = services.find((s) => s._id === service);
      if (!foundService) {
        alert('Vybraná služba nebyla nalezena.');
        return;
      }

      const czechTimeString = parseCzechInput(date);
      console.log('📤 Odesílám data:', { editMode, czechTimeString });

      if (editMode && appointmentToEdit) {
        // ✅ EDIT MODE - upravit existující
        await updateAppointmentAdmin(appointmentToEdit._id, {
          date: czechTimeString,
          service: foundService.name,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          clientPhone: clientPhone.trim(),
          notes: notes.trim() || undefined,
        });

        alert('Rezervace byla úspěšně upravena!');
        if (onUpdated) onUpdated();
      } else {
        // ✅ CREATE MODE - vytvořit novou
        await createAppointmentAdmin({
          date: czechTimeString,
          service: foundService.name,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          clientPhone: clientPhone.trim(),
          notes: notes.trim() || undefined,
        });

        alert('Objednávka byla úspěšně vytvořena!');
        if (onCreated) onCreated();
      }

      // Reset formuláře jen v create mode
      if (!editMode) {
        setDate('');
        setService('');
        setFirstName('');
        setLastName('');
        setClientPhone('');
        setNotes('');
      }
    } catch (err: any) {
      console.error(
        `❌ Chyba při ${editMode ? 'úpravě' : 'vytváření'} rezervace:`,
        err,
      );

      if (err.response?.status === 409) {
        alert('Tento termín je již obsazený. Vyberte prosím jiný čas.');
      } else {
        alert(
          `Chyba při ${editMode ? 'úpravě' : 'vytváření'} rezervace: ` +
            (err.response?.data?.message || err.message),
        );
      }
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

        <TextField
          label="Poznámka (volitelná)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
          placeholder="Speciální požadavky, alergie, poznámky k rezervaci..."
          helperText="Např. alergie na určité produkty, speciální požadavky, připomínky"
        />

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
          {editMode ? 'Uložit změny' : 'Objednat klientku'}
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
