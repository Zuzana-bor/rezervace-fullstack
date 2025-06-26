// src/api/appointments.ts
import axios from 'axios';

export type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
};

export const getMyAppointments = async (): Promise<Appointment[]> => {
  const res = await axios.get('/api/appointments/me');
  console.log('API odpověď:', res.data);

  // Zde jedna z možností:
  return res.data.appointments; // NEBO přímo res.data pokud je to pole
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await axios.delete(`/api/appointments/${id}`);
};