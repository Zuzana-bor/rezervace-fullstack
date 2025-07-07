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
  Box,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import { getUsers } from '../api/users';

const AdminClients = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then((data) =>
      setUsers(data.filter((u: any) => u.role === 'user')),
    );
  }, []);

  return (
    <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.95)', borderRadius: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, color: '#2f6c3a', fontWeight: 700 }}
      >
        Klientky
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <PersonIcon
                  sx={{ verticalAlign: 'middle', color: '#2f6c3a' }}
                />{' '}
                Jméno a příjmení
              </TableCell>
              <TableCell>
                <EmailIcon sx={{ verticalAlign: 'middle', color: '#2f6c3a' }} />{' '}
                E-mail
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell sx={{ fontWeight: 500 }}>
                  {u.firstName} {u.lastName}
                </TableCell>
                <TableCell>{u.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {users.length === 0 && (
        <Box sx={{ mt: 3, color: '#888' }}>
          Žádné klientky nejsou registrovány.
        </Box>
      )}
    </Paper>
  );
};

export default AdminClients;
