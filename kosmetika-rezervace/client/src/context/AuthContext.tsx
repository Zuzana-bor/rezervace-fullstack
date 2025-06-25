import React from 'react';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Typ pro uživatele
type User = {
  email: string;
  name: string;
};

// 2️⃣ Typ pro hodnotu contextu
type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
};

// 3️⃣ Výchozí hodnota contextu
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4️⃣ Provider komponenta
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Načti uživatele z localStorage při načtení
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Ulož do localStorage při změně
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (email: string, name: string) => {
    setUser({ email, name });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 5️⃣ Hook na snadné použití
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
