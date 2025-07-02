import React, { useState } from 'react';
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
import { useAuth } from '../context/AuthContext';
import AdminClients from './AdminClients';
import AdminCalendar from './AdminCalendar';
import AdminServices from './AdminServices';
import AdminBlockedTimes from './AdminBlockedTimes';

const drawerWidth = 240;

const menu = [
  { key: 'clients', label: 'Klientky', icon: <PeopleIcon /> },
  { key: 'calendar', label: 'Rezervace', icon: <CalendarMonthIcon /> },
  { key: 'services', label: 'Služby', icon: <BuildIcon /> },
  { key: 'blocked', label: 'Blokované časy', icon: <BlockIcon /> },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [section, setSection] = useState('clients');
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [calendarKey, setCalendarKey] = useState(0);

  const handleDeleteReservation = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setSelectedReservation(null);
    setCalendarKey((k) => k + 1);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, background: '#2f6c3a' }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Admin – {user?.name}
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
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#f9f7f4',
          },
        }}
      >
        <Toolbar />
        <List>
          {menu.map((item) => (
            <ListItemButton
              key={item.key}
              selected={section === item.key}
              onClick={() => setSection(item.key)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
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

        {/* Detail dialog rezervace */}
        <Dialog open={!!selectedReservation} onClose={() => setSelectedReservation(null)}>
          <DialogTitle>Detail rezervace</DialogTitle>
          <DialogContent>
            {selectedReservation && (
              <Box sx={{ minWidth: 300 }}>
                <Typography><b>Jméno:</b> {selectedReservation.userId?.name}</Typography>
                <Typography><b>E-mail:</b> {selectedReservation.userId?.email}</Typography>
                <Typography><b>Služba:</b> {selectedReservation.service}</Typography>
                <Typography><b>Cena:</b> {selectedReservation.price} Kč</Typography>
                <Typography><b>Čas rezervace:</b> {new Date(selectedReservation.date).toLocaleString()}</Typography>
                <Typography><b>Vytvořeno:</b> {selectedReservation.createdAt ? new Date(selectedReservation.createdAt).toLocaleString() : ''}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <MuiButton onClick={() => setSelectedReservation(null)}>Zavřít</MuiButton>
            <MuiButton color="error" onClick={() => handleDeleteReservation(selectedReservation._id)}>Smazat rezervaci</MuiButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
