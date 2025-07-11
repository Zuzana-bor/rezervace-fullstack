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
import { getBlockedTimes } from '../api/blockedTimes';
import axios from 'axios';

const AdminBlockedTimes = () => {
  const [times, setTimes] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [note, setNote] = useState('');

  const fetchTimes = () => {
    getBlockedTimes().then(setTimes);
  };

  useEffect(() => {
    fetchTimes();
  }, []);

  const handleAdd = async () => {
    let startVal = start;
    let endVal = end;
    if (allDay && start) {
      // Nastav čas od 00:00 do 23:59 pro vybraný den
      const date = new Date(start);
      startVal = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      endVal = new Date(date.setHours(23, 59, 59, 999)).toISOString();
    }
    const token = localStorage.getItem('token');
    await axios.post(
      '/api/blocked-times',
      { start: startVal, end: endVal, allDay, note },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setStart('');
    setEnd('');
    setAllDay(false);
    setNote('');
    fetchTimes();
  };

  // Při přepnutí na celý den smaž pole Do
  const handleAllDayToggle = () => {
    setAllDay((prev) => {
      if (!prev) setEnd('');
      return !prev;
    });
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
              <TableCell>Od</TableCell>
              <TableCell>Do</TableCell>
              <TableCell>Celý den</TableCell>
              <TableCell>Poznámka</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {times.map((b: any) => (
              <TableRow key={b._id}>
                <TableCell>
                  {b.allDay
                    ? new Date(b.start).toLocaleDateString()
                    : new Date(b.start).toLocaleString()}
                </TableCell>
                <TableCell>
                  {b.allDay
                    ? new Date(b.end).toLocaleDateString()
                    : new Date(b.end).toLocaleString()}
                </TableCell>
                <TableCell>{b.allDay ? 'Ano' : 'Ne'}</TableCell>
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
        label="Od"
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        sx={{ mr: 2 }}
      />
      <TextField
        label="Do"
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        sx={{ mr: 2 }}
      />
      <Button
        variant="outlined"
        onClick={handleAllDayToggle}
        sx={{ mr: 2 }}
        color={allDay ? 'success' : 'primary'}
      >
        {allDay ? 'Celý den: ANO' : 'Celý den: NE'}
      </Button>
      <TextField
        label="Poznámka"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        sx={{ mr: 2 }}
      />
      <Button
        variant="contained"
        onClick={async () => {
          try {
            await handleAdd();
          } catch (err) {
            alert(
              'Chyba při přidávání blokovaného času: ' +
                (err instanceof Error ? err.message : String(err)),
            );
          }
        }}
        disabled={!start || (!end && !allDay)}
      >
        Přidat
      </Button>
      {/* Zobrazit chybovou hlášku pokud je tlačítko disabled */}
      {(!start || (!end && !allDay)) && (
        <Typography color="error" sx={{ mt: 1 }}>
          Vyplňte pole Od a Do (nebo zaškrtněte Celý den).
        </Typography>
      )}
    </Paper>
  );
};

export default AdminBlockedTimes;
