// src/api/appointments.ts
import axiosInstance from './axios';

export type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
};

export const getMyAppointments = async (): Promise<Appointment[]> => {
  const res = await axiosInstance.get('/appointments/me');
  return Array.isArray(res.data) ? res.data : res.data.appointments;
};

export const getUserAppointments = async (
  userId: string,
): Promise<Appointment[]> => {
  // Použije /me endpoint s query parametrem userId
  const res = await axiosInstance.get(`/appointments/me?userId=${userId}`);
  return Array.isArray(res.data) ? res.data : res.data.appointments;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/appointments/${id}`);
};

export const createAppointment = async ({
  date,
  service,
}: {
  date: string;
  service: string;
}) => {
  await axiosInstance.post('/appointments/me', { date, service });
};
