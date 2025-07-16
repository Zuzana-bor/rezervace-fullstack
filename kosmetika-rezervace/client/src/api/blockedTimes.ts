import axiosInstance from './axios';

export type BlockedTime = {
  _id: string;
  start: string;
  end: string;
  allDay: boolean;
  note?: string;
};

export const getBlockedTimes = async () => {
  const res = await axiosInstance.get('/blocked-times');
  return res.data;
};
