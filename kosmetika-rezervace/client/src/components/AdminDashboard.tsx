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

const drawerWidth = 240;

const menu = [
  { key: 'calendar', label: 'Rezervace', icon: <CalendarMonthIcon /> },
  { key: 'clients', label: 'Klientky', icon: <PeopleIcon /> },
  {
    key: 'adminnew',
    label: 'Vytvořit rezervaci',
    icon: <CalendarMonthIcon />,
  },
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
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedReservation && closeBtnRef.current) {
      closeBtnRef.current.focus();
      // Debug: zobrazit data rezervace v konzoli
      // eslint-disable-next-line no-console
      console.log('selectedReservation', selectedReservation);
    }
  }, [selectedReservation]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDeleteReservation = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setSelectedReservation(null);
    setCalendarKey((k) => k + 1);
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
            onEventClick={setSelectedReservation}
          />
        )}
        {section === 'services' && <AdminServices />}
        {section === 'blocked' && <AdminBlockedTimes />}
        {section === 'adminnew' && (
          <AdminNewAppointment onCreated={() => setSection('calendar')} />
        )}

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
                  {new Date(selectedReservation.date).toLocaleString()}
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
              color="error"
              onClick={() => handleDeleteReservation(selectedReservation._id)}
            >
              Smazat rezervaci
            </MuiButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
