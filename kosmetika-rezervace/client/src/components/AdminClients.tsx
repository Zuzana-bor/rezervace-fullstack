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
  TextField,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import { getUsers } from '../api/users';

const AdminClients = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchValue, setSearchValue] = useState<any>(null);

  useEffect(() => {
    getUsers().then((data) => {
      const clientUsers = data.filter((u: any) => u.role === 'user');
      setUsers(clientUsers);
      setFilteredUsers(clientUsers);
    });
  }, []);

  // Funkce pro vyhledávání
  const handleSearchChange = (event: any, newValue: any) => {
    setSearchValue(newValue);

    if (!newValue || newValue === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user: any) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const searchTerm =
          typeof newValue === 'string'
            ? newValue.toLowerCase()
            : newValue.label?.toLowerCase() || '';
        return (
          fullName.includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.includes(searchTerm)
        );
      });
      setFilteredUsers(filtered);
    }
  };

  // Vytvoření options pro Autocomplete
  const searchOptions = users.map((user: any) => ({
    label: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone,
    user: user,
  }));

  return (
    <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.95)', borderRadius: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, color: '#2f6c3a', fontWeight: 700 }}
      >
        Klientky
      </Typography>

      {/* Vyhledávací pole */}
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          freeSolo
          options={searchOptions}
          value={searchValue}
          onChange={handleSearchChange}
          onInputChange={(event, newInputValue) => {
            handleSearchChange(event, newInputValue);
          }}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : option.label || ''
          }
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {option.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.email} {option.phone && `• ${option.phone}`}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Vyhledat klientku podle jména, e-mailu nebo telefonu..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: 'white',
                  },
                },
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#2f6c3a' }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Box>

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
              <TableCell>Telefon</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell sx={{ fontWeight: 500 }}>
                  {u.firstName} {u.lastName}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone || ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredUsers.length === 0 && users.length > 0 && (
        <Box sx={{ mt: 3, color: '#888', textAlign: 'center' }}>
          Žádné klientky nenalezeny pro zadané kritérium.
        </Box>
      )}
      {users.length === 0 && (
        <Box sx={{ mt: 3, color: '#888', textAlign: 'center' }}>
          Žádné klientky nejsou registrovány.
        </Box>
      )}
    </Paper>
  );
};

export default AdminClients;
