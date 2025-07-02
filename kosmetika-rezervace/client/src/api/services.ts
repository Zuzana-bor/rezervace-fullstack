import axios from 'axios';

export type Service = {
  _id: string;
  name: string;
  price: number;
  duration: number; // délka služby v minutách
};

export async function getAllServices(): Promise<Service[]> {
  const res = await axios.get('/api/services', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
}
