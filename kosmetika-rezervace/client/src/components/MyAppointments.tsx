import { List, ListItem, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const { token } = useAuth(); // získáme token

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token'); // 👈 ujisti se, že token existuje
        const res = await axios.get(
          'http://localhost:5000/api/appointments/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setAppointments(res.data);
      } catch (err: any) {
        setError(err.message);
        console.error('Chyba při načítání:', err);
      }
    };

    fetchAppointments();
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
