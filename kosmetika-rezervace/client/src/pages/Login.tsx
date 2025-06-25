import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes('@')) {
      alert('Zadej platný e-mail');
      return;
    }

    if (name.trim() === '') {
      alert('Zadej jméno');
      return;
    }

    login(email, name); // zavolá login z AuthContextu
    navigate('/profile'); // přesměrování
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Přihlášení
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Přihlásit se
        </Button>
      </form>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Nemáš účet?{' '}
        <Link
          to="/register"
          style={{ textDecoration: 'none', color: '#1976d2' }}
        >
          Zaregistruj se
        </Link>
      </Typography>
    </Box>
  );
};

export default Login;
