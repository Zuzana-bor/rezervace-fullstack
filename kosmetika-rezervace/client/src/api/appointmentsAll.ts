import axiosInstance from './axios';

export type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
  duration?: number;
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
  const res = await axiosInstance.get('/admin/appointments');
  return Array.isArray(res.data) ? res.data : res.data.appointments;
};
