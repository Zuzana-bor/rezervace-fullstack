import React from 'react';
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

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6">Nejsi přihlášená.</Typography>
      </Box>
    );
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
    height: 'calc(100vh - 200px)', // výška viewportu - výška Navbaru
    display: 'flex',
    flexDirection: 'column',
  }}
>
       <Paper
    elevation={3}
    sx={{
      flex: 1, // zaplní celý Container
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderRadius: 4,
      backdropFilter: 'blur(6px)',
      border: '1px solid #e0e0e0',
      p: { xs: 2, md: 4 },
    }}
  >
          {/* Hlavička */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontFamily: 'Playfair Display, serif', color: '#2f6c3a' }}
            >
              Dobrý den, {user.name}
            </Typography>
            <Button
              variant="outlined"
              onClick={logout}
              sx={{
                borderColor: '#c8aa3d',
                color: '#2f6c3a',
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

          {/* Scrollovatelná sekce rezervací */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
              pr: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: '#2f6c3a', mb: 2, fontWeight: 600 }}
            >
              Moje rezervace
            </Typography>
            <MyAppointments />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Nová rezervace – přilepena dole */}
          <Box
            sx={{
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: '#2f6c3a', mb: 2, fontWeight: 600 }}
            >
              Nová rezervace
            </Typography>
            <NewAppointment />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;