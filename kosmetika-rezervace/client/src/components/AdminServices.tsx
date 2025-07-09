import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
} from '@mui/material';
import { getServices } from '../api/services';
import axiosInstance from '../api/axios';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  const fetchServices = () => {
    getServices().then(setServices);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAdd = async () => {
    const token = localStorage.getItem('token');
    await axiosInstance.post(
      '/services',
      { name, price: Number(price), duration: Number(duration) },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setName('');
    setPrice('');
    setDuration('');
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    await axiosInstance.delete(`/services/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchServices();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Služby
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Název</TableCell>
              <TableCell>Cena</TableCell>
              <TableCell>Délka</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((s: any) => (
              <TableRow key={s._id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.price} Kč</TableCell>
                <TableCell>{s.duration} min</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => handleDelete(s._id)}>
                    Smazat
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ mt: 3 }}>
        Přidat službu
      </Typography>
      <TextField
        label="Název"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mr: 2 }}
      />
      <TextField
        label="Cena"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="number"
        sx={{ mr: 2 }}
      />
      <TextField
        label="Délka (min)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        type="number"
        sx={{ mr: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleAdd}
        disabled={!name || !price || !duration}
      >
        Přidat
      </Button>
    </Paper>
  );
};

export default AdminServices;
