import axios from 'axios';

export type BlockedTime = {
  _id: string;
  start: string;
  end: string;
  allDay: boolean;
  note?: string;
};

export async function getBlockedTimes(): Promise<BlockedTime[]> {
  const token = localStorage.getItem('token');
  const res = await axios.get('/api/blocked-times', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
