import React from 'react';
import { useState } from 'react';

export function HelloUser() {
  const [name, setName] = useState('');

  return (
    <div>
      <h2>Ahoj, {name || 'neznámý uživateli'}!</h2>
      <input
        type="text"
        placeholder="Zadej své jméno"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
}
