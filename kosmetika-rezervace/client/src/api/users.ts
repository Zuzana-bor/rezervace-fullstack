import axiosInstance from './axios';

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
};

function getToken() {
  return localStorage.getItem('token');
}

export const getUsers = async () => {
  const token = getToken();
  const res = await axiosInstance.get('/admin/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
