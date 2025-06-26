import { List, ListItem, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';

type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // TODO: nahradit fetch z backendu
    setAppointments([
      {
        _id: '1',
        date: '2025-07-01T14:00',
        service: 'Kosmetika – hloubkové čištění',
        price: 800,
      },
      {
        _id: '2',
        date: '2025-07-15T09:30',
        service: 'Masáž obličeje',
        price: 450,
      },
     
     
    ]);
  }, []);

  return (
    <List>
      {appointments.map((app) => (
        <ListItem key={app._id}>
          <ListItemText
            primary={`${new Date(app.date).toLocaleString()} – ${app.service}`}
            secondary={`Cena: ${app.price} Kč`}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default MyAppointments;
