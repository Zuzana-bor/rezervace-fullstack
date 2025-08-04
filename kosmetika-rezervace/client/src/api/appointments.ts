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
  const res = await axiosInstance.get(`/admin/appointments/user/${userId}`);
  return Array.isArray(res.data) ? res.data : res.data.appointments;
};

export const updateAppointmentAdmin = async (
  appointmentId: string,
  data: {
    date: string;
    service: string;
    firstName?: string;
    lastName?: string;
    clientPhone?: string;
  },
): Promise<void> => {
  await axiosInstance.put(`/admin/appointments/${appointmentId}`, data);
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

export const createAppointmentAdmin = async ({
  date,
  service,
  firstName,
  lastName,
  clientPhone,
}: {
  date: string;
  service: string;
  firstName: string;
  lastName: string;
  clientPhone: string;
}) => {
  await axiosInstance.post('/admin/appointments', {
    date,
    service,
    firstName,
    lastName,
    clientPhone,
  });
};
