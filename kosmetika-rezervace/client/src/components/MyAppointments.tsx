import { getMyAppointments } from '../api/appointments';
import { useEffect, useState } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
};

interface MyAppointmentsProps {
  appointments?: Appointment[];
  error?: string;
}

const MyAppointments = ({ appointments: propAppointments, error: propError }: MyAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>(propAppointments || []);
  const [error, setError] = useState<string>(propError || '');

  useEffect(() => {
    getMyAppointments()
      .then(setAppointments)
      .catch((e) => setError('Chyba při načítání rezervací'));
  }, []);

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

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
