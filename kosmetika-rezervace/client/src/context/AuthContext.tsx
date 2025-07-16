import React from 'react';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Typ pro uživatele
export type User = {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role?: string;
};

// 2️⃣ Typ pro hodnotu contextu
export type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

// 3️⃣ Výchozí hodnota contextu
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4️⃣ Provider komponenta
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Načti uživatele a token z localStorage při načtení
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Chyba při načítání z localStorage:', error);
      // Vymaž poškozená data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  // Ulož uživatele a token do localStorage při změně
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    // localStorage se automaticky aktualizuje přes useEffect
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!(user && token);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAuthenticated }}
    >
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
