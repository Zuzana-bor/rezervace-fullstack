// src/components/NewAppointment.tsx
import { Button, MenuItem, TextField, Stack } from '@mui/material';
import { useState } from 'react';

const NewAppointment = () => {
  const [date, setDate] = useState('');
  const [service, setService] = useState('');

  const handleSubmit = () => {
    console.log('Nová rezervace:', { date, service });
    // TODO: odeslat na backend
  };

  return (
    <Stack spacing={2} mt={2}>
      <TextField
        label="Datum a čas"
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Služba"
        select
        value={service}
        onChange={(e) => setService(e.target.value)}
      >
        <MenuItem value="Kosmetika – hloubkové čištění">
          Kosmetika – hloubkové čištění
        </MenuItem>
        <MenuItem value="Masáž obličeje">Masáž obličeje</MenuItem>
      </TextField>

      <Button
  type="submit"
  variant="contained"
  fullWidth
  sx={{
    mt: 2,
    backgroundColor: '#2f6c3a',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#265a32',
    },
  }}
>
  Objednat se
</Button>
    </Stack>
  );
};

export default NewAppointment;