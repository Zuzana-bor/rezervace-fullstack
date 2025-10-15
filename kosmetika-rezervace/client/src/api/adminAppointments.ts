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
