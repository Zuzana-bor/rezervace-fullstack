import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

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
    <div style={{ padding: '2rem' }}>
      <h2>Registrace</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
        <br />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <br />
        <button type="submit">Registrovat</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Už máš účet? <Link to="/login">Přihlas se</Link>
      </p>
    </div>
  );
};

export default Register;
