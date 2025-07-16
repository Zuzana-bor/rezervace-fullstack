import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Toolbar,
  AppBar,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BuildIcon from '@mui/icons-material/Build';
import BlockIcon from '@mui/icons-material/Block';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import AdminClients from './AdminClients';
import AdminCalendar from './AdminCalendar';
import AdminServices from './AdminServices';
import AdminBlockedTimes from './AdminBlockedTimes';
import AdminNewAppointment from './AdminNewAppointment';
import { getGoSmsCredit } from '../api/gosms';
import axiosInstance from '../api/axios';

const drawerWidth = 240;

const menu = [
  { key: 'calendar', label: 'Rezervace', icon: <CalendarMonthIcon /> },
  { key: 'clients', label: 'Klientky', icon: <PeopleIcon /> },
  { key: 'services', label: 'Služby', icon: <BuildIcon /> },
  { key: 'blocked', label: 'Blokované časy', icon: <BlockIcon /> },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [section, setSection] = useState('calendar');
  const [selectedReservation, setSelectedReservation] = useState<any | null>(
    null,
  );
  const [calendarKey, setCalendarKey] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editReservation, setEditReservation] = useState<any>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<string | null>(
    null,
  );
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [gosmsCredit, setGosmsCredit] = useState<number | null>(null);

  useEffect(() => {
    if (selectedReservation && closeBtnRef.current) {
      closeBtnRef.current.focus();
      // Debug: zobrazit data rezervace v konzoli
      // eslint-disable-next-line no-console
      console.log('selectedReservation', selectedReservation);
    }
  }, [selectedReservation]);

  useEffect(() => {
    if (user?.role === 'admin') {
      getGoSmsCredit()
        .then(setGosmsCredit)
        .catch(() => setGosmsCredit(null));
    }
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/appointments/${id}`);
      // Optimisticky odeber event z kalendáře (pokud by byl problém s refreshKey)
      setSelectedReservation(null);
      setCalendarKey((k) => k + 1);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Neznámá chyba';
      alert('Chyba při mazání rezervace: ' + errorMessage);
    }
  };

  const drawer = (
    <>
      <Toolbar />
      <List>
        {menu.map((item) => (
          <ListItemButton
            key={item.key}
            selected={section === item.key}
            onClick={() => {
              setSection(item.key);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, background: '#2f6c3a' }}>
        <Toolbar>
          {/* Hamburger menu pro mobil */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mr: 2 }}>
            <MenuIcon onClick={handleDrawerToggle} sx={{ cursor: 'pointer' }} />
          </Box>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Admin – {user?.firstName} {user?.lastName}
          </Typography>
          {gosmsCredit !== null && (
            <Typography
              variant="body2"
              sx={{
                mr: 2,
                color: gosmsCredit < 20 ? 'red' : 'inherit',
                fontWeight: 600,
              }}
            >
              GoSMS kredit: {gosmsCredit} Kč
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer' }}
            onClick={logout}
          >
            Odhlásit se
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Permanentní drawer pro desktop, temporary pro mobil */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: '#f9f7f4',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: '#f9f7f4',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: '#fff', p: 3, minHeight: '100vh' }}
      >
        <Toolbar />
        {section === 'clients' && <AdminClients />}
        {section === 'calendar' && (
          <AdminCalendar
            key={calendarKey}
            refreshKey={calendarKey}
            onEventClick={setSelectedReservation}
            onDateClick={(dateStr) => {
              // dateStr je v UTC, převedeme na lokální čas yyyy-MM-ddTHH:mm
              const d = new Date(dateStr);
              const pad = (n: number) => n.toString().padStart(2, '0');
              const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
                d.getDate(),
              )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
              setNewAppointmentDate(local);
              setNewAppointmentOpen(true);
            }}
          />
        )}
        {section === 'services' && <AdminServices />}
        {section === 'blocked' && <AdminBlockedTimes />}

        {/* Detail dialog rezervace */}
        <Dialog
          open={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
        >
          <DialogTitle>Detail rezervace</DialogTitle>
          <DialogContent>
            {selectedReservation && (
              <Box sx={{ minWidth: 300 }}>
                {(selectedReservation.clientFirstName ||
                  selectedReservation.clientLastName ||
                  (selectedReservation.userId &&
                    (selectedReservation.userId.firstName ||
                      selectedReservation.userId.lastName))) && (
                  <Typography>
                    <b>Jméno klientky:</b>{' '}
                    {selectedReservation.clientFirstName ||
                      selectedReservation.userId?.firstName ||
                      ''}{' '}
                    {selectedReservation.clientLastName ||
                      selectedReservation.userId?.lastName ||
                      ''}
                  </Typography>
                )}
                {selectedReservation.userId?.email && (
                  <Typography>
                    <b>E-mail:</b> {selectedReservation.userId.email}
                  </Typography>
                )}
                <Typography>
                  <b>Služba:</b> {selectedReservation.service}
                </Typography>
                <Typography>
                  <b>Cena:</b> {selectedReservation.price} Kč
                </Typography>
                <Typography>
                  <b>Čas rezervace:</b>{' '}
                  {selectedReservation.date &&
                    new Date(selectedReservation.date).toLocaleString('cs-CZ', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                </Typography>
                <Typography>
                  <b>Vytvořeno:</b>{' '}
                  {selectedReservation.createdAt
                    ? new Date(selectedReservation.createdAt).toLocaleString()
                    : ''}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <MuiButton
              ref={closeBtnRef}
              onClick={() => setSelectedReservation(null)}
            >
              Zavřít
            </MuiButton>
            <MuiButton
              color="primary"
              onClick={() => {
                setEditReservation(selectedReservation);
                setEditValues({
                  clientFirstName:
                    selectedReservation.clientFirstName ||
                    selectedReservation.userId?.firstName ||
                    '',
                  clientLastName:
                    selectedReservation.clientLastName ||
                    selectedReservation.userId?.lastName ||
                    '',
                  phone: selectedReservation.phone || '',
                  service: selectedReservation.service || '',
                  price: selectedReservation.price || '',
                  date: selectedReservation.date
                    ? new Date(selectedReservation.date)
                        .toISOString()
                        .slice(0, 16)
                    : '',
                });
                setEditDialogOpen(true);
              }}
            >
              Upravit
            </MuiButton>
            <MuiButton
              color="error"
              onClick={() => handleDeleteReservation(selectedReservation._id)}
            >
              Smazat rezervaci
            </MuiButton>
          </DialogActions>
        </Dialog>

        {/* Dialog pro úpravu rezervace */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Upravit rezervaci</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minWidth: 300,
              }}
            >
              <input
                type="text"
                placeholder="Jméno"
                value={editValues.clientFirstName}
                onChange={(e) =>
                  setEditValues((v: any) => ({
                    ...v,
                    clientFirstName: e.target.value,
                  }))
                }
              />
              <input
                type="text"
                placeholder="Příjmení"
                value={editValues.clientLastName}
                onChange={(e) =>
                  setEditValues((v: any) => ({
                    ...v,
                    clientLastName: e.target.value,
                  }))
                }
              />
              <input
                type="text"
                placeholder="Telefon"
                value={editValues.phone}
                onChange={(e) =>
                  setEditValues((v: any) => ({ ...v, phone: e.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Služba"
                value={editValues.service}
                onChange={(e) =>
                  setEditValues((v: any) => ({ ...v, service: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Cena"
                value={editValues.price}
                onChange={(e) =>
                  setEditValues((v: any) => ({ ...v, price: e.target.value }))
                }
              />
              <input
                type="datetime-local"
                placeholder="Datum a čas"
                value={editValues.date}
                onChange={(e) =>
                  setEditValues((v: any) => ({ ...v, date: e.target.value }))
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <MuiButton onClick={() => setEditDialogOpen(false)}>
              Zrušit
            </MuiButton>
            <MuiButton
              variant="contained"
              onClick={async () => {
                try {
                  await axiosInstance.put(
                    `/admin/appointments/${editReservation._id}`,
                    {
                      clientFirstName: editValues.clientFirstName,
                      clientLastName: editValues.clientLastName,
                      phone: editValues.phone,
                      service: editValues.service,
                      price: editValues.price,
                      date: new Date(editValues.date).toISOString(),
                    },
                  );
                  setEditDialogOpen(false);
                  setSelectedReservation(null);
                  setCalendarKey((k) => k + 1);
                } catch (error: any) {
                  const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    'Neznámá chyba';
                  alert('Chyba při úpravě rezervace: ' + errorMessage);
                }
              }}
              disabled={
                !editValues.clientFirstName ||
                !editValues.clientLastName ||
                !editValues.service ||
                !editValues.date
              }
            >
              Uložit změny
            </MuiButton>
          </DialogActions>
        </Dialog>

        {/* Dialog pro novou rezervaci */}
        {newAppointmentOpen && (
          <Dialog
            open={newAppointmentOpen}
            onClose={() => setNewAppointmentOpen(false)}
          >
            <DialogTitle>Nová rezervace</DialogTitle>
            <DialogContent>
              <AdminNewAppointment
                onCreated={() => {
                  setNewAppointmentOpen(false);
                  setCalendarKey((k) => k + 1);
                }}
                defaultDate={newAppointmentDate}
              />
            </DialogContent>
            <DialogActions>
              <MuiButton onClick={() => setNewAppointmentOpen(false)}>
                Zavřít
              </MuiButton>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
