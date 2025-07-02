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
import axios from 'axios';

const AdminBlockedTimes = () => {
  const [times, setTimes] = useState([]);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const fetchTimes = () => {
    const token = localStorage.getItem('token');
    axios
      .get('/api/blocked-times', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setTimes(r.data));
  };

  useEffect(() => {
    fetchTimes();
  }, []);

  const handleAdd = async () => {
    const token = localStorage.getItem('token');
    await axios.post(
      '/api/blocked-times',
      { date, note },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setDate('');
    setNote('');
    fetchTimes();
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/blocked-times/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTimes();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Blokované časy
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Datum a čas</TableCell>
              <TableCell>Poznámka</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {times.map((b: any) => (
              <TableRow key={b._id}>
                <TableCell>{new Date(b.date).toLocaleString()}</TableCell>
                <TableCell>{b.note}</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => handleDelete(b._id)}>
                    Smazat
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ mt: 3 }}>
        Přidat blokovaný čas
      </Typography>
      <TextField
        label="Datum a čas"
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        sx={{ mr: 2 }}
      />
      <TextField
        label="Poznámka"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        sx={{ mr: 2 }}
      />
      <Button variant="contained" onClick={handleAdd} disabled={!date}>
        Přidat
      </Button>
    </Paper>
  );
};

export default AdminBlockedTimes;
