import axiosInstance from './axios';

export type AdminAppointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
  duration?: number;
  userId?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  clientPhone?: string;
};

export const getAllAppointments = async (): Promise<AdminAppointment[]> => {
  const res = await axiosInstance.get('/admin/appointments');
  return Array.isArray(res.data) ? res.data : res.data.appointments;
};
