import axiosInstance from './axios';

export const getGoSmsCredit = async (): Promise<number> => {
  const token = localStorage.getItem('token');
  const res = await axiosInstance.get('/admin/gosms-credit', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.credit;
};
