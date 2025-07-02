import axiosInstance from './axios';

export type BlockedTime = {
  _id: string;
  start: string;
  end: string;
  allDay: boolean;
  note?: string;
};

function getToken() {
  return localStorage.getItem('token');
}

export const getBlockedTimes = async () => {
  const token = getToken();
  const res = await axiosInstance.get('/blocked-times', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
