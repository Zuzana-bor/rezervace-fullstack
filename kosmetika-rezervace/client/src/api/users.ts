import axiosInstance from './axios';

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
};

export const getUsers = async () => {
  const res = await axiosInstance.get('/admin/users');
  return res.data;
};
