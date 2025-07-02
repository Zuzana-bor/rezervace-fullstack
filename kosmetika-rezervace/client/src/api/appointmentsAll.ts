import axiosInstance from './axios';

export type Appointment = {
  _id: string;
  date: string;
  service: string;
  price: number;
  duration?: number;
};

// Pomocná funkce pro získání tokenu
function getToken() {
  return localStorage.getItem('token');
}

export const getAllAppointments = async (): Promise<Appointment[]> => {
  const token = getToken();
  const res = await axiosInstance.get('/appointments/all', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return Array.isArray(res.data) ? res.data : res.data.appointments;
};
