import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../api/axios'

interface User {
  id: number;
  nombre: string;
  correo: string;
  tfaEnabled?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (accessToken: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  logoutAllDevices: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (storedUser && token) {
        try {
          await api.get('/auth/verify');
          
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.log("Sesión inválida al iniciar.");
          localStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error("Error al cerrar sesión en servidor", error);
    } finally {
      localStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logoutAllDevices = async () => {
    try {
      await api.post('/auth/revoke-all');
      
      localStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      alert("Has cerrado sesión en todos los dispositivos correctamente.");
    } catch (error) {
      console.error("Error al revocar sesiones", error);
      alert("Hubo un error al intentar cerrar las sesiones remotas.");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, logoutAllDevices }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};