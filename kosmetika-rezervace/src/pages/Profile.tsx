import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <p>Nejsi přihlášená.</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Profil uživatele</h2>
      <p>Jméno: {user.name}</p>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Odhlásit se</button>
    </div>
  );
};

export default Profile;
