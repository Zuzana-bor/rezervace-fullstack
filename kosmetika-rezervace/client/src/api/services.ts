import axiosInstance from './axios';

export type Service = {
  _id: string;
  name: string;
  price: number;
  duration: number; // délka služby v minutách
};

export const getServices = async () => {
  const res = await axiosInstance.get('/services');
  return res.data;
};
