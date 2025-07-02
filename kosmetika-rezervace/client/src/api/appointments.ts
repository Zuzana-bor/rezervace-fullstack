// src/api/appointments.ts
import axiosInstance from './axios';

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
  const res = await axiosInstance.get('/appointments/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return Array.isArray(res.data) ? res.data : res.data.appointments;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const token = getToken();
  await axiosInstance.delete(`/appointments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createAppointment = async ({
  date,
  service,
}: {
  date: string;
  service: string;
}) => {
  const token = getToken();
  await axiosInstance.post(
    '/appointments/me',
    { date, service },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};
