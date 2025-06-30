// src/api/appointments.ts
import axios from 'axios';

export type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
};

// Pomocná funkce pro získání tokenu
function getToken() {
  return localStorage.getItem('token');
}

export const getMyAppointments = async (): Promise<Appointment[]> => {
  const token = getToken();
  const res = await axios.get('/api/appointments/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('API odpověď:', res.data);
  return Array.isArray(res.data) ? res.data : res.data.appointments;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const token = getToken();
  await axios.delete(`/api/appointments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
