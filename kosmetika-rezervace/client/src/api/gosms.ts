import axiosInstance from './axios';

export const getGoSmsCredit = async (): Promise<number> => {
  const res = await axiosInstance.get('/admin/gosms-credit');
  return res.data.credit;
};
