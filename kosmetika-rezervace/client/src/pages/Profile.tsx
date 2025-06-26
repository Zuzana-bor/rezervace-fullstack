import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Box } from '@mui/material';
import MyAppointments from '../components/MyAppointments';
import NewAppointment from '../components/NewAppointment';


const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <p>Nejsi přihlášená.</p>;
  }

  return ( <Container>
 
    <Typography variant="h4" gutterBottom>Profil uživatele
      Jméno: {user.name}
      Email: {user.email}</Typography>
      <button onClick={logout}>Odhlásit se</button>
<Box mb={4}>
 <Typography variant="h6">Moje rezervace</Typography>
        <MyAppointments />
</Box>
 <Box>
        <Typography variant="h6">Nová rezervace</Typography>
        <NewAppointment />
      </Box>

  </Container>
  );
};

export default Profile;
