import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
} from '@mui/material';
import axiosInstance from '../api/axios';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.includes('@')) {
      alert('Zadej platný e-mail');
      return;
    }
    if (form.password === '') {
      alert('Zadej heslo');
      return;
    }
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      // Uložit uživatele a token do AuthContextu
      login(
        {
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
        },
        response.data.token,
      );
      navigate('/profile');
    } catch (error) {
      alert('Chyba při přihlášení. Zkontrolujte e-mail a heslo.');
    }
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)', // výška viewportu mínus navbar
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: `linear-gradient(to bottom right, #f9f7f4, #ffffff)`,
        backgroundImage: `url(https://www.transparenttextures.com/patterns/paper-fibers.png)`,
        backgroundRepeat: 'repeat',
        px: 2,
        pt: 8, // prostor pod navbar
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 4,
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontFamily: 'Playfair Display, serif', color: '#2f6c3a' }}
          >
            Přihlášení
          </Typography>
          <form onSubmit={handleSubmit}>
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
              Přihlásit se
            </Button>
          </form>
          <Typography variant="body2" sx={{ mt: 3 }}>
            Nemáš účet?{' '}
            <Link
              to="/register"
              style={{
                textDecoration: 'none',
                color: '#2f6c3a',
                fontWeight: 600,
              }}
            >
              Zaregistruj se
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
