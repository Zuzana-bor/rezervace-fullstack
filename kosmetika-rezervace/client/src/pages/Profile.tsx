import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import MyAppointments from '../components/MyAppointments';
import NewAppointment from '../components/NewAppointment';
import AdminDashboard from '../components/AdminDashboard';

// Import the Appointment type from the API to ensure type compatibility
import type { Appointment } from '../api/appointments';

const Profile = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');

  // Funkce pro načtení rezervací
  const refreshAppointments = async () => {
    try {
      const data = await import('../api/appointments').then((m) =>
        m.getMyAppointments(),
      );
      console.log('✅ Loaded appointments:', data);
      setAppointments(data);
      setError('');
    } catch (err) {
      console.error('❌ Error loading appointments:', err);
      setError('Chyba při načítání rezervací. Jste přihlášeni?');
    }
  };

  useEffect(() => {
    refreshAppointments();
  }, [user]);

  if (!user) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(to bottom right, #f9f7f4, #ffffff)`,
          backgroundImage: `url(https://www.transparenttextures.com/patterns/paper-fibers.png)`,
          backgroundRepeat: 'repeat',
        }}
      >
        <Typography variant="h6">Nejsi přihlášená.</Typography>
      </Box>
    );
  }

  // Pokud je admin, zobraz dashboard
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <Box
      sx={{
        height: '100vh',
        background: `linear-gradient(to bottom right, #f9f7f4, #ffffff)`,
        backgroundImage: `url(https://www.transparenttextures.com/patterns/paper-fibers.png)`,
        backgroundRepeat: 'repeat',
        px: 2,
        pt: '64px', // výška navbaru
        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          height: 'calc(100vh - 600px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 4,
            backdropFilter: 'blur(6px)',
            border: '1px solid #e0e0e0',
            p: { xs: 2, md: 4 },
          }}
        >
          {/* Hlavička s menším tlačítkem vedle */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2,
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Playfair Display, serif',
                color: '#2f6c3a',
              }}
            >
              Dobrý den, {user.firstName} {user.lastName}
            </Typography>

            <Button
              variant="outlined"
              onClick={logout}
              size="small"
              sx={{
                borderColor: '#c8aa3d',
                color: '#2f6c3a',
                fontSize: '0.85rem',
                px: 2,
                py: 0.5,
                height: '36px',
                '&:hover': {
                  backgroundColor: '#f4f4f4',
                  borderColor: '#2f6c3a',
                },
              }}
            >
              Odhlásit se
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Scrollovatelná část rezervací */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              pr: 1,
              minHeight: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: '#2f6c3a', mb: 2, fontWeight: 600 }}
            >
              Moje rezervace
            </Typography>
            <MyAppointments appointments={appointments} error={error} />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Nová rezervace */}
          <Box sx={{ flexShrink: 0 }}>
            <Typography
              variant="h6"
              sx={{ color: '#2f6c3a', mb: 2, fontWeight: 600 }}
            >
              Nová rezervace
            </Typography>
            <NewAppointment onCreated={refreshAppointments} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
