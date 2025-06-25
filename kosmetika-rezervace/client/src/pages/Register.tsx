import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const Register = () => {
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

    login(email, name); // ve skutečné appce by tu bylo volání backendu
    navigate('/profile');
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Registrace
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
          Registrovat{' '}
        </Button>
      </form>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Už máš účet?
        <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
          Přihlas se
        </Link>
      </Typography>
    </Box>
  );
};

export default Register;
