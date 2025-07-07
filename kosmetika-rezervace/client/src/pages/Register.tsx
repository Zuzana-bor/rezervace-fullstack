import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import axiosInstance from '../api/axios';

export type User = {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  // ...other properties
};

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.includes('@')) {
      alert('Zadej platný e-mail');
      return;
    }

    if (form.firstName.trim() === '') {
      alert('Zadej jméno');
      return;
    }
    if (form.lastName.trim() === '') {
      alert('Zadej příjmení');
      return;
    }

    if (form.password.trim() === '') {
      alert('Zadej heslo');
      return;
    }

    try {
      console.log('Odesílám data:', form); // Debug: vypiš odesílaná data
      const response = await axiosInstance.post('/auth/register', form);
      setMessage(response.data.message);
      login(
        {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          password: '',
        },
        response.data.token,
      );
      navigate('/profile');
    } catch (error) {
      console.error('Chyba při registraci:', error);
      setMessage(
        'Chyba při registraci. Zkontrolujte, že backend běží a endpoint je správný.',
      );
    }
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: `linear-gradient(to bottom right, #f9f7f4, #ffffff)`,
        backgroundImage: `url(https://www.transparenttextures.com/patterns/paper-fibers.png)`,
        backgroundRepeat: 'repeat',
        px: 2,
        pt: 8,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 4,
            backdropFilter: 'blur(6px)',
            border: '1px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontFamily: 'Playfair Display, serif', color: '#2f6c3a' }}
          >
            Registrace
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Jméno"
              name="firstName"
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, [e.target.name]: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Příjmení"
              name="lastName"
              value={form.lastName}
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
              label="Heslo"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, [e.target.name]: e.target.value })
              }
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: '#2f6c3a',
                '&:hover': { backgroundColor: '#265a32' },
              }}
            >
              Registrovat
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3 }}>
            Už máš účet?{' '}
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                color: '#2f6c3a',
                fontWeight: 600,
              }}
            >
              Přihlas se
            </Link>
          </Typography>

          {message && (
            <Typography variant="body2" sx={{ mt: 2, color: '#d32f2f' }}>
              {message}
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
