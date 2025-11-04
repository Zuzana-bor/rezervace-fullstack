import { List, ListItem, ListItemText } from '@mui/material';
import { formatCzechTime } from '../utils/timezone';

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
              primary={`${formatCzechTime(app.date)} – ${app.service}`}
              secondary={`Cena: ${app.price} Kč`}
            />
          </ListItem>
        ))}
    </List>
  );
};

export default MyAppointments;
