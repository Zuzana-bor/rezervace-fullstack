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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PhoneIcon from '@mui/icons-material/Phone';
import { getUsers } from '../api/users';
import { getAllAppointments, Appointment } from '../api/appointmentsAll';
import { deleteAppointment } from '../api/appointments';
import { useToast } from '../context/ToastContext';
import AdminNewAppointment from './AdminNewAppointment';
import { format } from 'date-fns';
import cs from 'date-fns/locale/cs';

const AdminClients = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchValue, setSearchValue] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>(
    [],
  );
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

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

  // Otevření detailu klientky
  const handleClientClick = async (client: any) => {
    console.log('🔍 Vybraná klientka:', client); // Debug
    setSelectedClient(client);
    setShowClientDetail(true);
    try {
      const allAppointments = await getAllAppointments();
      console.log('📋 Všechny rezervace:', allAppointments); // Debug

      // Opravené filtrování rezervací pro danou klientku
      const clientAppointments = allAppointments.filter((apt: any) => {
        console.log('🔍 Porovnávám:', apt.userId, 'vs', client._id); // Debug

        // Kontrola různých formátů userId
        const userIdMatch =
          apt.userId?._id === client._id || // Pokud je userId objekt s _id
          apt.userId === client._id || // Pokud je userId přímo string
          apt.userId?.toString() === client._id.toString(); // String porovnání

        return userIdMatch;
      });

      console.log('✅ Rezervace klientky:', clientAppointments); // Debug
      setClientAppointments(clientAppointments);
    } catch (error) {
      console.error('❌ Chyba při načítání rezervací:', error);
      showToast('Chyba při načítání rezervací klientky', 'error');
      setClientAppointments([]);
    }
  };

  // Zavření detailu
  const handleCloseDetail = () => {
    setShowClientDetail(false);
    setSelectedClient(null);
    setClientAppointments([]);
    setEditingAppointment(null);
  };

  // Pomocná funkce pro načtení klientských rezervací (také opravit)
  const loadClientAppointments = async (clientId: string) => {
    const allAppointments = await getAllAppointments();
    return allAppointments.filter((apt: any) => {
      const userIdMatch =
        apt.userId?._id === clientId ||
        apt.userId === clientId ||
        apt.userId?.toString() === clientId.toString();

      return userIdMatch;
    });
  };

  // Smazání rezervace
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('Opravdu chcete smazat tuto rezervaci?')) {
      try {
        await deleteAppointment(appointmentId);
        const updatedAppointments = await loadClientAppointments(
          selectedClient._id,
        );
        setClientAppointments(updatedAppointments);
        showToast('Rezervace byla úspěšně smazána', 'success');
      } catch (error) {
        showToast('Chyba při mazání rezervace', 'error');
      }
    }
  };

  // Otevření formuláře pro novou rezervaci
  const handleNewAppointment = () => {
    setShowNewAppointment(true);
  };

  // Zavření formuláře pro novou rezervaci
  const handleCloseNewAppointment = () => {
    setShowNewAppointment(false);
  };

  // Po vytvoření nové rezervace
  const handleAppointmentCreated = async () => {
    setShowNewAppointment(false);
    if (selectedClient) {
      const updatedAppointments = await loadClientAppointments(
        selectedClient._id,
      );
      setClientAppointments(updatedAppointments);
    }
  };

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
              <TableRow
                key={u._id} // Oprava z u.id na u._id
                hover
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(47, 108, 58, 0.1)',
                  },
                }}
                onClick={() => handleClientClick(u)}
              >
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

      {/* Modal s detailem klientky */}
      <Dialog
        open={showClientDetail}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ color: '#2f6c3a' }} />
            <Typography variant="h6">
              {selectedClient?.firstName} {selectedClient?.lastName}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDetail}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Kontaktní informace */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2f6c3a' }}>
              Kontaktní údaje
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#666' }} />
                <Typography>{selectedClient?.email}</Typography>
              </Box>
              {selectedClient?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ color: '#666' }} />
                  <Typography>{selectedClient.phone}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Rezervace */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: '#2f6c3a' }}>
              Rezervace ({clientAppointments.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewAppointment}
              sx={{
                backgroundColor: '#2f6c3a',
                '&:hover': { backgroundColor: '#235231' },
              }}
            >
              Nová rezervace
            </Button>
          </Box>

          {clientAppointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3, color: '#666' }}>
              <CalendarTodayIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography>Klientka nemá žádné rezervace</Typography>
            </Box>
          ) : (
            <List>
              {clientAppointments.map((appointment: any) => (
                <ListItem
                  key={appointment._id}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: 'rgba(47, 108, 58, 0.05)',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <CalendarTodayIcon
                          sx={{ color: '#2f6c3a', fontSize: 20 }}
                        />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 500 }}
                        >
                          {appointment.service}
                        </Typography>
                        <Chip
                          label={`${appointment.price} Kč`}
                          size="small"
                          sx={{ backgroundColor: '#2f6c3a', color: 'white' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        📅{' '}
                        {format(
                          new Date(appointment.date),
                          "dd. MMMM yyyy 'v' HH:mm",
                          { locale: cs },
                        )}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal pro novou rezervaci */}
      {showNewAppointment && selectedClient && (
        <Dialog
          open={showNewAppointment}
          onClose={handleCloseNewAppointment}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Nová rezervace pro {selectedClient.firstName}{' '}
            {selectedClient.lastName}
          </DialogTitle>
          <DialogContent>
            <AdminNewAppointment
              onCreated={handleAppointmentCreated}
              prefilledClient={{
                firstName: selectedClient.firstName,
                lastName: selectedClient.lastName,
                phone: selectedClient.phone || '',
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Paper>
  );
};

export default AdminClients;
