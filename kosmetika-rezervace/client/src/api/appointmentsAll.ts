import axios from 'axios';

export type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
  duration?: number;
};

export async function getAllAppointments(): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const res = await axios.get('/api/appointments', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
