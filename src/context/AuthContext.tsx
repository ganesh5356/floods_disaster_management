import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('floodUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: User) => {
    // Save immediately
    let baseUser = userData;

    // If location was captured pre-login, attach it immediately
    try {
      const pre = localStorage.getItem('preLoginLocation');
      if (pre) {
        const { lat, lng } = JSON.parse(pre);
        baseUser = {
          ...baseUser,
          permissions: { ...baseUser.permissions, location: true },
          location: [lat, lng],
        } as User;
        localStorage.removeItem('preLoginLocation');
      }
    } catch {}

    setUser(baseUser);
    localStorage.setItem('floodUser', JSON.stringify(baseUser));

    // Attempt to get location permission and coordinates
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const updated: User = {
            ...baseUser,
            permissions: { ...userData.permissions, location: true },
            location: [position.coords.latitude, position.coords.longitude],
          };
          setUser(updated);
          localStorage.setItem('floodUser', JSON.stringify(updated));
        },
        () => {
          const updated: User = {
            ...baseUser,
            permissions: { ...userData.permissions, location: false },
          };
          setUser(updated);
          localStorage.setItem('floodUser', JSON.stringify(updated));
        }
      );
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('floodUser');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
