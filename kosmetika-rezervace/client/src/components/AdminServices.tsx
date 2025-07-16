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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { getServices } from '../api/services';
import axiosInstance from '../api/axios';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editService, setEditService] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');

  const fetchServices = () => {
    getServices().then(setServices);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAdd = async () => {
    await axiosInstance.post('/services', {
      name,
      price: Number(price),
      duration: Number(duration),
    });
    setName('');
    setPrice('');
    setDuration('');
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    await axiosInstance.delete(`/services/${id}`);
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
                  <Button
                    color="primary"
                    onClick={() => {
                      setEditService(s);
                      setEditName(s.name);
                      setEditPrice(s.price.toString());
                      setEditDuration(s.duration.toString());
                      setEditDialogOpen(true);
                    }}
                  >
                    Upravit
                  </Button>
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
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Upravit službu</DialogTitle>
        <DialogContent>
          <TextField
            label="Název"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mr: 2, mt: 2 }}
          />
          <TextField
            label="Cena"
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            sx={{ mr: 2, mt: 2 }}
          />
          <TextField
            label="Délka (min)"
            type="number"
            value={editDuration}
            onChange={(e) => setEditDuration(e.target.value)}
            sx={{ mr: 2, mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Zrušit</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await axiosInstance.put(`/services/${editService._id}`, {
                name: editName,
                price: Number(editPrice),
                duration: Number(editDuration),
              });
              setEditDialogOpen(false);
              fetchServices();
            }}
            disabled={!editName || !editPrice || !editDuration}
          >
            Uložit změny
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminServices;
