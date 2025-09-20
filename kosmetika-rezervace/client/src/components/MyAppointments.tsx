import { getMyAppointments } from '../api/appointments';
import { useEffect, useState } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

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

const MyAppointments = ({ appointments, error }: MyAppointmentsProps) => {
  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <List>
      {appointments &&
        appointments.map((app) => (
          <ListItem key={app._id}>
            <ListItemText
              primary={`${format(
                new Date(app.date),
                "dd. MMMM yyyy 'v' HH:mm",
                { locale: cs },
              )} – ${app.service}`}
              secondary={`Cena: ${app.price} Kč`}
            />
          </ListItem>
        ))}
    </List>
  );
};

export default MyAppointments;
