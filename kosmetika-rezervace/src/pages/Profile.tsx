import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Vítej, {user?.name}!</h1>
      <button onClick={logout}>Odhlásit</button>
    </div>
  );
};

export default Profile;
