import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.includes('@')) {
      alert('Zadej platný e-mail');
      return;
    }

    if (form.name.trim() === '') {
      alert('Zadej jméno');
      return;
    }
    try {
      // Pokud v index.ts máte app.use('/auth', authRoutes);
      const response = await axios.post(
        'http://localhost:5000/auth/register',
        form,
      );
      setMessage(response.data.message);
      login(form.email, form.name, form.password);
      navigate('/profile');
    } catch (error) {
      console.error('Chyba při registraci:', error);
      setMessage(
        'Chyba při registraci. Zkontrolujte, že backend běží a endpoint je správný.',
      );
    }
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
          name="name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
          margin="normal"
        />
        <TextField
          fullWidth
          label="E-mail"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
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
      {message && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          {message}{' '}
        </Typography>
      )}
    </Box>
  );
};

export default Register;
